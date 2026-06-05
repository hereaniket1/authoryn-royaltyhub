-- Master schema for Authoryn Royalty Hub
-- Covers base users, rates, royalty transactions, and ACX/KDP extensions.

CREATE DATABASE royalty_platform;
\c royalty_platform

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_sub TEXT NOT NULL UNIQUE,
    email CITEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    full_name TEXT,
    avatar_url TEXT,
    base_currency CHAR(3) DEFAULT 'USD',
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

CREATE TABLE IF NOT EXISTS currency_rates (
    id BIGSERIAL PRIMARY KEY,
    rate_month DATE NOT NULL,
    base_currency CHAR(3) NOT NULL,
    quote_currency CHAR(3) NOT NULL,
    fx_rate NUMERIC(18,8) NOT NULL,
    source TEXT DEFAULT 'frankfurter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (rate_month, base_currency, quote_currency)
);

CREATE INDEX IF NOT EXISTS idx_currency_rates_month_base
    ON currency_rates(rate_month, base_currency);

CREATE TABLE IF NOT EXISTS royalty_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    source_file_id BIGINT,
    ingestion_batch_id UUID DEFAULT gen_random_uuid(),
    source_platform VARCHAR(30),
    product_id VARCHAR(64),
    provider_product_id VARCHAR(64),
    royalty_earner TEXT,
    transaction_type VARCHAR(80),
    purchase_type VARCHAR(80),
    offer TEXT,
    royalty_rule TEXT,
    royalty_rate NUMERIC(10,4),
    payee_split NUMERIC(10,4),
    net_sales NUMERIC(16,4),
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

CREATE INDEX IF NOT EXISTS idx_royalty_source_platform
    ON royalty_transactions(source_platform);

CREATE INDEX IF NOT EXISTS idx_royalty_product_id
    ON royalty_transactions(product_id);

CREATE INDEX IF NOT EXISTS idx_royalty_provider_product_id
    ON royalty_transactions(provider_product_id);

CREATE INDEX IF NOT EXISTS idx_royalty_transaction_type
    ON royalty_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_royalty_purchase_type
    ON royalty_transactions(purchase_type);

CREATE INDEX IF NOT EXISTS idx_royalty_royalty_rule
    ON royalty_transactions(royalty_rule);

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

ALTER TABLE royalty_transactions
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_royalty_user_id
    ON royalty_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_royalty_user_report_month
    ON royalty_transactions(user_id, report_month);

COMMENT ON COLUMN royalty_transactions.source_platform IS 'Source feed/platform such as KDP, ACX, AUDIBLE, KOBO, APPLE_BOOKS.';
COMMENT ON COLUMN royalty_transactions.product_id IS 'Generic product identifier from source feed. For ACX this maps to Product ID.';
COMMENT ON COLUMN royalty_transactions.provider_product_id IS 'Provider-specific product identifier. For ACX this maps to Provider Product ID.';
COMMENT ON COLUMN royalty_transactions.royalty_earner IS 'Royalty earner/payee name from source feed.';
COMMENT ON COLUMN royalty_transactions.transaction_type IS 'Feed transaction type such as sale, refund, bounty, adjustment.';
COMMENT ON COLUMN royalty_transactions.purchase_type IS 'Purchase type from source feed. For ACX this maps to Purchase Type.';
COMMENT ON COLUMN royalty_transactions.offer IS 'Offer/package/plan details from source feed.';
COMMENT ON COLUMN royalty_transactions.royalty_rule IS 'Royalty rule from source feed.';
COMMENT ON COLUMN royalty_transactions.royalty_rate IS 'Royalty rate percentage/decimal as provided by source feed.';
COMMENT ON COLUMN royalty_transactions.payee_split IS 'Payee split percentage/decimal as provided by source feed.';
COMMENT ON COLUMN royalty_transactions.net_sales IS 'Net sales amount before royalty calculation, where provided by source feed.';
