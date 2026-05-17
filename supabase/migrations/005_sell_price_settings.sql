CREATE TABLE sell_price_settings (
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stage_key    TEXT NOT NULL,
  price_per_head DECIMAL(10,2) NOT NULL CHECK (price_per_head > 0),
  PRIMARY KEY (user_id, stage_key)
);

ALTER TABLE sell_price_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sell settings"
  ON sell_price_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
