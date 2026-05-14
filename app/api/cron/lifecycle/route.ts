import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = new Date().toISOString().split("T")[0];
  const results = { starter_to_grower: 0, grower_to_layer: 0, errors: [] as string[] };

  // Starter → Grower: age >= 28 days
  const cutoff28 = new Date();
  cutoff28.setDate(cutoff28.getDate() - 28);
  const cutoff28Str = cutoff28.toISOString().split("T")[0];

  const { data: starterBatches } = await supabase
    .from("chicken_batches")
    .select("id, batch_code")
    .eq("stage", "starter")
    .lte("hatch_date", cutoff28Str);

  for (const batch of starterBatches || []) {
    const { error: insertErr } = await supabase.from("lifecycle_transitions").insert({
      batch_id: batch.id,
      from_stage: "starter",
      to_stage: "grower",
      triggered_by: "cron",
      transitioned_at: new Date().toISOString(),
    });
    const { error: updateErr } = await supabase
      .from("chicken_batches")
      .update({ stage: "grower", stage_since: today })
      .eq("id", batch.id);

    if (insertErr || updateErr) {
      results.errors.push(`${batch.batch_code}: ${insertErr?.message || updateErr?.message}`);
    } else {
      results.starter_to_grower++;
    }
  }

  // Grower → Layer: age >= 84 days
  const cutoff84 = new Date();
  cutoff84.setDate(cutoff84.getDate() - 84);
  const cutoff84Str = cutoff84.toISOString().split("T")[0];

  const { data: growerBatches } = await supabase
    .from("chicken_batches")
    .select("id, batch_code")
    .eq("stage", "grower")
    .lte("hatch_date", cutoff84Str);

  for (const batch of growerBatches || []) {
    const { error: insertErr } = await supabase.from("lifecycle_transitions").insert({
      batch_id: batch.id,
      from_stage: "grower",
      to_stage: "layer",
      triggered_by: "cron",
      transitioned_at: new Date().toISOString(),
    });
    const { error: updateErr } = await supabase
      .from("chicken_batches")
      .update({ stage: "layer", stage_since: today })
      .eq("id", batch.id);

    if (insertErr || updateErr) {
      results.errors.push(`${batch.batch_code}: ${insertErr?.message || updateErr?.message}`);
    } else {
      results.grower_to_layer++;
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...results,
  });
}
