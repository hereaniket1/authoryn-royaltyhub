# Authoryn Royalty Hub

Authoryn Royalty Hub is a Flask web app for ingesting author royalty spreadsheets, storing normalized royalty transactions in PostgreSQL, and querying/reporting on royalty performance through a simple single-page interface.

The current app focuses on KDP-style `Total Earnings` Excel reports, Google OAuth authentication, protected reporting APIs, and an experimental AI query endpoint backed by Hugging Face.

## Features

- Google OAuth login and session-based authentication
- Excel upload flow for royalty statements
- KDP `Total Earnings` sheet parsing with normalized transaction inserts
- PostgreSQL schema for users and royalty transactions
- Reporting API with filters and pagination
- Natural-language royalty analytics endpoint
- Single-page HTML/CSS/JavaScript frontend
- Setup SQL scripts for KDP and ACX-ready schemas

## Project Structure

```text
.
├── README.md
├── requirements.txt
├── setup/
│   ├── royalty_ai_schema.sql
│   ├── royalty_ai_schema_acx_ready.sql
│   ├── royalty_clean_statement.sql
│   └── royalty_clean_statement_acx_full.sql
└── src/
    ├── app.py
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

The app imports `psycopg2` and `authlib`. If your environment is built only from the current `requirements.txt`, install those as well:

```bash
pip install psycopg2-binary authlib
```

## Setup

1. Create and activate a virtual environment.

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies.

```bash
pip install -r requirements.txt
pip install psycopg2-binary authlib
```

3. Create the database schema.

```bash
psql -f setup/royalty_ai_schema.sql
```

For ACX-ready fields, use:

```bash
psql -f setup/royalty_ai_schema_acx_ready.sql
```

4. Configure environment variables.

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

In Google Cloud Console, add this redirect URI for local development:

```text
http://localhost:5000/auth/google/callback
```

5. Run the app.

```bash
python src/app.py
```

Open:

```text
http://localhost:5000
```

## Main Routes

- `GET /` - serves the single-page app
- `POST /post-query` - sends a natural-language analytics query to the AI engine
- `GET /auth/google/login` - starts Google OAuth login
- `GET /auth/google/callback` - handles Google OAuth callback
- `GET /auth/me` - returns the current session user
- `POST /auth/logout` - clears the current session
- `GET /reporting` - serves the reporting page, requires login
- `GET /api/reporting` - returns paginated royalty rows, requires login
- `POST /upload` - uploads and ingests an Excel royalty statement, requires login

## Upload Format

The ingestion flow currently expects an `.xlsx` file with a sheet named:

```text
Total Earnings
```

The parser reads the report month from the first row and uses the second row as the header row. Expected columns include:

- `Title`
- `Author`
- `ASIN/ISBN`
- `Marketplace`
- `Units Sold`
- `Units Refunded`
- `Net Units Sold or Combined KENP`
- `Royalty Type`
- `Payout Plan`
- `Currency`
- `Avg. List Price without tax`
- `Avg. Offer Price without tax`
- `Avg. File Size (MB)`
- `Avg. Delivery/Manufacturing cost`
- `Earnings`

If data already exists for the detected `report_month`, the insert is skipped.

## Reporting Filters

`GET /api/reporting` supports these query parameters:

- `report_month`
- `normalized_title`
- `asin_isbn`
- `marketplace`
- `currency`
- `ingestion_batch_id`
- `page`
- `page_size`

Example:

```text
/api/reporting?marketplace=Amazon.com&currency=USD&page=1&page_size=20
```

## AI Query Notes

The AI query path is experimental. `POST /post-query` currently calls Hugging Face with the user query and returns the model response. The app contains helper functions for validating an analytics plan and compiling SQL, but that full plan-to-SQL execution path is not currently wired into `run_llm_sql_engine`.

Example questions the app is designed around:

- `top earning titles in Germany`
- `compare KU vs direct sales`
- `show declining books`

## Current Limitations

- `README.md` is now documented, but dependency metadata still needs cleanup.
- `requirements.txt` does not currently list every imported package.
- The PostgreSQL connection is created globally in `src/app.py`.
- Uploaded files are saved using the original filename.
- The AI analytics SQL compiler exists but is not fully connected to the `/post-query` route.
- Upload ingestion currently stores transactions without linking them to the logged-in `user_id`.

## Development Notes

- App entrypoint: `src/app.py`
- Frontend template: `src/templates/react_one_pager.html`
- Default upload folder used by the Flask app: `uploads`
- Example/source upload files are present under `src/uploads`

