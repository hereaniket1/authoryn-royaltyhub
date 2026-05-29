-- ===============================================================
-- Athoryn Royalty Platform - Full Clean Statement
-- Generated from latest ACX-ready schema
-- WARNING: This removes schema objects and data.
-- ===============================================================

BEGIN;

-- Drop triggers first
DROP TRIGGER IF EXISTS set_royalty_transactions_updated_at ON royalty_transactions;
DROP TRIGGER IF EXISTS set_royalty_transactions_updated_at ON app_users;
DROP TRIGGER IF EXISTS trg_app_users_updated_at ON royalty_transactions;
DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;
DROP TRIGGER IF EXISTS trg_royalty_transactions_updated_at ON royalty_transactions;
DROP TRIGGER IF EXISTS trg_royalty_transactions_updated_at ON app_users;
DROP TRIGGER IF EXISTS update_royalty_transactions_updated_at ON royalty_transactions;
DROP TRIGGER IF EXISTS update_royalty_transactions_updated_at ON app_users;

-- Drop indexes
DROP INDEX IF EXISTS idx_app_users_email_unique;
DROP INDEX IF EXISTS idx_app_users_google_sub;
DROP INDEX IF EXISTS idx_royalty_asin;
DROP INDEX IF EXISTS idx_royalty_batch;
DROP INDEX IF EXISTS idx_royalty_currency;
DROP INDEX IF EXISTS idx_royalty_marketplace;
DROP INDEX IF EXISTS idx_royalty_product_id;
DROP INDEX IF EXISTS idx_royalty_provider_product_id;
DROP INDEX IF EXISTS idx_royalty_purchase_type;
DROP INDEX IF EXISTS idx_royalty_raw_row;
DROP INDEX IF EXISTS idx_royalty_report_month;
DROP INDEX IF EXISTS idx_royalty_royalty_rule;
DROP INDEX IF EXISTS idx_royalty_source_platform;
DROP INDEX IF EXISTS idx_royalty_title;
DROP INDEX IF EXISTS idx_royalty_transaction_type;
DROP INDEX IF EXISTS idx_royalty_user_id;
DROP INDEX IF EXISTS idx_royalty_user_report_month;

-- Drop tables in dependency-safe order
DROP TABLE IF EXISTS royalty_transactions CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Extensions are intentionally not dropped because they may be shared by other schemas/apps.
-- DROP EXTENSION IF EXISTS vector;
-- DROP EXTENSION IF EXISTS citext;
-- DROP EXTENSION IF EXISTS pgcrypto;

COMMIT;
