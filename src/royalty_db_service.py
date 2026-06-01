import os
import re

import pandas as pd
import psycopg2
from psycopg2.extras import Json, RealDictCursor, execute_values


ACX_COVER_SHEET = "Cover Sheet (ACX)"
ACX_NET_SALES_SHEET = "Sales Detail (Net Sales)"
KDP_TOTAL_EARNINGS_SHEET = "Total Earnings"

SUPPORTED_SOURCE_PLATFORMS = {"KDP", "ACX"}

REPORTING_COLUMNS = [
    "id",
    "source_platform",
    "product_id",
    "provider_product_id",
    "royalty_earner",
    "title",
    "author",
    "asin_isbn",
    "marketplace",
    "country_code",
    "units_sold",
    "units_refunded",
    "net_units_sold",
    "royalty_type",
    "payout_plan",
    "transaction_type",
    "purchase_type",
    "offer",
    "royalty_rule",
    "currency",
    "royalty_rate",
    "payee_split",
    "net_sales",
    "avg_list_price_without_tax",
    "avg_offer_price_without_tax",
    "avg_file_size_mb",
    "avg_delivery_manufacturing_cost",
    "earnings",
    "base_currency",
    "earnings_in_base_currency",
    "fx_rate",
    "report_month",
    "created_at",
    "updated_at",
]

REPORTING_FILTER_COLUMNS = [
    "report_month",
    "source_platform",
    "normalized_title",
    "asin_isbn",
    "product_id",
    "provider_product_id",
    "marketplace",
    "country_code",
    "transaction_type",
    "purchase_type",
    "currency",
    "ingestion_batch_id",
]

REPORTING_SORT_COLUMNS = set(REPORTING_COLUMNS)


def create_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT") or os.getenv("DB_POST") or 5432,
        database=os.getenv("DB_ROYALTY_DATABASE_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )


def clean_text(value):
    if pd.isna(value):
        return None

    if isinstance(value, float) and value.is_integer():
        return str(int(value))

    text = str(value).strip()
    return text or None


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
    except (TypeError, ValueError):
        return None


def normalize_title(title):
    text = clean_text(title)
    return text.lower() if text else None


def infer_country_code(marketplace):
    text = clean_text(marketplace)
    if not text:
        return None

    normalized = text.lower()

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
        "uk": "GB",
    }

    if normalized in mapping:
        return mapping[normalized]

    if re.fullmatch(r"[A-Za-z]{2}", text):
        return text.upper()

    return None


def dataframe_raw_row(row):
    raw_row = {}

    for key, value in row.items():
        if pd.isna(value):
            raw_row[key] = None
        elif hasattr(value, "item"):
            raw_row[key] = value.item()
        else:
            raw_row[key] = value

    return raw_row


def get_excel_sheet_names(excel_file):
    workbook = pd.ExcelFile(excel_file, engine="openpyxl")
    try:
        return set(workbook.sheet_names)
    finally:
        workbook.close()


def parse_acx_period(period_value):
    text = clean_text(period_value)
    if not text:
        return None

    month_map = {
        "JAN": "01",
        "FEB": "02",
        "MAR": "03",
        "APR": "04",
        "MAY": "05",
        "JUN": "06",
        "JUL": "07",
        "AUG": "08",
        "SEP": "09",
        "SEPT": "09",
        "OCT": "10",
        "NOV": "11",
        "DEC": "12",
    }

    match = re.search(
        r"(?P<year>\d{4})[\s_\-]+(?P<month>JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|SEPT|OCT|NOV|DEC)",
        text,
        re.IGNORECASE
    )

    if match:
        month = month_map[match.group("month").upper()]
        return f"{match.group('year')}-{month}-01"

    parsed_date = pd.to_datetime(text, errors="coerce")
    if pd.notna(parsed_date):
        return parsed_date.strftime("%Y-%m-01")

    return None


def extract_acx_report_month(excel_file):
    cover = pd.read_excel(
        excel_file,
        sheet_name=ACX_COVER_SHEET,
        header=None,
        engine="openpyxl"
    )

    for _, row in cover.iterrows():
        values = row.tolist()

        for index, value in enumerate(values):
            text = clean_text(value)
            if not text:
                continue

            if "period:" in text.lower():
                inline_period = text.split(":", 1)[1].strip()
                parsed_inline = parse_acx_period(inline_period)
                if parsed_inline:
                    return parsed_inline

                for candidate in values[index + 1:]:
                    parsed_candidate = parse_acx_period(candidate)
                    if parsed_candidate:
                        return parsed_candidate

    return None


