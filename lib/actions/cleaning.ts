"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import { localDateStr } from "@/lib/utils";

export async function addCleaningSchedule(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const scheduled_date = formData.get("scheduled_date") as string;
  const cage_area = formData.get("cage_area") as string;
  const notes = formData.get("notes") as string;

  const { error } = await supabase.from("cleaning_logs").insert({
    scheduled_date,
    cage_area: cage_area || null,
    notes: notes || null,
    status: "pending",
    user_id: session.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/cleaning");
  revalidatePath("/");
  return { success: true };
}

export async function markCleaningDone(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("cleaning_logs")
    .update({ status: "done", completed_date: localDateStr() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/cleaning");
  revalidatePath("/");
  return { success: true };
}

export async function markCleaningDoneAndSchedule(
  id: string,
  nextDate: string | null,
  cageArea: string | null,
  notes: string | null,
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { error: updateError } = await supabase
    .from("cleaning_logs")
    .update({ status: "done", completed_date: localDateStr() })
    .eq("id", id);

  if (updateError) return { success: false, error: updateError.message };

  if (nextDate) {
    const { error: insertError } = await supabase.from("cleaning_logs").insert({
      scheduled_date: nextDate,
      cage_area: cageArea || null,
      notes: notes || null,
      status: "pending",
      user_id: session.id,
    });
    if (insertError) return { success: false, error: insertError.message };
  }

  revalidatePath("/cleaning");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCleaningLog(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("cleaning_logs").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/cleaning");
  revalidatePath("/");
  return { success: true };
}
