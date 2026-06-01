# The Royalty Hub

The Royalty Hub is a Flask web app for ingesting author royalty spreadsheets, storing normalized royalty transactions in PostgreSQL, and reviewing user-scoped royalty data through a single-page interface.

The active data model is `setup/royalty_ai_schema_acx_ready.sql`. It supports both KDP royalty statements and ACX/Audible royalty feeds.

## Features

- Google OAuth login and session-based authentication
- Login-gated AI query and royalty upload experience
- KDP `Total Earnings` Excel ingestion
- ACX `Sales Detail (Net Sales)` Excel ingestion
- User-scoped royalty transaction storage with `user_id`
- `source_platform` support for `KDP` and `ACX`
- Reporting table with filters, pagination, clickable record IDs, record detail overlay, and per-record delete
- Report-month dropdown capped to the current year and previous year
- Account data deletion through `Delete All My Data`
- Static CSS and JavaScript assets separated from templates
- Experimental natural-language analytics endpoint backed by Hugging Face

## Project Structure

```text
.
├── README.md
├── requirements.txt
├── setup/
│   ├── royalty_ai_schema.sql
│   ├── royalty_ai_schema_acx_ready.sql
│   └── royalty_clean_statement_acx_full.sql
└── src/
    ├── app.py
    ├── royalty_db_service.py
    ├── static/
    │   ├── css/
    │   │   ├── popup_callback.css
    │   │   └── react_one_pager.css
    │   └── js/
    │       ├── popup_callback.js
    │       └── react_one_pager.js
    ├── templates/
    │   ├── popup_callback.html
    │   └── react_one_pager.html
    └── uploads/
```

## Requirements

- Python 3.10+
- PostgreSQL
- Google OAuth credentials
- Hugging Face API token and endpoint, if using AI query features

Install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Database Setup

Use the ACX-ready schema for new local databases:

```bash
psql -f setup/royalty_ai_schema_acx_ready.sql
```

This creates:

- `app_users`
- `royalty_transactions`
- ACX fields such as `product_id`, `provider_product_id`, `royalty_earner`, `transaction_type`, `purchase_type`, `offer`, `royalty_rule`, `royalty_rate`, `payee_split`, and `net_sales`
- `user_id` and reporting indexes

## Environment

```bash
export FLASK_SECRET_KEY="replace-me"
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_ROYALTY_DATABASE_NAME="royalty_platform"
export DB_USER="postgres"
export DB_PASSWORD="postgres"

export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
export GOOGLE_REDIRECT_URI="http://localhost:5000/auth/google/callback"

export HUGGINGFACE_AI_TOKEN="your-huggingface-token"
export HUGGINGFACE_API_URL="your-huggingface-chat-endpoint"
export HUGGINGFACE_MODEL_URL="optional-model-url"
```

In Google Cloud Console, add:

```text
http://localhost:5000/auth/google/callback
```

## Run

```bash
python3 src/app.py
```

Open:

```text
http://localhost:5000
```

## Upload Formats

KDP files must include a sheet named:

```text
Total Earnings
```

The KDP parser reads the report month from the first row and expects the KDP earnings headers on the second row.

ACX files must include:

```text
Cover Sheet (ACX)
Sales Detail (Net Sales)
```

The ACX parser reads the report month from the `Period:` row on `Cover Sheet (ACX)`, for example `2025_OCT`, and imports all rows from `Sales Detail (Net Sales)`.

Supported ACX columns:

- `Royalty Earner`
- `Product ID`
- `Author`
- `Title`
- `Digital ISBN`
- `Provider Product ID`
- `Transaction Type`
- `Marketplace`
- `Purchase Type`
- `Offer`
- `Royalty Rule`
- `Additional Rule Details`
- `Currency`
- `Royalty Rate`
- `Payee Split`
- `Net Units`
- `Net Sales`
- `Net Royalties Earned`

## Main Routes

- `GET /` - serves the single-page app
- `POST /post-query` - sends a natural-language analytics query, requires login
- `GET /auth/google/login` - starts Google OAuth login
- `GET /auth/google/callback` - handles Google OAuth callback
- `GET /auth/me` - returns the current session user
- `POST /auth/logout` - clears the current session
- `GET /reporting` - serves reporting, requires login
- `GET /api/reporting` - returns paginated user-scoped royalty rows
- `GET /api/reporting/months` - returns available report months for the current and previous year
- `GET /api/reporting/<id>` - returns one user-owned royalty row
- `DELETE /api/reporting/<id>` - deletes one user-owned royalty row
- `DELETE /api/me/data` - deletes the current user's royalty rows and user record
- `POST /upload` - uploads and ingests a KDP or ACX `.xlsx` file, requires login

## Reporting Filters

`GET /api/reporting` supports:

- `report_month`
- `source_platform`
- `normalized_title`
- `asin_isbn`
- `product_id`
- `provider_product_id`
- `marketplace`
- `country_code`
- `transaction_type`
- `purchase_type`
- `currency`
- `ingestion_batch_id`
- `page`
- `page_size`
- `sort_by`
- `sort_dir`

Example:

```text
/api/reporting?source_platform=ACX&country_code=US&page=1&page_size=50
```

## Development Notes

- Flask routes live in `src/app.py`
- Database operations and royalty ingestion live in `src/royalty_db_service.py`
- Frontend template: `src/templates/react_one_pager.html`
- Frontend assets: `src/static/css` and `src/static/js`
- Supported `source_platform` values are `KDP` and `ACX`
