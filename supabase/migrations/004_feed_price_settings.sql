CREATE TABLE feed_price_settings (
  user_id   UUID  REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stage_key TEXT  NOT NULL,
  brand     TEXT  NOT NULL DEFAULT '',
  price_per_kg DECIMAL(10,2) NOT NULL CHECK (price_per_kg > 0),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, stage_key)
);

ALTER TABLE feed_price_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own feed settings"
  ON feed_price_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
