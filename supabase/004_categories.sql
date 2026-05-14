-- Tabel kategori pengeluaran yang bisa dikustomisasi per user
CREATE TABLE expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their categories" ON expense_categories
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_expense_categories_user ON expense_categories(user_id, created_at DESC);
