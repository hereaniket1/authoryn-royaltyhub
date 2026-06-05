from dataclasses import dataclass
from datetime import date, datetime, timedelta

from psycopg2.extras import RealDictCursor


@dataclass(frozen=True)
class DashboardRange:
    key: str
    label: str
    months: int
    days: int | None = None


DASHBOARD_RANGES = {
    "7d": DashboardRange("7d", "Last 7 days", 1, 7),
    "30d": DashboardRange("30d", "Last 30 days", 1, 30),
    "3m": DashboardRange("3m", "Last 3 months", 3),
    "5m": DashboardRange("5m", "Last 5 months", 5),
    "12m": DashboardRange("12m", "Last 12 months", 12),
    "5y": DashboardRange("5y", "Last 5 years", 60),
}

DEFAULT_RANGE_KEY = "5m"


def get_range_config(range_key):
    return DASHBOARD_RANGES.get(range_key, DASHBOARD_RANGES[DEFAULT_RANGE_KEY])


def _fetch_latest_report_month(conn, user_id):
    sql = """
        SELECT MAX(report_month) AS latest_report_month
        FROM royalty_transactions
        WHERE user_id = %s
    """

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(sql, (user_id,))
        row = cursor.fetchone() or {}

    return row.get("latest_report_month")


def _fetch_summary_rows_for_months(conn, user_id, latest_report_month, range_config, previous=False):
    if previous:
        start_expr = f"DATE_TRUNC('month', %s::date) - INTERVAL '{(range_config.months * 2) - 1} months'"
        end_expr = f"DATE_TRUNC('month', %s::date) - INTERVAL '{range_config.months - 1} months'"
    else:
        start_expr = f"DATE_TRUNC('month', %s::date) - INTERVAL '{range_config.months - 1} months'"
        end_expr = "DATE_TRUNC('month', %s::date) + INTERVAL '1 month'"

    sql = f"""
        SELECT
            COALESCE(SUM(earnings_in_base_currency), 0) AS total_royalties,
            COALESCE(SUM(units_sold), 0) AS total_units_sold,
            COUNT(DISTINCT normalized_title) FILTER (WHERE normalized_title IS NOT NULL AND normalized_title <> '') AS total_titles_sold,
            COALESCE(
                CASE
                    WHEN SUM(units_sold) = 0 THEN 0
                    ELSE SUM(earnings_in_base_currency) / NULLIF(SUM(units_sold), 0)
                END,
                0
            ) AS average_royalty_per_unit
        FROM royalty_transactions
        WHERE user_id = %s
          AND report_month >= {start_expr}
          AND report_month < {end_expr}
    """

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(sql, (user_id, latest_report_month, latest_report_month))
        return cursor.fetchone() or {}


def _normalize_date(value):
    if value is None:
        return None

    if isinstance(value, date):
        return value

    try:
        return datetime.strptime(str(value), "%Y-%m-%d").date()
    except ValueError:
        return None


def _fetch_summary_rows_for_custom_range(conn, user_id, start_date, end_date):
    sql = """
        SELECT
            COALESCE(SUM(earnings_in_base_currency), 0) AS total_royalties,
            COALESCE(SUM(units_sold), 0) AS total_units_sold,
            COUNT(DISTINCT normalized_title) FILTER (WHERE normalized_title IS NOT NULL AND normalized_title <> '') AS total_titles_sold,
            COALESCE(
                CASE
                    WHEN SUM(units_sold) = 0 THEN 0
                    ELSE SUM(earnings_in_base_currency) / NULLIF(SUM(units_sold), 0)
                END,
                0
            ) AS average_royalty_per_unit
        FROM royalty_transactions
        WHERE user_id = %s
          AND report_month >= %s
          AND report_month <= %s
    """

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(sql, (user_id, start_date, end_date))
        return cursor.fetchone() or {}


def _fetch_country_sales(conn, user_id, latest_report_month, range_config, previous=False, custom_from=None, custom_to=None):
    if custom_from and custom_to:
        sql = """
            SELECT
                COALESCE(NULLIF(country_code, ''), 'Other') AS country_code,
                COALESCE(SUM(units_sold), 0) AS units_sold
            FROM royalty_transactions
            WHERE user_id = %s
              AND report_month >= %s
              AND report_month <= %s
            GROUP BY 1
            ORDER BY units_sold DESC, country_code ASC
            LIMIT 6
        """

        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(sql, (user_id, custom_from, custom_to))
            return cursor.fetchall() or []

    if previous:
        start_expr = f"DATE_TRUNC('month', %s::date) - INTERVAL '{(range_config.months * 2) - 1} months'"
        end_expr = f"DATE_TRUNC('month', %s::date) - INTERVAL '{range_config.months - 1} months'"
    else:
        start_expr = f"DATE_TRUNC('month', %s::date) - INTERVAL '{range_config.months - 1} months'"
        end_expr = "DATE_TRUNC('month', %s::date) + INTERVAL '1 month'"

    sql = f"""
        SELECT
            COALESCE(NULLIF(country_code, ''), 'Other') AS country_code,
            COALESCE(SUM(units_sold), 0) AS units_sold
        FROM royalty_transactions
        WHERE user_id = %s
          AND report_month >= {start_expr}
          AND report_month < {end_expr}
        GROUP BY 1
        ORDER BY units_sold DESC, country_code ASC
        LIMIT 6
    """

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(sql, (user_id, latest_report_month, latest_report_month))
        return cursor.fetchall() or []


