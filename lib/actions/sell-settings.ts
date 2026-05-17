"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ChickenStage } from "@/types/database";
import { SellPriceOverrides } from "@/lib/strategy";

export async function getSellSettings(): Promise<SellPriceOverrides> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("sell_price_settings")
    .select("stage_key, price_per_head")
    .eq("user_id", user.id);

  const overrides: SellPriceOverrides = {};
  for (const row of data || []) {
    overrides[row.stage_key as ChickenStage] = row.price_per_head;
  }
  return overrides;
}

export async function saveSellSettings(
  settings: { stageKey: ChickenStage; pricePerHead: number }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const valid = settings.filter(s => s.pricePerHead > 0);

  await supabase.from("sell_price_settings").delete().eq("user_id", user.id);

  if (valid.length > 0) {
    const { error } = await supabase.from("sell_price_settings").insert(
      valid.map(s => ({
        user_id: user.id,
        stage_key: s.stageKey,
        price_per_head: s.pricePerHead,
      }))
    );
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/strategy");
  return { success: true };
}
