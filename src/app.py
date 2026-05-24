import requests
from flask import Flask, g, render_template, request, jsonify
import os
from fastembed import TextEmbedding
import re
import pandas as pd
from psycopg2.extras import execute_values, Json, RealDictCursor
model = TextEmbedding()

import psycopg2

HUGGINGFACE_AI_TOKEN = os.getenv("HUGGINGFACE_AI_TOKEN")
HUGGINGFACE_MODEL_URL = os.getenv("HUGGINGFACE_MODEL_URL")
HUGGINGFACE_API_URL = os.getenv("HUGGINGFACE_API_URL")

app = Flask(__name__)

try:
    conn = psycopg2.connect(
        host= os.getenv("DB_HOST"),
        port=os.getenv("DB_POST"),
        database=os.getenv("DB_ROYALTY_DATABASE_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
except Exception as error:
    print("DB Connected wrong!")



def huggingface_llm_query(payload):
    header = {
        "Authorization": f"Bearer {HUGGINGFACE_AI_TOKEN}"
    }
    response = requests.post(HUGGINGFACE_API_URL, headers=header, json=payload)
    return response.json()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.teardown_appcontext
def close_db(error):
    db = g.pop("db", None)

    if db is not None:
        db.close()
        print("DB connection closed")

@app.route("/")
def index():
    # # Create cursor
    # cursor = conn.cursor()
    #
    # # Execute query
    # cursor.execute("SELECT * FROM royalty_transactions")
    #
    # # Fetch all rows
    # rows = cursor.fetchall()
    #
    # # Print rows
    # for row in rows:
    #     print(row)

    return render_template("react_one_pager.html")

@app.route("/post-query", methods=["POST"])
def post_query():

    input_text = request.form.get("query")

    print("User Query:", input_text)

    # Call your LLM API here
    llm_response = huggingface_llm_query({
        "messages": [
            {
                "role": "user",
                "content": f"{input_text}"
            }
        ],
        "model": "meta-llama/Llama-3.1-8B-Instruct"
    })

    print("LLM Response:", llm_response)
    return jsonify(llm_response)

def insert_total_earnings_excel(conn, excel_file, report_month=None):
    column_map = {
        "Title": "title",
        "Author": "author",
        "ASIN/ISBN": "asin_isbn",
        "Marketplace": "marketplace",
        "Units Sold": "units_sold",
        "Units Refunded": "units_refunded",
        "Net Units Sold or Combined KENP": "net_units_sold",
        "Royalty Type": "royalty_type",
        "Payout Plan": "payout_plan",
        "Currency": "currency",
        "Avg. List Price without tax": "avg_list_price_without_tax",
        "Avg. Offer Price without tax": "avg_offer_price_without_tax",
        "Avg. File Size (MB)": "avg_file_size_mb",
        "Avg. Delivery/Manufacturing cost": "avg_delivery_manufacturing_cost",
        "Earnings": "earnings",
    }

    def clean_number(value):
        if pd.isna(value) or value == "":
            return None
        if isinstance(value, str):
            value = (
                value.replace(",", "")
                .replace("$", "")
                .replace("₹", "")
                .replace("€", "")
                .replace("£", "")
                .strip()
            )
        try:
            return float(value)
        except ValueError:
            return None

    def normalize_title(title):
        if pd.isna(title):
            return None
        return str(title).strip().lower()

    def infer_country_code(marketplace):
        if pd.isna(marketplace):
            return None

        mapping = {
            "amazon.com": "US",
            "amazon.in": "IN",
            "amazon.co.uk": "GB",
            "amazon.ca": "CA",
            "amazon.com.au": "AU",
            "amazon.de": "DE",
            "amazon.fr": "FR",
            "amazon.it": "IT",
            "amazon.es": "ES",
            "amazon.co.jp": "JP",
        }

        return mapping.get(str(marketplace).strip().lower())

    def extract_report_month_from_first_row(excel_file):
        preview = pd.read_excel(
            excel_file,
            sheet_name="Total Earnings",
            header=None,
            nrows=1,
            engine="openpyxl"
        )

        first_row_values = [
            str(v).strip()
            for v in preview.iloc[0].tolist()
            if pd.notna(v) and str(v).strip()
        ]

        first_row_text = " ".join(first_row_values)

        parsed_date = pd.to_datetime(first_row_text, errors="coerce")

        if pd.notna(parsed_date):
            return parsed_date.strftime("%Y-%m-01")

        match = re.search(
            r"(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s\-]+(\d{4})",
            first_row_text,
            re.IGNORECASE
        )

        if match:
            parsed_date = pd.to_datetime(match.group(0), errors="coerce")
            if pd.notna(parsed_date):
                return parsed_date.strftime("%Y-%m-01")

        return None

    extracted_report_month = extract_report_month_from_first_row(excel_file)

    if extracted_report_month:
        final_report_month = extracted_report_month
    elif report_month:
        final_report_month = report_month
    else:
        raise ValueError(
            "Report month not found in first row of 'Total Earnings'. "
            "Please pass report_month manually, example: report_month='2026-05-01'"
        )

    # 1. Check whether this month already exists
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            SELECT COUNT(*) AS record_count
            FROM royalty_transactions
            WHERE report_month = %s
            """,
            (final_report_month,)
        )

        existing_count = cursor.fetchone()["record_count"]

        if existing_count > 0:
            cursor.execute(
                """
                SELECT *
                FROM royalty_transactions
                WHERE report_month = %s
                ORDER BY id
                    LIMIT 20
                """,
                (final_report_month,)
            )

            existing_records = cursor.fetchall()

            return {
                "status": "ALREADY_EXISTS",
                "message": f"Data already exists for report_month {final_report_month}. Insert skipped.",
                "report_month": final_report_month,
                "existing_record_count": existing_count,
                "sample_records": existing_records,
            }

    # 2. If no data exists for that month, read Excel and insert
    df = pd.read_excel(
        excel_file,
        sheet_name="Total Earnings",
        header=1,
        engine="openpyxl"
    )

    df = df[list(column_map.keys())]
    df = df.rename(columns=column_map)

    rows = []

    for _, row in df.iterrows():
        title = row.get("title")

        if pd.isna(title) or str(title).strip() == "":
            continue

        raw_row = row.where(pd.notnull(row), None).to_dict()

        rows.append((
            final_report_month,
            row.get("title"),
            normalize_title(row.get("title")),
            row.get("author"),
            row.get("asin_isbn"),
            row.get("marketplace"),
            infer_country_code(row.get("marketplace")),
            int(clean_number(row.get("units_sold")) or 0),
            int(clean_number(row.get("units_refunded")) or 0),
            clean_number(row.get("net_units_sold")),
            row.get("royalty_type"),
            row.get("payout_plan"),
            row.get("currency"),
            clean_number(row.get("avg_list_price_without_tax")),
            clean_number(row.get("avg_offer_price_without_tax")),
            clean_number(row.get("avg_file_size_mb")),
            clean_number(row.get("avg_delivery_manufacturing_cost")),
            clean_number(row.get("earnings")),
            Json(raw_row),
            1.0000,
            "MAPPED",
        ))

    if not rows:
        raise ValueError("No valid rows found in 'Total Earnings' tab.")

    insert_sql = """
                 INSERT INTO royalty_transactions (
                     report_month,
                     title,
                     normalized_title,
                     author,
                     asin_isbn,
                     marketplace,
                     country_code,
                     units_sold,
                     units_refunded,
                     net_units_sold,
                     royalty_type,
                     payout_plan,
                     currency,
                     avg_list_price_without_tax,
                     avg_offer_price_without_tax,
                     avg_file_size_mb,
                     avg_delivery_manufacturing_cost,
                     earnings,
                     raw_row,
                     ai_confidence_score,
                     ai_mapping_status
                 ) VALUES %s \
                 """

    with conn.cursor() as cursor:
        execute_values(cursor, insert_sql, rows)

    conn.commit()

    return {
        "status": "INSERTED",
        "inserted_rows": len(rows),
        "report_month": final_report_month,
    }

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)

    name = file.filename.lower()

    data = insert_total_earnings_excel(conn=conn, excel_file=file)

    # ingest
    # ingest_excel_to_vector_db("uploads/KDP Royalty statement.xlsx")

    # query
    # results = search("earnings for April's Fools")
    # print("RES ", results)
    # for r in results:
    #     print(r["title"], r["earnings"])

    return jsonify({"status": "ok", "results": data})
    # if name.endswith(".xlsx"):
    #     print("INSIDE XCLX ")
    #     try:
    #         # Read specific sheet, skip first row
    #         df = pd.read_excel(
    #             save_path,
    #             sheet_name="Total Earnings",
    #             skiprows=1   # ignore first row
    #         )
    #
    #         # Clean column names (optional but useful)
    #         df.columns = [str(col).strip() for col in df.columns]
    #
    #         # Convert to list of dicts (JSON friendly)
    #         data = df.fillna("")# .to_dict(orient="records")
    #         print(data)
    #         return jsonify({
    #             "status": "ok",
    #             "filename": file.filename,
    #             "rows": len(data),
    #             "columns": list(df.columns),
    #             "data": data[:1000]  # limit response (important!)
    #         })
    #
    #     except Exception as e:
    #         print(e)
    #         return jsonify({
    #             "error": "Failed to process Excel",
    #             "details": str(e)
    #         }), 500
    # else:
    #     print("INSIDE ELSE ")
    #     return jsonify({"status": "ok", "filename": file.filename})

def row_to_text(row):
    return (
        f"Title {row.get('title')} by {row.get('author')} "
        f"in {row.get('marketplace')} sold {row.get('units_sold')} units "
        f"earning {row.get('earnings')} {row.get('currency')} "
        f"with royalty {row.get('royalty_type')}"
    )

def read_excel(file):
    df = pd.read_excel(file)
    return df# .to_dict(orient="records")


if __name__ == "__main__":
    app.run(debug=True)
