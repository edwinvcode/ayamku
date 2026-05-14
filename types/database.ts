export type EggStatus = "stock" | "incubating" | "hatched" | "failed";
export type ChickenStage = "starter" | "grower" | "layer" | "afkir" | "indukan" | "harvested";
export type ExpenseCategory = "feed" | "operational";
export type CleaningStatus = "pending" | "done";

export interface Egg {
  id: string;
  quantity: number;
  date_received: string;
  status: EggStatus;
  source_notes: string | null;
  incubation_start: string | null;
  expected_hatch_date: string | null;
  hatch_date: string | null;
  hatched_count: number | null;
  failed_count: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChickenBatch {
  id: string;
  batch_code: string;
  stage: ChickenStage;
  quantity: number;
  hatch_date: string;
  stage_since: string;
  source_egg_id: string | null;
  breeder_gender: "jantan" | "betina" | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MortalityLog {
  id: string;
  batch_id: string;
  date: string;
  count: number;
  reason: string | null;
  user_id: string;
  created_at: string;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  sub_category: string | null;
  description: string | null;
  amount: number;
  quantity_kg: number | null;
  user_id: string;
  created_at: string;
}

export interface Sale {
  id: string;
  date: string;
  sale_type: string;
  quantity: number;
  price_per_unit: number;
  total_revenue: number;
  batch_id: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
}

export interface Vaccination {
  id: string;
  date: string;
  vaccine_type: string;
  batch_id: string | null;
  quantity: number;
  dosage: string | null;
  notes: string | null;
  next_due_date: string | null;
  user_id: string;
  created_at: string;
}

export interface CleaningLog {
  id: string;
  scheduled_date: string;
  completed_date: string | null;
  status: CleaningStatus;
  cage_area: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
}

export interface LifecycleTransition {
  id: string;
  batch_id: string;
  from_stage: ChickenStage;
  to_stage: ChickenStage;
  transitioned_at: string;
  triggered_by: string;
  notes: string | null;
}

export interface DashboardKPIs {
  eggs_stock: number;
  eggs_incubating: number;
  chickens_starter: number;
  chickens_grower: number;
  chickens_layer: number;
  chickens_afkir: number;
  chickens_indukan_jantan: number;
  chickens_indukan_betina: number;
  chickens_dead_this_month: number;
  total_expense_this_month: number;
  total_revenue_this_month: number;
  profit_this_month: number;
}

export interface ExpenseCategoryItem {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DashboardAlert {
  type: "hatch_soon" | "starter_ready" | "grower_ready" | "vaccination_due" | "cleaning_due";
  message: string;
  severity: "info" | "warning" | "urgent";
  data?: Record<string, unknown>;
}
