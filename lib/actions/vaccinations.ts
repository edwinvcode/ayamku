"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

export async function addVaccination(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const vaccine_type = formData.get("vaccine_type") as string;
  const date = formData.get("date") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const batch_id = formData.get("batch_id") as string;
  const dosage = formData.get("dosage") as string;
  const notes = formData.get("notes") as string;
  const next_due_date = formData.get("next_due_date") as string;

  const { error } = await supabase.from("vaccinations").insert({
    vaccine_type,
    date,
    quantity,
    batch_id: batch_id || null,
    dosage: dosage || null,
    notes: notes || null,
    next_due_date: next_due_date || null,
    user_id: session.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/vaccinations");
  revalidatePath("/");
  return { success: true };
}

export async function updateVaccination(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const vaccine_type = formData.get("vaccine_type") as string;
  const date = formData.get("date") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const batch_id = formData.get("batch_id") as string;
  const dosage = formData.get("dosage") as string;
  const notes = formData.get("notes") as string;
  const next_due_date = formData.get("next_due_date") as string;

  const { error } = await supabase
    .from("vaccinations")
    .update({
      vaccine_type,
      date,
      quantity,
      batch_id: batch_id || null,
      dosage: dosage || null,
      notes: notes || null,
      next_due_date: next_due_date || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/vaccinations");
  revalidatePath("/");
  return { success: true };
}

export async function deleteVaccination(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("vaccinations").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/vaccinations");
  revalidatePath("/");
  return { success: true };
}
