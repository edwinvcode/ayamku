-- Add breeder_gender column to chicken_batches
-- Used to distinguish jantan/betina when stage = 'breeder'

CREATE TYPE breeder_gender AS ENUM ('jantan', 'betina');

ALTER TABLE chicken_batches
  ADD COLUMN IF NOT EXISTS breeder_gender breeder_gender NULL;
