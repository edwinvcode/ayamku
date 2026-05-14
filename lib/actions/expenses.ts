"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ExpenseCategory } from "@/types/database";

export async function addExpense(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as ExpenseCategory;
  const date = formData.get("date") as string;
  const sub_category = formData.get("sub_category") as string;
  const description = formData.get("description") as string;
  const quantity_kg = parseFloat(formData.get("quantity_kg") as string);

  if (!amount || amount <= 0) return { success: false, error: "Jumlah tidak valid" };

  const { error } = await supabase.from("expenses").insert({
    amount,
    category,
    date,
    sub_category: sub_category || null,
    description: description || null,
    quantity_kg: isNaN(quantity_kg) ? null : quantity_kg,
    user_id: user.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/finances");
  revalidatePath("/finances/expenses");
  revalidatePath("/");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/finances");
  revalidatePath("/finances/expenses");
  revalidatePath("/");
  return { success: true };
}
