-- Indexes for performance
CREATE INDEX idx_eggs_status ON eggs(status);
CREATE INDEX idx_eggs_user_date ON eggs(user_id, date_received DESC);
CREATE INDEX idx_eggs_incubating ON eggs(status, incubation_start)
  WHERE status = 'incubating';

CREATE INDEX idx_batches_stage ON chicken_batches(stage);
CREATE INDEX idx_batches_user_stage ON chicken_batches(user_id, stage);
CREATE INDEX idx_batches_hatch_date ON chicken_batches(hatch_date);
CREATE INDEX idx_batches_stage_since ON chicken_batches(stage, stage_since);

CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_expenses_category ON expenses(category, date DESC);

CREATE INDEX idx_sales_user_date ON sales(user_id, date DESC);

CREATE INDEX idx_vaccinations_next_due ON vaccinations(next_due_date)
  WHERE next_due_date IS NOT NULL;
CREATE INDEX idx_vaccinations_user ON vaccinations(user_id, date DESC);

CREATE INDEX idx_cleaning_pending ON cleaning_logs(status, scheduled_date)
  WHERE status = 'pending';
CREATE INDEX idx_cleaning_user ON cleaning_logs(user_id, scheduled_date DESC);

CREATE INDEX idx_mortality_batch ON mortality_logs(batch_id, date DESC);
CREATE INDEX idx_transitions_batch ON lifecycle_transitions(batch_id, transitioned_at DESC);