def _fetch_time_series(conn, user_id, latest_report_month, range_config, custom_from=None, custom_to=None):
    if custom_from and custom_to:
        sql = """
            SELECT
                DATE_TRUNC('month', report_month)::date AS period,
                COALESCE(SUM(earnings_in_base_currency), 0) AS earnings
            FROM royalty_transactions
            WHERE user_id = %s
              AND report_month >= %s
              AND report_month <= %s
            GROUP BY 1
            ORDER BY 1
        """

        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(sql, (user_id, custom_from, custom_to))
            return cursor.fetchall() or []

    sql = f"""
        SELECT
            DATE_TRUNC('month', report_month)::date AS period,
            COALESCE(SUM(earnings_in_base_currency), 0) AS earnings
        FROM royalty_transactions
        WHERE user_id = %s
          AND report_month >= DATE_TRUNC('month', %s::date) - INTERVAL '{range_config.months - 1} months'
          AND report_month < DATE_TRUNC('month', %s::date) + INTERVAL '1 month'
        GROUP BY 1
        ORDER BY 1
    """

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(sql, (user_id, latest_report_month, latest_report_month))
        return cursor.fetchall() or []


def _fetch_format_breakdown(conn, user_id, latest_report_month, range_config, custom_from=None, custom_to=None):
    if custom_from and custom_to:
        sql = """
            SELECT
                COALESCE(NULLIF(royalty_type, ''), 'Other') AS royalty_type,
                COALESCE(SUM(earnings_in_base_currency), 0) AS earnings
            FROM royalty_transactions
            WHERE user_id = %s
              AND report_month >= %s
              AND report_month <= %s
            GROUP BY 1
            ORDER BY earnings DESC, royalty_type ASC
            LIMIT 6
        """

        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(sql, (user_id, custom_from, custom_to))
            return cursor.fetchall() or []

    sql = f"""
        SELECT
            COALESCE(NULLIF(royalty_type, ''), 'Other') AS royalty_type,
            COALESCE(SUM(earnings_in_base_currency), 0) AS earnings
        FROM royalty_transactions
        WHERE user_id = %s
          AND report_month >= DATE_TRUNC('month', %s::date) - INTERVAL '{range_config.months - 1} months'
          AND report_month < DATE_TRUNC('month', %s::date) + INTERVAL '1 month'
        GROUP BY 1
        ORDER BY earnings DESC, royalty_type ASC
        LIMIT 6
    """

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(sql, (user_id, latest_report_month, latest_report_month))
        return cursor.fetchall() or []


def _to_number(value):
    if value is None:
        return 0.0

    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _make_metric(current, previous):
    current_value = _to_number(current)
    previous_value = _to_number(previous)
    delta = current_value - previous_value
    pct = 0.0 if previous_value == 0 else (delta / previous_value) * 100.0

    direction = "neutral"
    if delta > 0:
        direction = "positive"
    elif delta < 0:
        direction = "negative"

    return {
        "current": current_value,
        "previous": previous_value,
        "delta": delta,
        "delta_percent": pct,
        "direction": direction,
    }


