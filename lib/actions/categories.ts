"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCategory(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const color = (formData.get("color") as string) || "#6b7280";

  if (!name) return { success: false, error: "Nama kategori wajib diisi" };

  const { error } = await supabase.from("expense_categories").insert({
    name,
    color,
    user_id: user.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const color = (formData.get("color") as string) || "#6b7280";

  if (!name) return { success: false, error: "Nama kategori wajib diisi" };

  const { error } = await supabase
    .from("expense_categories")
    .update({ name, color })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("expense_categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/categories");
  return { success: true };
}
