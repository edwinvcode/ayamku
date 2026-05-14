import { createClient } from "@/lib/supabase/server";

export async function getCategories() {
  const supabase = createClient();
  const { data } = await supabase
    .from("expense_categories")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
}