def get_dashboard_summary(conn, user_id, range_key=None, base_currency="USD", custom_from=None, custom_to=None):
    range_config = get_range_config(range_key)
    is_custom = str(range_key or "").lower() == "custom"
    latest_report_month = _fetch_latest_report_month(conn, user_id)

    if is_custom:
        start_date = _normalize_date(custom_from)
        end_date = _normalize_date(custom_to)

        if not start_date or not end_date:
            raise ValueError("Custom range requires valid from and to dates")

        if end_date < start_date:
            start_date, end_date = end_date, start_date

        span_days = (end_date - start_date).days + 1
        previous_end = start_date - timedelta(days=1)
        previous_start = previous_end - timedelta(days=span_days - 1)

        current_rows = _fetch_summary_rows_for_custom_range(conn, user_id, start_date, end_date)
        previous_rows = _fetch_summary_rows_for_custom_range(conn, user_id, previous_start, previous_end)
        range_label = f"{start_date.strftime('%m/%d/%Y')} - {end_date.strftime('%m/%d/%Y')}"
        comparison_label = f"vs previous {span_days} days"

    elif not latest_report_month:
        empty_metric = _make_metric(0, 0)
        return {
            "range": {
                "key": range_config.key,
                "label": range_config.label,
            },
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "cards": {
                "total_royalties": {
                    "label": "Total Royalties",
                    "value": 0,
                    "formatted": 0,
                    "base_currency": base_currency,
                    "comparison_label": f"vs {range_config.label}",
                    "direction": empty_metric["direction"],
                    "delta_percent": 0,
                    "delta_value": 0,
                    "previous_value": 0,
                },
                "total_units_sold": {
                    "label": "Total Units Sold",
                    "value": 0,
                    "formatted": 0,
                    "comparison_label": f"vs {range_config.label}",
                    "direction": empty_metric["direction"],
                    "delta_percent": 0,
                    "delta_value": 0,
                    "previous_value": 0,
                },
                "total_titles_sold": {
                    "label": "Total Titles Sold",
                    "value": 0,
                    "formatted": 0,
                    "comparison_label": f"vs {range_config.label}",
                    "direction": empty_metric["direction"],
                    "delta_percent": 0,
                    "delta_value": 0,
                    "previous_value": 0,
                },
                "average_royalty_per_unit": {
                    "label": "Average Royalty / Unit",
                    "value": 0,
                    "formatted": 0,
                    "base_currency": base_currency,
                    "comparison_label": f"vs {range_config.label}",
                    "direction": empty_metric["direction"],
                    "delta_percent": 0,
                    "delta_value": 0,
                    "previous_value": 0,
                },
            },
        }
    else:
        current_rows = _fetch_summary_rows_for_months(conn, user_id, latest_report_month, range_config, previous=False)
        previous_rows = _fetch_summary_rows_for_months(conn, user_id, latest_report_month, range_config, previous=True)
        range_label = range_config.label
        comparison_label = f"vs {range_config.label}"

    total_royalties = _make_metric(
        current_rows.get("total_royalties"),
        previous_rows.get("total_royalties"),
    )
    total_units_sold = _make_metric(
        current_rows.get("total_units_sold"),
        previous_rows.get("total_units_sold"),
    )
    total_titles_sold = _make_metric(
        current_rows.get("total_titles_sold"),
        previous_rows.get("total_titles_sold"),
    )
    average_royalty_per_unit = _make_metric(
        current_rows.get("average_royalty_per_unit"),
        previous_rows.get("average_royalty_per_unit"),
    )

    country_sales = _fetch_country_sales(
        conn,
        user_id,
        latest_report_month,
        range_config,
        custom_from=custom_from if is_custom else None,
        custom_to=custom_to if is_custom else None,
    )
    time_series = _fetch_time_series(
        conn,
        user_id,
        latest_report_month,
        range_config,
        custom_from=custom_from if is_custom else None,
        custom_to=custom_to if is_custom else None,
    )
    format_breakdown = _fetch_format_breakdown(
        conn,
        user_id,
        latest_report_month,
        range_config,
        custom_from=custom_from if is_custom else None,
        custom_to=custom_to if is_custom else None,
    )

    return {
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "cards": {
            "total_royalties": {
                "label": "Total Royalties",
                "value": total_royalties["current"],
                "formatted": total_royalties["current"],
                "base_currency": base_currency,
                "comparison_label": comparison_label,
                "direction": total_royalties["direction"],
                "delta_percent": total_royalties["delta_percent"],
                "delta_value": total_royalties["delta"],
                "previous_value": total_royalties["previous"],
            },
            "total_units_sold": {
                "label": "Total Units Sold",
                "value": total_units_sold["current"],
                "formatted": total_units_sold["current"],
                "comparison_label": comparison_label,
                "direction": total_units_sold["direction"],
                "delta_percent": total_units_sold["delta_percent"],
                "delta_value": total_units_sold["delta"],
                "previous_value": total_units_sold["previous"],
            },
            "total_titles_sold": {
                "label": "Total Titles Sold",
                "value": total_titles_sold["current"],
                "formatted": total_titles_sold["current"],
                "comparison_label": comparison_label,
                "direction": total_titles_sold["direction"],
                "delta_percent": total_titles_sold["delta_percent"],
                "delta_value": total_titles_sold["delta"],
                "previous_value": total_titles_sold["previous"],
            },
            "average_royalty_per_unit": {
                "label": "Average Royalty / Unit",
                "value": average_royalty_per_unit["current"],
                "formatted": average_royalty_per_unit["current"],
                "base_currency": base_currency,
                "comparison_label": comparison_label,
                "direction": average_royalty_per_unit["direction"],
                "delta_percent": average_royalty_per_unit["delta_percent"],
                "delta_value": average_royalty_per_unit["delta"],
                "previous_value": average_royalty_per_unit["previous"],
            },
        },
        "range": {
            "key": range_config.key if not is_custom else "custom",
            "label": range_label,
        },
        "charts": {
            "sales_by_country": country_sales,
            "royalties_over_time": time_series,
            "royalties_by_format": format_breakdown,
        },
    }
