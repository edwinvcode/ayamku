"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { FeedRateKey, FeedRateOverrides } from "@/lib/feed-estimate";

export async function getFeedSettings(): Promise<FeedRateOverrides> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("feed_price_settings")
    .select("stage_key, brand, price_per_kg")
    .eq("user_id", user.id);

  const overrides: FeedRateOverrides = {};
  for (const row of data || []) {
    overrides[row.stage_key as FeedRateKey] = {
      brand: row.brand,
      pricePerKg: row.price_per_kg,
    };
  }
  return overrides;
}

export async function saveFeedSettings(
  settings: { stageKey: FeedRateKey; brand: string; pricePerKg: number }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const valid = settings.filter(s => s.pricePerKg > 0);
  if (valid.length === 0) return { success: false, error: "Tidak ada data valid" };

  // Delete existing then insert fresh
  await supabase.from("feed_price_settings").delete().eq("user_id", user.id);

  const { error } = await supabase.from("feed_price_settings").insert(
    valid.map(s => ({
      user_id: user.id,
      stage_key: s.stageKey,
      brand: s.brand,
      price_per_kg: s.pricePerKg,
    }))
  );

  if (error) return { success: false, error: error.message };

  revalidatePath("/feed");
  return { success: true };
}
