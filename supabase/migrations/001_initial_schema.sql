-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE egg_status AS ENUM ('stock', 'incubating', 'hatched', 'failed');
CREATE TYPE chicken_stage AS ENUM ('doc', 'grower', 'layer', 'broiler', 'breeder', 'harvested');
CREATE TYPE expense_category AS ENUM ('feed', 'operational');
CREATE TYPE cleaning_status AS ENUM ('pending', 'done');

-- Eggs table
CREATE TABLE eggs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quantity            INT NOT NULL CHECK (quantity > 0),
  date_received       DATE NOT NULL DEFAULT CURRENT_DATE,
  status              egg_status NOT NULL DEFAULT 'stock',
  source_notes        TEXT,
  incubation_start    DATE,
  expected_hatch_date DATE GENERATED ALWAYS AS (incubation_start + INTERVAL '21 days') STORED,
  hatch_date          DATE,
  hatched_count       INT,
  failed_count        INT,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Chicken batches table
CREATE TABLE chicken_batches (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_code     VARCHAR(50) UNIQUE NOT NULL,
  stage          chicken_stage NOT NULL DEFAULT 'doc',
  quantity       INT NOT NULL CHECK (quantity > 0),
  hatch_date     DATE NOT NULL,
  stage_since    DATE NOT NULL DEFAULT CURRENT_DATE,
  source_egg_id  UUID REFERENCES eggs(id),
  notes          TEXT,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Mortality logs
CREATE TABLE mortality_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id   UUID REFERENCES chicken_batches(id) ON DELETE CASCADE NOT NULL,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  count      INT NOT NULL CHECK (count > 0),
  reason     TEXT,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  category     expense_category NOT NULL,
  sub_category VARCHAR(100),
  description  TEXT,
  amount       DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  quantity_kg  DECIMAL(10,2),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Sales table
CREATE TABLE sales (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  sale_type      VARCHAR(50) NOT NULL DEFAULT 'chicken',
  quantity       INT NOT NULL CHECK (quantity > 0),
  price_per_unit DECIMAL(12,2) NOT NULL CHECK (price_per_unit > 0),
  total_revenue  DECIMAL(12,2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  batch_id       UUID REFERENCES chicken_batches(id),
  notes          TEXT,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Vaccinations table
CREATE TABLE vaccinations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  vaccine_type  VARCHAR(100) NOT NULL,
  batch_id      UUID REFERENCES chicken_batches(id),
  quantity      INT NOT NULL CHECK (quantity > 0),
  dosage        VARCHAR(50),
  notes         TEXT,
  next_due_date DATE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Cleaning logs table
CREATE TABLE cleaning_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status         cleaning_status NOT NULL DEFAULT 'pending',
  cage_area      VARCHAR(100),
  notes          TEXT,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Lifecycle transitions audit log
CREATE TABLE lifecycle_transitions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id         UUID REFERENCES chicken_batches(id) ON DELETE CASCADE NOT NULL,
  from_stage       chicken_stage NOT NULL,
  to_stage         chicken_stage NOT NULL,
  transitioned_at  TIMESTAMPTZ DEFAULT NOW(),
  triggered_by     VARCHAR(50) DEFAULT 'cron',
  notes            TEXT
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER eggs_updated_at
  BEFORE UPDATE ON eggs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chicken_batches_updated_at
  BEFORE UPDATE ON chicken_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
