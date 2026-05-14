"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateBatchCode } from "@/lib/utils";

export async function addEggBatch(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const quantity = parseInt(formData.get("quantity") as string);
  const date_received = formData.get("date_received") as string;
  const source_notes = formData.get("source_notes") as string;

  if (!quantity || quantity <= 0) return { success: false, error: "Jumlah tidak valid" };

  const { error } = await supabase.from("eggs").insert({
    quantity,
    date_received,
    source_notes: source_notes || null,
    status: "stock",
    user_id: user.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/eggs");
  revalidatePath("/");
  return { success: true };
}

export async function startIncubation(
  id: string,
  incubation_start: string,
  quantity_to_incubate: number,
  total_quantity: number,
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const hatchDate = new Date(incubation_start);
  hatchDate.setDate(hatchDate.getDate() + 21);
  const expected_hatch_date = hatchDate.toISOString().split("T")[0];

  if (quantity_to_incubate >= total_quantity) {
    // Inkubasi semua — update langsung
    const { error } = await supabase
      .from("eggs")
      .update({ status: "incubating", incubation_start, expected_hatch_date, quantity: quantity_to_incubate })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { success: false, error: error.message };
  } else {
    // Pecah batch: kurangi stok yang ada, buat record baru untuk inkubasi
    const { error: updateError } = await supabase
      .from("eggs")
      .update({ quantity: total_quantity - quantity_to_incubate })
      .eq("id", id)
      .eq("user_id", user.id);
    if (updateError) return { success: false, error: updateError.message };

    const { data: original } = await supabase.from("eggs").select("date_received, source_notes").eq("id", id).single();
    const { error: insertError } = await supabase.from("eggs").insert({
      quantity: quantity_to_incubate,
      date_received: original?.date_received,
      source_notes: original?.source_notes,
      status: "incubating",
      incubation_start,
      expected_hatch_date,
      user_id: user.id,
    });
    if (insertError) return { success: false, error: insertError.message };
  }

  revalidatePath("/eggs");
  revalidatePath("/");
  return { success: true };
}

export async function recordHatch(
  id: string,
  hatched_count: number,
  failed_count: number,
  hatch_date: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error: eggError } = await supabase
    .from("eggs")
    .update({ status: "hatched", hatched_count, failed_count, hatch_date })
    .eq("id", id)
    .eq("user_id", user.id);

  if (eggError) return { success: false, error: eggError.message };

  if (hatched_count > 0) {
    const batchCode = generateBatchCode();
    const { error: batchError } = await supabase.from("chicken_batches").insert({
      batch_code: batchCode,
      stage: "starter",
      quantity: hatched_count,
      hatch_date,
      stage_since: hatch_date,
      source_egg_id: id,
      user_id: user.id,
    });

    if (batchError) return { success: false, error: batchError.message };
  }

  revalidatePath("/eggs");
  revalidatePath("/chickens");
  revalidatePath("/");
  return { success: true };
}

export async function markEggsFailed(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("eggs")
    .update({ status: "failed" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/eggs");
  revalidatePath("/");
  return { success: true };
}

export async function sellEggs(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const quantity = parseInt(formData.get("quantity") as string);
  const price_per_unit = parseFloat(formData.get("price_per_unit") as string);
  const date = formData.get("date") as string;
  const notes = formData.get("notes") as string;

  if (!quantity || quantity <= 0) return { success: false, error: "Jumlah tidak valid" };
  if (!price_per_unit || price_per_unit <= 0) return { success: false, error: "Harga tidak valid" };

  const { data: egg } = await supabase.from("eggs").select("quantity").eq("id", id).eq("user_id", user.id).single();
  if (!egg) return { success: false, error: "Batch tidak ditemukan" };
  if (quantity > egg.quantity) return { success: false, error: `Stok hanya ${egg.quantity} butir` };

  const { error: saleError } = await supabase.from("sales").insert({
    quantity,
    price_per_unit,
    total_revenue: quantity * price_per_unit,
    date,
    sale_type: "egg",
    notes: notes || null,
    user_id: user.id,
  });
  if (saleError) return { success: false, error: saleError.message };

  const remaining = egg.quantity - quantity;
  if (remaining === 0) {
    await supabase.from("eggs").delete().eq("id", id).eq("user_id", user.id);
  } else {
    await supabase.from("eggs").update({ quantity: remaining }).eq("id", id).eq("user_id", user.id);
  }

  revalidatePath("/eggs");
  revalidatePath("/finances/sales");
  revalidatePath("/");
  return { success: true };
}

export async function updateEggBatch(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const quantity = parseInt(formData.get("quantity") as string);
  const date_received = formData.get("date_received") as string;
  const source_notes = formData.get("source_notes") as string;

  if (!quantity || quantity <= 0) return { success: false, error: "Jumlah tidak valid" };

  const { error } = await supabase
    .from("eggs")
    .update({ quantity, date_received, source_notes: source_notes || null })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/eggs");
  revalidatePath("/");
  return { success: true };
}

export async function deleteEggBatch(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("eggs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/eggs");
  revalidatePath("/");
  return { success: true };
}