def extract_kdp_report_month(excel_file):
    preview = pd.read_excel(
        excel_file,
        sheet_name=KDP_TOTAL_EARNINGS_SHEET,
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


def upsert_google_user(conn, user_info):
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            INSERT INTO app_users (
                email,
                full_name,
                avatar_url,
                google_sub,
                email_verified,
                last_login_at
            )
            VALUES (%s, %s, %s, %s, %s, NOW())
            ON CONFLICT (google_sub)
            DO UPDATE SET
                email = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                avatar_url = EXCLUDED.avatar_url,
                email_verified = EXCLUDED.email_verified,
                last_login_at = NOW(),
                updated_at = NOW()
            RETURNING id, email, full_name, avatar_url
            """,
            (
                user_info.get("email"),
                user_info.get("name"),
                user_info.get("picture"),
                user_info.get("sub"),
                user_info.get("email_verified", False),
            )
        )

        user = cursor.fetchone()

    conn.commit()
    return user


def get_reporting_records(conn, user_id, filters=None, page=1, page_size=20):
    filters = filters or {}
    page = max(int(page or 1), 1)
    page_size = min(max(int(page_size or 20), 1), 100)
    offset = (page - 1) * page_size

    where_parts = ["user_id = %s"]
    params = [user_id]

    for column in REPORTING_FILTER_COLUMNS:
        value = filters.get(column)

        if value is None or str(value).strip() == "":
            continue

        if column == "normalized_title":
            where_parts.append("normalized_title ILIKE %s")
            params.append(f"%{str(value).strip().lower()}%")
        elif column == "report_month":
            where_parts.append("report_month = %s")
            params.append(str(value).strip())
        else:
            where_parts.append(f"{column} = %s")
            params.append(str(value).strip())

    where_sql = " WHERE " + " AND ".join(where_parts)
    select_columns = ", ".join(REPORTING_COLUMNS)

    sort_by = filters.get("sort_by") if filters else None
    sort_dir = str(filters.get("sort_dir", "asc")).upper() if filters else "ASC"

    if sort_by not in REPORTING_SORT_COLUMNS:
        sort_by = "report_month"

    if sort_dir not in {"ASC", "DESC"}:
        sort_dir = "DESC"

    count_sql = f"""
        SELECT COUNT(*) AS total_count
        FROM royalty_transactions
        {where_sql}
    """

    data_sql = f"""
        SELECT {select_columns}
        FROM royalty_transactions
        {where_sql}
        ORDER BY {sort_by} {sort_dir} NULLS LAST, created_at DESC NULLS LAST, title ASC
        LIMIT %s OFFSET %s
    """

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(count_sql, params)
        total_count = cursor.fetchone()["total_count"]

        cursor.execute(data_sql, params + [page_size, offset])
        records = cursor.fetchall()

    return {
        "records": records,
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size if page_size else 0,
        "filters": filters,
    }


def get_available_report_months(conn, user_id):
    sql = """
        SELECT DISTINCT report_month
        FROM royalty_transactions
        WHERE user_id = %s
          AND report_month >= date_trunc('year', CURRENT_DATE) - INTERVAL '1 year'
          AND report_month < date_trunc('year', CURRENT_DATE) + INTERVAL '1 year'
        ORDER BY report_month DESC
    """

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(sql, (user_id,))
        rows = cursor.fetchall()

    months = []
    for row in rows:
        value = row["report_month"]
        if value is None:
            continue

        months.append({
            "value": value.strftime("%Y-%m-01"),
            "label": value.strftime("%m/%Y"),
        })

    return months


def get_royalty_record(conn, user_id, record_id):
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            SELECT *
            FROM royalty_transactions
            WHERE id = %s
              AND user_id = %s
            """,
            (record_id, user_id)
        )

        return cursor.fetchone()


def delete_royalty_record(conn, user_id, record_id):
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            DELETE FROM royalty_transactions
            WHERE id = %s
              AND user_id = %s
            RETURNING id
            """,
            (record_id, user_id)
        )

        deleted = cursor.fetchone()

    conn.commit()
    return deleted is not None


def delete_user_account_data(conn, user_id):
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            DELETE FROM royalty_transactions
            WHERE user_id = %s
            """,
            (user_id,)
        )
        deleted_transactions = cursor.rowcount

        cursor.execute(
            """
            DELETE FROM app_users
            WHERE id = %s
            RETURNING id
            """,
            (user_id,)
        )
        deleted_user = cursor.fetchone()

    conn.commit()

    return {
        "deleted_transactions": deleted_transactions,
        "deleted_user": deleted_user is not None,
    }


