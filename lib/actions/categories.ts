"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

export async function createCategory(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const name = (formData.get("name") as string)?.trim();
  const color = (formData.get("color") as string) || "#6b7280";

  if (!name) return { success: false, error: "Nama kategori wajib diisi" };

  const { error } = await supabase.from("expense_categories").insert({
    name,
    color,
    user_id: session.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const name = (formData.get("name") as string)?.trim();
  const color = (formData.get("color") as string) || "#6b7280";

  if (!name) return { success: false, error: "Nama kategori wajib diisi" };

  const { error } = await supabase
    .from("expense_categories")
    .update({ name, color })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("expense_categories").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/categories");
  return { success: true };
}
