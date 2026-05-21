import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardAlert, DashboardKPIs } from "@/types/database";
import { getDaysDiff, localDateStr } from "@/lib/utils";
import { getBatchAgeDays } from "@/lib/lifecycle";

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const supabase = createAdminClient();

  const today = localDateStr();
  const firstOfMonth = localDateStr(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const [eggsStock, eggsIncubating, batchCounts, expenses, sales, mortality] = await Promise.all([
    supabase.from("eggs").select("quantity").eq("status", "stock"),
    supabase.from("eggs").select("quantity").eq("status", "incubating"),
    supabase.from("chicken_batches").select("stage, quantity, breeder_gender, stage_since").neq("stage", "harvested"),
    supabase.from("expenses").select("amount").gte("date", firstOfMonth).lte("date", today),
    supabase.from("sales").select("total_revenue, quantity, price_per_unit").gte("date", firstOfMonth).lte("date", today),
    supabase.from("mortality_logs").select("count").gte("date", firstOfMonth).lte("date", today),
  ]);

  const sumQty = (data: { quantity: number }[] | null) =>
    (data || []).reduce((s, r) => s + r.quantity, 0);

  const stages = (batchCounts.data || []);
  const total_expense = (expenses.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const total_revenue = (sales.data || []).reduce((s, r) =>
    s + (Number(r.total_revenue) || (Number(r.quantity) * Number(r.price_per_unit))), 0);

  const sumStage = (stage: string) => stages.filter(b => b.stage === stage).reduce((s, b) => s + b.quantity, 0);

  return {
    eggs_stock: sumQty(eggsStock.data),
    eggs_incubating: sumQty(eggsIncubating.data),
    chickens_starter: sumStage("starter"),
    chickens_grower: sumStage("grower"),
    chickens_layer: sumStage("layer"),
    chickens_afkir: sumStage("afkir"),
    chickens_indukan_jantan: stages
      .filter(b => b.stage === "indukan" && b.breeder_gender === "jantan")
      .reduce((s, b) => s + b.quantity, 0),
    chickens_indukan_betina: stages
      .filter(b => b.stage === "indukan" && b.breeder_gender === "betina")
      .reduce((s, b) => s + b.quantity, 0),
    chickens_dead_this_month: (mortality.data || []).reduce((s, m) => s + m.count, 0),
    total_expense_this_month: total_expense,
    total_revenue_this_month: total_revenue,
    profit_this_month: total_revenue - total_expense,
  };
}

export async function getDashboardAlerts(): Promise<DashboardAlert[]> {
  const supabase = createAdminClient();
  const alerts: DashboardAlert[] = [];
  const today = new Date();
  const todayStr = localDateStr(today);
  const in7Days = localDateStr(new Date(today.getTime() + 7 * 86400000));
  const in3Days = localDateStr(new Date(today.getTime() + 3 * 86400000));

  const [incubating, batches, vaccinations, cleaning] = await Promise.all([
    supabase.from("eggs").select("id, quantity, expected_hatch_date").eq("status", "incubating").lte("expected_hatch_date", in3Days),
    supabase.from("chicken_batches").select("id, batch_code, stage, hatch_date, stage_since, quantity").in("stage", ["starter", "grower"]),
    supabase.from("vaccinations").select("id, vaccine_type, next_due_date, batch_id").lte("next_due_date", in7Days).gte("next_due_date", todayStr),
    supabase.from("cleaning_logs").select("id, scheduled_date, cage_area").eq("status", "pending").lte("scheduled_date", todayStr),
  ]);

  for (const egg of incubating.data || []) {
    const daysLeft = getDaysDiff(today, new Date(egg.expected_hatch_date));
    alerts.push({
      type: "hatch_soon",
      message: `${egg.quantity} telur siap menetas${daysLeft <= 0 ? " hari ini!" : ` dalam ${daysLeft} hari`}`,
      severity: daysLeft <= 0 ? "urgent" : "warning",
    });
  }

  for (const batch of batches.data || []) {
    const ageDays = getDaysDiff(new Date(batch.hatch_date));

    if (batch.stage === "starter" && ageDays >= 28) {
      alerts.push({
        type: "starter_ready",
        message: `Batch ${batch.batch_code} (${batch.quantity} ekor) siap pindah ke Grower (${ageDays} hari)`,
        severity: ageDays >= 30 ? "urgent" : "warning",
      });
    }

    if (batch.stage === "grower" && ageDays >= 84) {
      alerts.push({
        type: "grower_ready",
        message: `Batch ${batch.batch_code} (${batch.quantity} ekor) siap pindah ke Layer (${ageDays} hari)`,
        severity: ageDays >= 90 ? "urgent" : "warning",
      });
    }
  }

  for (const vacc of vaccinations.data || []) {
    const daysLeft = getDaysDiff(today, new Date(vacc.next_due_date!));
    alerts.push({
      type: "vaccination_due",
      message: `Vaksin ${vacc.vaccine_type} jatuh tempo${daysLeft <= 0 ? " hari ini!" : ` dalam ${daysLeft} hari`}`,
      severity: daysLeft <= 1 ? "urgent" : "warning",
    });
  }

  for (const clean of cleaning.data || []) {
    alerts.push({
      type: "cleaning_due",
      message: `Kandang ${clean.cage_area || "belum ditentukan"} perlu dibersihkan`,
      severity: "warning",
    });
  }

  return alerts.sort((a, b) => {
    const order = { urgent: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}
