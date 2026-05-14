"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function recordSale(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const quantity = parseInt(formData.get("quantity") as string);
  const price_per_unit = parseFloat(formData.get("price_per_unit") as string);
  const date = formData.get("date") as string;
  const sale_type = (formData.get("sale_type") as string) || "chicken";
  const batch_id = formData.get("batch_id") as string;
  const notes = formData.get("notes") as string;

  if (!quantity || quantity <= 0) return { success: false, error: "Jumlah tidak valid" };
  if (!price_per_unit || price_per_unit <= 0) return { success: false, error: "Harga tidak valid" };

  const { error } = await supabase.from("sales").insert({
    quantity,
    price_per_unit,
    total_revenue: quantity * price_per_unit,
    date,
    sale_type,
    batch_id: batch_id || null,
    notes: notes || null,
    user_id: user.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/finances");
  revalidatePath("/finances/sales");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSale(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/finances");
  revalidatePath("/finances/sales");
  revalidatePath("/");
  return { success: true };
}
