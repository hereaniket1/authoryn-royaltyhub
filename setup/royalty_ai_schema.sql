
-- Create and switch to database
CREATE DATABASE royalty_platform;

\c royalty_platform


-- royalty_ai_schema.sql
-- PostgreSQL schema for AI-ready royalty report ingestion and analysis

-- Optional: create a dedicated database manually before running this file:
-- CREATE DATABASE royalty_ai;
-- Then connect using: \c royalty_ai

-- Optional extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Optional extension for AI/vector search.
-- Uncomment only if pgvector is installed in your PostgreSQL instance.
-- CREATE EXTENSION IF NOT EXISTS vector;


-- Required for case-insensitive email handling. Safe to run repeatedly.
CREATE EXTENSION IF NOT EXISTS citext;

-- Users are created only after successful Google login/signup.
-- Use app_users instead of users because USER is a PostgreSQL keyword-ish system concept.
CREATE TABLE IF NOT EXISTS app_users (
                                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Stable Google identity. Do not use email as the primary identity because email can change.
                                         google_sub TEXT NOT NULL UNIQUE,

                                         email CITEXT,
                                         email_verified BOOLEAN DEFAULT FALSE,
                                         full_name TEXT,
                                         avatar_url TEXT,

                                         status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
                                         last_login_at TIMESTAMP,
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_email_unique
    ON app_users(email)
    WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_app_users_google_sub
    ON app_users(google_sub);


CREATE TABLE IF NOT EXISTS royalty_transactions (
                                                    id BIGSERIAL PRIMARY KEY,

    -- Nullable for old/demo rows and AI search without login. Required when a user uploads a file.
                                                    user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,

                                                    source_file_id BIGINT,
                                                    ingestion_batch_id UUID DEFAULT gen_random_uuid(),

                                                    report_month DATE,

                                                    title TEXT NOT NULL,
                                                    normalized_title TEXT,

                                                    author TEXT,
                                                    asin_isbn VARCHAR(32),

                                                    marketplace VARCHAR(50),
                                                    country_code VARCHAR(5),

                                                    units_sold INTEGER DEFAULT 0,
                                                    units_refunded INTEGER DEFAULT 0,
                                                    net_units_sold NUMERIC(14,2),

                                                    royalty_type VARCHAR(50),
                                                    payout_plan VARCHAR(50),

                                                    currency CHAR(3),

                                                    avg_list_price_without_tax NUMERIC(14,4),
                                                    avg_offer_price_without_tax NUMERIC(14,4),
                                                    avg_file_size_mb NUMERIC(10,2),
                                                    avg_delivery_manufacturing_cost NUMERIC(14,4),

                                                    earnings NUMERIC(16,4),

                                                    earnings_in_base_currency NUMERIC(16,4),
                                                    base_currency CHAR(3) DEFAULT 'USD',
                                                    fx_rate NUMERIC(18,8),

                                                    ai_confidence_score NUMERIC(5,4),
                                                    ai_mapping_status VARCHAR(30),
                                                    ai_notes TEXT,

                                                    raw_row JSONB,

                                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional vector column for semantic search.
-- Uncomment after enabling pgvector.
-- ALTER TABLE royalty_transactions
-- ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Useful indexes for analytics and search
CREATE INDEX IF NOT EXISTS idx_royalty_title
    ON royalty_transactions(normalized_title);

CREATE INDEX IF NOT EXISTS idx_royalty_asin
    ON royalty_transactions(asin_isbn);

CREATE INDEX IF NOT EXISTS idx_royalty_marketplace
    ON royalty_transactions(marketplace);

CREATE INDEX IF NOT EXISTS idx_royalty_report_month
    ON royalty_transactions(report_month);

CREATE INDEX IF NOT EXISTS idx_royalty_user_id
    ON royalty_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_royalty_user_report_month
    ON royalty_transactions(user_id, report_month);

CREATE INDEX IF NOT EXISTS idx_royalty_currency
    ON royalty_transactions(currency);

CREATE INDEX IF NOT EXISTS idx_royalty_batch
    ON royalty_transactions(ingestion_batch_id);

CREATE INDEX IF NOT EXISTS idx_royalty_raw_row
    ON royalty_transactions USING GIN(raw_row);

-- Optional helper function to auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;

CREATE TRIGGER trg_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_royalty_transactions_updated_at ON royalty_transactions;

CREATE TRIGGER trg_royalty_transactions_updated_at
    BEFORE UPDATE ON royalty_transactions
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Sample insert for testing
-- INSERT INTO royalty_transactions (
--     report_month,
--     title,
--     normalized_title,
--     author,
--     asin_isbn,
--     marketplace,
--     country_code,
--     units_sold,
--     units_refunded,
--     net_units_sold,
--     royalty_type,
--     payout_plan,
--     currency,
--     avg_list_price_without_tax,
--     avg_offer_price_without_tax,
--     avg_file_size_mb,
--     avg_delivery_manufacturing_cost,
--     earnings,
--     raw_row,
--     ai_confidence_score,
--     ai_mapping_status
-- ) VALUES (
--     '2026-05-01',
--     'Example Book',
--     'example book',
--     'Example Author',
--     'B000EXAMPLE',
--     'Amazon.com',
--     'US',
--     10,
--     1,
--     9,
--     'eBook',
--     '70%',
--     'USD',
--     9.9900,
--     8.9900,
--     2.50,
--     0.1500,
--     62.9300,
--     '{"source":"sample"}'::jsonb,
--     0.9500,
--     'MAPPED'
-- );

-- Quick verification query
-- SELECT * FROM royalty_transactions LIMIT 10;


-- Migration helper for an existing database where royalty_transactions already exists.
-- Keep this even if the CREATE TABLE above is used from scratch.
ALTER TABLE royalty_transactions
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_royalty_user_id
    ON royalty_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_royalty_user_report_month
    ON royalty_transactions(user_id, report_month);
