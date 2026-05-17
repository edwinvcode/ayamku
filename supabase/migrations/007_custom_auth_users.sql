-- Custom auth users table (replaces Supabase Auth)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS — akses hanya via service role key (admin client)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON app_users USING (false) WITH CHECK (false);

-- Akun superadmin default: username=admin, password=admin123
-- GANTI PASSWORD setelah login pertama!
INSERT INTO app_users (username, password_hash, name, role)
VALUES (
  'admin',
  '$2b$10$rg80rken4Yiu3QU7H.k1yuQyrKUSMPbnQkCYb3mOuPLM1JzYgocIK',
  'Administrator',
  'superadmin'
)
ON CONFLICT (username) DO NOTHING;
