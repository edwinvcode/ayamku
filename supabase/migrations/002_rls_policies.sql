-- Enable RLS on all tables
ALTER TABLE eggs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chicken_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortality_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_transitions ENABLE ROW LEVEL SECURITY;

-- Users own their eggs
CREATE POLICY "Users own their eggs" ON eggs
  FOR ALL USING (auth.uid() = user_id);

-- Users own their chicken batches
CREATE POLICY "Users own their batches" ON chicken_batches
  FOR ALL USING (auth.uid() = user_id);

-- Users own their mortality logs
CREATE POLICY "Users own their mortality logs" ON mortality_logs
  FOR ALL USING (auth.uid() = user_id);

-- Users own their expenses
CREATE POLICY "Users own their expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- Users own their sales
CREATE POLICY "Users own their sales" ON sales
  FOR ALL USING (auth.uid() = user_id);

-- Users own their vaccinations
CREATE POLICY "Users own their vaccinations" ON vaccinations
  FOR ALL USING (auth.uid() = user_id);

-- Users own their cleaning logs
CREATE POLICY "Users own their cleaning logs" ON cleaning_logs
  FOR ALL USING (auth.uid() = user_id);

-- Lifecycle transitions: read only by batch owner
CREATE POLICY "Users read their lifecycle transitions" ON lifecycle_transitions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chicken_batches
      WHERE chicken_batches.id = lifecycle_transitions.batch_id
        AND chicken_batches.user_id = auth.uid()
    )
  );

-- Service role can insert lifecycle transitions (for cron)
CREATE POLICY "Service role insert transitions" ON lifecycle_transitions
  FOR INSERT WITH CHECK (true);
