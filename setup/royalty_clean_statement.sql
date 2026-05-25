-- 1. Drop triggers first
DROP TRIGGER IF EXISTS trg_royalty_transactions_updated_at ON royalty_transactions;
DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;

-- 2. Drop indexes
DROP INDEX IF EXISTS idx_royalty_title;
DROP INDEX IF EXISTS idx_royalty_asin;
DROP INDEX IF EXISTS idx_royalty_marketplace;
DROP INDEX IF EXISTS idx_royalty_report_month;
DROP INDEX IF EXISTS idx_royalty_user_id;
DROP INDEX IF EXISTS idx_royalty_user_report_month;
DROP INDEX IF EXISTS idx_royalty_currency;
DROP INDEX IF EXISTS idx_royalty_batch;
DROP INDEX IF EXISTS idx_royalty_raw_row;
DROP INDEX IF EXISTS idx_app_users_email_unique;
DROP INDEX IF EXISTS idx_app_users_google_sub;

-- 3. Drop child table first
DROP TABLE IF EXISTS royalty_transactions CASCADE;

-- 4. Drop parent table
DROP TABLE IF EXISTS app_users CASCADE;

-- 5. Drop helper function
DROP FUNCTION IF EXISTS set_updated_at();

-- 6. Optional: drop extensions only if no other tables need them
DROP EXTENSION IF EXISTS citext;
DROP EXTENSION IF EXISTS pgcrypto;

-- Optional only if you enabled pgvector earlier
-- DROP EXTENSION IF EXISTS vector;