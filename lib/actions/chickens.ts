"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import { ChickenStage } from "@/types/database";
import { generateBatchCode, localDateStr } from "@/lib/utils";

export async function createBatch(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const quantity = parseInt(formData.get("quantity") as string);
  const hatch_date = formData.get("hatch_date") as string;
  const stage = (formData.get("stage") as ChickenStage) || "starter";
  const notes = formData.get("notes") as string;
  const batch_code = formData.get("batch_code") as string || generateBatchCode();
  const breeder_gender = formData.get("breeder_gender") as string || null;

  const { error } = await supabase.from("chicken_batches").insert({
    batch_code,
    stage,
    quantity,
    hatch_date,
    stage_since: localDateStr(),
    breeder_gender: stage === "indukan" ? breeder_gender : null,
    notes: notes || null,
    user_id: session.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/chickens");
  revalidatePath("/");
  return { success: true };
}

export async function recordMortality(batchId: string, count: number, reason: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { data: batch } = await supabase
    .from("chicken_batches")
    .select("quantity")
    .eq("id", batchId)
    .single();

  if (!batch) return { success: false, error: "Batch tidak ditemukan" };
  if (count >= batch.quantity) return { success: false, error: "Jumlah melebihi populasi" };

  const { error: logError } = await supabase.from("mortality_logs").insert({
    batch_id: batchId,
    count,
    reason: reason || null,
    date: localDateStr(),
    user_id: session.id,
  });

  if (logError) return { success: false, error: logError.message };

  const { error: updateError } = await supabase
    .from("chicken_batches")
    .update({ quantity: batch.quantity - count })
    .eq("id", batchId);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/chickens");
  revalidatePath("/");
  return { success: true };
}

export async function transitionStage(batchId: string, toStage: ChickenStage, notes?: string, breederGender?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { data: batch } = await supabase
    .from("chicken_batches")
    .select("stage")
    .eq("id", batchId)
    .single();

  if (!batch) return { success: false, error: "Batch tidak ditemukan" };

  const today = localDateStr();

  await supabase.from("lifecycle_transitions").insert({
    batch_id: batchId,
    from_stage: batch.stage,
    to_stage: toStage,
    triggered_by: "manual",
    transitioned_at: new Date().toISOString(),
    notes: notes || null,
  });

  const updatePayload: Record<string, unknown> = { stage: toStage, stage_since: today };
  if (toStage === "indukan" && breederGender) updatePayload.breeder_gender = breederGender;

  const { error } = await supabase
    .from("chicken_batches")
    .update(updatePayload)
    .eq("id", batchId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/chickens");
  revalidatePath("/");
  return { success: true };
}

export async function markHarvested(batchId: string) {
  return transitionStage(batchId, "harvested");
}

export async function makeBreeder(batchId: string) {
  return transitionStage(batchId, "indukan");
}

export async function moveIndukanToAfkir(batchId: string, quantity: number) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { data: batch } = await supabase
    .from("chicken_batches")
    .select("*")
    .eq("id", batchId)
    .single();

  if (!batch) return { success: false, error: "Batch tidak ditemukan" };
  if (quantity <= 0) return { success: false, error: "Masukkan minimal 1 ekor" };
  if (quantity > batch.quantity) return { success: false, error: `Melebihi stok Indukan (${batch.quantity} ekor)` };

  const today = localDateStr();
  const remaining = batch.quantity - quantity;

  if (remaining === 0) {
    const { error } = await supabase.from("chicken_batches").delete().eq("id", batchId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("chicken_batches").update({ quantity: remaining }).eq("id", batchId);
    if (error) return { success: false, error: error.message };
  }

  const { error } = await supabase.from("chicken_batches").insert({
    batch_code: generateBatchCode(),
    stage: "afkir",
    quantity,
    hatch_date: batch.hatch_date,
    stage_since: today,
    source_egg_id: batch.source_egg_id,
    breeder_gender: batch.breeder_gender,
    user_id: session.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/chickens");
  revalidatePath("/");
  return { success: true };
}

export async function moveLayerToIndukan(batchId: string, betina: number, jantan: number) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { data: batch } = await supabase
    .from("chicken_batches")
    .select("*")
    .eq("id", batchId)
    .single();

  if (!batch) return { success: false, error: "Batch tidak ditemukan" };

  const moved = betina + jantan;
  if (moved <= 0) return { success: false, error: "Masukkan jumlah minimal 1 ekor" };
  if (moved > batch.quantity) return { success: false, error: `Melebihi stok Layer (${batch.quantity} ekor)` };

  const today = localDateStr();
  const remaining = batch.quantity - moved;

  // Kurangi / hapus batch Layer
  if (remaining === 0) {
    const { error } = await supabase.from("chicken_batches").delete().eq("id", batchId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("chicken_batches").update({ quantity: remaining }).eq("id", batchId);
    if (error) return { success: false, error: error.message };
  }

  // Buat batch Indukan
  const inserts: Record<string, unknown>[] = [];
  if (betina > 0) inserts.push({ batch_code: generateBatchCode(), stage: "indukan", quantity: betina, hatch_date: batch.hatch_date, stage_since: today, breeder_gender: "betina", source_egg_id: batch.source_egg_id, user_id: session.id });
  if (jantan > 0) inserts.push({ batch_code: generateBatchCode(), stage: "indukan", quantity: jantan, hatch_date: batch.hatch_date, stage_since: today, breeder_gender: "jantan", source_egg_id: batch.source_egg_id, user_id: session.id });

  if (inserts.length > 0) {
    const { error } = await supabase.from("chicken_batches").insert(inserts);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/chickens");
  revalidatePath("/");
  return { success: true };
}

export async function splitLayerBatch(
  batchId: string,
  siapPanen: number,
  indukanBetina: number,
  indukanJantan: number,
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { data: batch } = await supabase
    .from("chicken_batches")
    .select("*")
    .eq("id", batchId)
    .single();

  if (!batch) return { success: false, error: "Batch tidak ditemukan" };

  const total = siapPanen + indukanBetina + indukanJantan;
  if (total !== batch.quantity) {
    return { success: false, error: `Total (${total}) harus sama dengan jumlah batch (${batch.quantity})` };
  }

  const today = localDateStr();

  const { error: delError } = await supabase
    .from("chicken_batches")
    .delete()
    .eq("id", batchId);

  if (delError) return { success: false, error: delError.message };

  const inserts: Record<string, unknown>[] = [];
  if (siapPanen > 0) {
    inserts.push({
      batch_code: batch.batch_code,
      stage: "afkir",
      quantity: siapPanen,
      hatch_date: batch.hatch_date,
      stage_since: today,
      source_egg_id: batch.source_egg_id,
      notes: batch.notes,
      user_id: session.id,
    });
  }
  if (indukanBetina > 0) {
    inserts.push({
      batch_code: generateBatchCode(),
      stage: "indukan",
      quantity: indukanBetina,
      hatch_date: batch.hatch_date,
      stage_since: today,
      source_egg_id: batch.source_egg_id,
      breeder_gender: "betina",
      user_id: session.id,
    });
  }
  if (indukanJantan > 0) {
    inserts.push({
      batch_code: generateBatchCode(),
      stage: "indukan",
      quantity: indukanJantan,
      hatch_date: batch.hatch_date,
      stage_since: today,
      source_egg_id: batch.source_egg_id,
      breeder_gender: "jantan",
      user_id: session.id,
    });
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from("chicken_batches").insert(inserts);
    if (insertError) return { success: false, error: insertError.message };
  }

  revalidatePath("/chickens");
  revalidatePath("/");
  return { success: true };
}

export async function sellChickens(batchId: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const quantity = parseInt(formData.get("quantity") as string);
  const price_per_unit = parseFloat(formData.get("price_per_unit") as string);
  const date = formData.get("date") as string;
  const notes = formData.get("notes") as string;

  if (!quantity || quantity <= 0) return { success: false, error: "Jumlah tidak valid" };
  if (!price_per_unit || price_per_unit <= 0) return { success: false, error: "Harga tidak valid" };

  const { data: batch } = await supabase
    .from("chicken_batches")
    .select("quantity")
    .eq("id", batchId)
    .single();

  if (!batch) return { success: false, error: "Batch tidak ditemukan" };
  if (quantity > batch.quantity) return { success: false, error: `Stok hanya ${batch.quantity} ekor` };

  const { error: saleError } = await supabase.from("sales").insert({
    quantity,
    price_per_unit,
    total_revenue: quantity * price_per_unit,
    date,
    sale_type: "chicken",
    batch_id: batchId,
    notes: notes || null,
    user_id: session.id,
  });

  if (saleError) return { success: false, error: saleError.message };

  const remaining = batch.quantity - quantity;
  if (remaining === 0) {
    const { error: updateErr } = await supabase
      .from("chicken_batches")
      .update({ stage: "harvested" })
      .eq("id", batchId);
    if (updateErr) return { success: false, error: updateErr.message };
  } else {
    const { error: updateErr } = await supabase
      .from("chicken_batches")
      .update({ quantity: remaining })
      .eq("id", batchId);
    if (updateErr) return { success: false, error: updateErr.message };
  }

  revalidatePath("/chickens");
  revalidatePath("/finances/sales");
  revalidatePath("/");
  return { success: true };
}

export async function deleteBatch(batchId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("chicken_batches")
    .delete()
    .eq("id", batchId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/chickens");
  revalidatePath("/");
  return { success: true };
}