def _check_existing_feed_records(conn, user_id, source_platform, report_month):
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            SELECT COUNT(*) AS record_count
            FROM royalty_transactions
            WHERE user_id = %s
              AND report_month = %s
              AND source_platform = %s
            """,
            (user_id, report_month, source_platform)
        )

        existing_count = cursor.fetchone()["record_count"]

        if existing_count == 0:
            return None

        cursor.execute(
            """
            SELECT *
            FROM royalty_transactions
            WHERE user_id = %s
              AND report_month = %s
              AND source_platform = %s
            ORDER BY id
            LIMIT 20
            """,
            (user_id, report_month, source_platform)
        )

        return existing_count, cursor.fetchall()


def insert_acx_net_sales_excel(conn, excel_file, user_id, report_month=None):
    column_map = {
        "Royalty Earner": "royalty_earner",
        "Product ID": "product_id",
        "Author": "author",
        "Title": "title",
        "Digital ISBN": "asin_isbn",
        "Provider Product ID": "provider_product_id",
        "Transaction Type": "transaction_type",
        "Marketplace": "marketplace",
        "Purchase Type": "purchase_type",
        "Offer": "offer",
        "Royalty Rule": "royalty_rule",
        "Additional Rule Details": "additional_rule_details",
        "Currency": "currency",
        "Royalty Rate": "royalty_rate",
        "Payee Split": "payee_split",
        "Net Units": "net_units_sold",
        "Net Sales": "net_sales",
        "Net Royalties Earned": "earnings",
    }

    final_report_month = extract_acx_report_month(excel_file) or report_month

    if not final_report_month:
        raise ValueError(
            "Report month not found in 'Cover Sheet (ACX)'. "
            "Expected a Period value like '2025_OCT'."
        )

    existing = _check_existing_feed_records(conn, user_id, "ACX", final_report_month)
    if existing:
        existing_count, existing_records = existing
        return {
            "status": "ALREADY_EXISTS",
            "source_platform": "ACX",
            "message": f"ACX data already exists for report_month {final_report_month}. Insert skipped.",
            "report_month": final_report_month,
            "existing_record_count": existing_count,
            "sample_records": existing_records,
        }

    df = pd.read_excel(
        excel_file,
        sheet_name=ACX_NET_SALES_SHEET,
        engine="openpyxl"
    )

    missing_columns = [column for column in column_map if column not in df.columns]
    if missing_columns:
        raise ValueError(
            f"Missing expected ACX columns in '{ACX_NET_SALES_SHEET}': "
            + ", ".join(missing_columns)
        )

    df = df[list(column_map.keys())]
    df = df.rename(columns=column_map)

    rows = []

    for _, row in df.iterrows():
        title = clean_text(row.get("title"))

        if not title:
            continue

        net_units = clean_number(row.get("net_units_sold")) or 0
        transaction_type = clean_text(row.get("transaction_type"))
        units_sold = int(net_units) if net_units > 0 else 0
        units_refunded = abs(int(net_units)) if net_units < 0 or str(transaction_type).lower() == "return" else 0
        currency = clean_text(row.get("currency"))
        earnings = clean_number(row.get("earnings"))

        rows.append((
            user_id,
            "ACX",
            final_report_month,
            title,
            normalize_title(title),
            clean_text(row.get("author")),
            clean_text(row.get("asin_isbn")),
            clean_text(row.get("marketplace")),
            infer_country_code(row.get("marketplace")),
            units_sold,
            units_refunded,
            net_units,
            transaction_type,
            clean_text(row.get("purchase_type")),
            currency,
            earnings,
            currency,
            earnings,
            1.0000 if currency else None,
            Json(dataframe_raw_row(row)),
            1.0000,
            "MAPPED",
            clean_text(row.get("product_id")),
            clean_text(row.get("provider_product_id")),
            clean_text(row.get("royalty_earner")),
            transaction_type,
            clean_text(row.get("purchase_type")),
            clean_text(row.get("offer")),
            clean_text(row.get("royalty_rule")),
            clean_number(row.get("royalty_rate")),
            clean_number(row.get("payee_split")),
            clean_number(row.get("net_sales")),
            clean_text(row.get("additional_rule_details")),
        ))

    if not rows:
        raise ValueError(f"No valid rows found in '{ACX_NET_SALES_SHEET}' tab.")

    insert_sql = """
        INSERT INTO royalty_transactions (
            user_id,
            source_platform,
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
            earnings,
            base_currency,
            earnings_in_base_currency,
            fx_rate,
            raw_row,
            ai_confidence_score,
            ai_mapping_status,
            product_id,
            provider_product_id,
            royalty_earner,
            transaction_type,
            purchase_type,
            offer,
            royalty_rule,
            royalty_rate,
            payee_split,
            net_sales,
            ai_notes
        ) VALUES %s
    """

    with conn.cursor() as cursor:
        execute_values(cursor, insert_sql, rows)

    conn.commit()

    return {
        "status": "INSERTED",
        "source_platform": "ACX",
        "inserted_rows": len(rows),
        "report_month": final_report_month,
    }


def insert_total_earnings_excel(conn, excel_file, user_id, report_month=None):
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

    final_report_month = extract_kdp_report_month(excel_file) or report_month

    if not final_report_month:
        raise ValueError(
            "Report month not found in first row of 'Total Earnings'. "
            "Please pass report_month manually, example: report_month='2026-05-01'"
        )

    existing = _check_existing_feed_records(conn, user_id, "KDP", final_report_month)
    if existing:
        existing_count, existing_records = existing
        return {
            "status": "ALREADY_EXISTS",
            "source_platform": "KDP",
            "message": f"KDP data already exists for report_month {final_report_month}. Insert skipped.",
            "report_month": final_report_month,
            "existing_record_count": existing_count,
            "sample_records": existing_records,
        }

    df = pd.read_excel(
        excel_file,
        sheet_name=KDP_TOTAL_EARNINGS_SHEET,
        header=1,
        engine="openpyxl"
    )

    df = df[list(column_map.keys())]
    df = df.rename(columns=column_map)

    rows = []

    for _, row in df.iterrows():
        title = clean_text(row.get("title"))

        if not title:
            continue

        raw_row = dataframe_raw_row(row)
        currency = clean_text(row.get("currency"))
        earnings = clean_number(row.get("earnings"))

        rows.append((
            user_id,
            "KDP",
            final_report_month,
            title,
            normalize_title(title),
            clean_text(row.get("author")),
            clean_text(row.get("asin_isbn")),
            clean_text(row.get("marketplace")),
            infer_country_code(row.get("marketplace")),
            int(clean_number(row.get("units_sold")) or 0),
            int(clean_number(row.get("units_refunded")) or 0),
            clean_number(row.get("net_units_sold")),
            clean_text(row.get("royalty_type")),
            clean_text(row.get("payout_plan")),
            currency,
            clean_number(row.get("avg_list_price_without_tax")),
            clean_number(row.get("avg_offer_price_without_tax")),
            clean_number(row.get("avg_file_size_mb")),
            clean_number(row.get("avg_delivery_manufacturing_cost")),
            earnings,
            currency,
            earnings,
            1.0000 if currency else None,
            Json(raw_row),
            1.0000,
            "MAPPED",
        ))

    if not rows:
        raise ValueError("No valid rows found in 'Total Earnings' tab.")

    insert_sql = """
        INSERT INTO royalty_transactions (
            user_id,
            source_platform,
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
            base_currency,
            earnings_in_base_currency,
            fx_rate,
            raw_row,
            ai_confidence_score,
            ai_mapping_status
        ) VALUES %s
    """

    with conn.cursor() as cursor:
        execute_values(cursor, insert_sql, rows)

    conn.commit()

    return {
        "status": "INSERTED",
        "source_platform": "KDP",
        "inserted_rows": len(rows),
        "report_month": final_report_month,
    }


def insert_royalty_excel(conn, excel_file, user_id):
    sheet_names = get_excel_sheet_names(excel_file)

    if ACX_COVER_SHEET in sheet_names and ACX_NET_SALES_SHEET in sheet_names:
        return insert_acx_net_sales_excel(conn=conn, excel_file=excel_file, user_id=user_id)

    if KDP_TOTAL_EARNINGS_SHEET in sheet_names:
        return insert_total_earnings_excel(conn=conn, excel_file=excel_file, user_id=user_id)

    raise ValueError(
        "Unsupported royalty workbook. Expected KDP 'Total Earnings' or "
        f"ACX '{ACX_NET_SALES_SHEET}' with '{ACX_COVER_SHEET}'."
    )
