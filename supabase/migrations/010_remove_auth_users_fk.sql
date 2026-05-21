-- Remove FK references to auth.users since app now uses custom JWT auth (app_users table)
-- RLS is no longer relied on; access is controlled via middleware + service role client

ALTER TABLE chicken_batches  DROP CONSTRAINT IF EXISTS chicken_batches_user_id_fkey;
ALTER TABLE eggs              DROP CONSTRAINT IF EXISTS eggs_user_id_fkey;
ALTER TABLE mortality_logs    DROP CONSTRAINT IF EXISTS mortality_logs_user_id_fkey;
ALTER TABLE expenses          DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE sales             DROP CONSTRAINT IF EXISTS sales_user_id_fkey;
ALTER TABLE vaccinations      DROP CONSTRAINT IF EXISTS vaccinations_user_id_fkey;
ALTER TABLE cleaning_logs     DROP CONSTRAINT IF EXISTS cleaning_logs_user_id_fkey;
