import { createAdminClient } from "@/lib/supabase/admin";

export async function getCategories() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("expense_categories")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
}
