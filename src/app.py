import json

import requests
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import os
from functools import wraps
from fastembed import TextEmbedding
try:
    from . import royalty_db_service
except ImportError:
    import royalty_db_service
model = TextEmbedding()

from authlib.integrations.flask_client import OAuth

HUGGINGFACE_AI_TOKEN = os.getenv("HUGGINGFACE_AI_TOKEN")
HUGGINGFACE_MODEL_URL = os.getenv("HUGGINGFACE_MODEL_URL")
HUGGINGFACE_API_URL = os.getenv("HUGGINGFACE_API_URL")

app = Flask(__name__)

app.secret_key = os.getenv("FLASK_SECRET_KEY", "change-me-in-production")

oauth = OAuth(app)

google = oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    },
)


try:
    conn = royalty_db_service.create_connection()
except Exception as error:
    print("DB Connected wrong!", error)
    conn = None



def huggingface_llm_query(payload):
    header = {
        "Authorization": f"Bearer {HUGGINGFACE_AI_TOKEN}"
    }
    response = requests.post(HUGGINGFACE_API_URL, headers=header, json=payload)
    return response.json()

# def ___huggingface_llm_query(prompt):
#     headers = {
#         "Authorization": f"Bearer {HUGGINGFACE_AI_TOKEN}",
#         "Content-Type": "application/json"
#     }
#
#     payload = {
#         "inputs": prompt,
#         "parameters": {
#             "max_new_tokens": 160
#         }
#     }
#     # TODO: Hardcoded here
#     HUGGINGFACE_API_URL="https://router.huggingface.co/hf-inference/models/google/flan-t5-large"
#     response = requests.post(
#         HUGGINGFACE_API_URL,
#         headers=headers,
#         json=payload,
#         timeout=60
#     )
#
#     print("HF status:", response.status_code)
#     print("HF body:", response.text)
#
#     response.raise_for_status()
#     data = response.json()
#
#     if isinstance(data, list) and data:
#         return data[0].get("generated_text", "")
#
#     if isinstance(data, dict):
#         return data.get("generated_text", "")
#
#     return str(data)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def login_required(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            if request.path.startswith("/api/") or request.path in {"/post-query", "/upload"}:
                return jsonify({"error": "LOGIN_REQUIRED"}), 401
            return redirect(url_for("index"))
        return view_func(*args, **kwargs)
    return wrapper


ANALYTICS_METRICS = {
    "earnings": {
        "field": "earnings",
        "agg": "SUM"
    },
    "units_sold": {
        "field": "units_sold",
        "agg": "SUM"
    },
    "refunds": {
        "field": "units_refunded",
        "agg": "SUM"
    }
}

ANALYTICS_DIMENSIONS = {
    "title": "title",
    "author": "author",
    "country": "country_code",
    "marketplace": "marketplace",
    "royalty_type": "royalty_type",
    "payout_plan": "payout_plan",
    "currency": "currency",
    "month": "report_month"
}

COUNTRY_MAP = {
    "germany": "DE",
    "india": "IN",
    "usa": "US",
    "united states": "US",
    "uk": "GB",
    "united kingdom": "GB",
    "canada": "CA",
    "australia": "AU",
    "france": "FR",
    "italy": "IT",
    "spain": "ES",
    "japan": "JP"
}

def build_analytics_prompt(user_query):
    return f"""
Convert the user question into JSON only.

Allowed metrics:
earnings, units_sold, refunds

Allowed dimensions:
title, author, country, marketplace, royalty_type, payout_plan, currency, month

Allowed analysis_type:
ranking, comparison, trend_decline

Return only valid JSON. No explanation.

Examples:

Question: top earning titles in Germany
JSON:
{{"analysis_type":"ranking","metric":"earnings","group_by":["title"],"filters":[{{"dimension":"country","operator":"=","value":"DE"}}],"sort":{{"by":"earnings","direction":"desc"}},"limit":10}}

Question: compare KU vs direct sales
JSON:
{{"analysis_type":"comparison","metric":"earnings","group_by":["royalty_type"],"filters":[],"sort":{{"by":"earnings","direction":"desc"}},"limit":20}}

Question: show declining books
JSON:
{{"analysis_type":"trend_decline","metric":"earnings","group_by":["title"],"filters":[],"sort":{{"by":"change_percent","direction":"asc"}},"limit":20}}

User question: {user_query}
JSON:
"""

ALLOWED_OPERATORS = {"=", "!="}

def parse_llm_json(text):
    text = text.strip()

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("LLM did not return JSON")

    return json.loads(text[start:end + 1])

def validate_analytics_plan(plan):
    if plan.get("metric") not in ANALYTICS_METRICS:
        raise ValueError("Invalid metric")

    for dim in plan.get("group_by", []):
        if dim not in ANALYTICS_DIMENSIONS:
            raise ValueError(f"Invalid group_by dimension: {dim}")

    for f in plan.get("filters", []):
        if f.get("dimension") not in ANALYTICS_DIMENSIONS:
            raise ValueError(f"Invalid filter dimension: {f.get('dimension')}")

        if f.get("operator") not in ALLOWED_OPERATORS:
            raise ValueError(f"Invalid operator: {f.get('operator')}")

    limit = int(plan.get("limit", 10))
    plan["limit"] = min(max(limit, 1), 100)

    return plan

def compile_ranking_or_comparison_sql(plan):
    metric = ANALYTICS_METRICS[plan["metric"]]
    group_by = plan.get("group_by", [])

    group_fields = [ANALYTICS_DIMENSIONS[d] for d in group_by]

    select_parts = []

    for field in group_fields:
        select_parts.append(field)

    select_parts.append(
        f'{metric["agg"]}({metric["field"]}) AS {plan["metric"]}'
    )

    sql = f"""
        SELECT {", ".join(select_parts)}
        FROM royalty_transactions
    """

    params = []
    where_parts = []

    for f in plan.get("filters", []):
        field = ANALYTICS_DIMENSIONS[f["dimension"]]
        operator = f["operator"]
        value = f["value"]

        where_parts.append(f"{field} {operator} %s")
        params.append(value)

    if where_parts:
        sql += " WHERE " + " AND ".join(where_parts)

    if group_fields:
        sql += " GROUP BY " + ", ".join(group_fields)

    sort_by = plan.get("sort", {}).get("by", plan["metric"])
    sort_dir = plan.get("sort", {}).get("direction", "desc").upper()

    if sort_dir not in {"ASC", "DESC"}:
        sort_dir = "DESC"

    sql += f" ORDER BY {sort_by} {sort_dir}"
    sql += " LIMIT %s"
    params.append(plan["limit"])

    return sql, params

def compile_declining_books_sql(plan):
    metric = ANALYTICS_METRICS[plan["metric"]]
    limit = plan.get("limit", 20)

    sql = f"""
        WITH monthly AS (
            SELECT
                title,
                report_month,
                {metric["agg"]}({metric["field"]}) AS metric_value
            FROM royalty_transactions
            GROUP BY title, report_month
        ),
        ranked AS (
            SELECT
                title,
                report_month,
                metric_value,
                LAG(metric_value) OVER (
                    PARTITION BY title
                    ORDER BY report_month
                ) AS previous_metric_value
            FROM monthly
        )
        SELECT
            title,
            previous_metric_value,
            metric_value AS current_metric_value,
            metric_value - previous_metric_value AS change_amount,
            ROUND(
                ((metric_value - previous_metric_value) / NULLIF(previous_metric_value, 0)) * 100,
                2
            ) AS change_percent
        FROM ranked
        WHERE previous_metric_value IS NOT NULL
          AND metric_value < previous_metric_value
        ORDER BY change_percent ASC
        LIMIT %s
    """

    return sql, [limit]

def run_llm_sql_engine(conn, user_query):
    prompt = build_analytics_prompt(user_query)

    # Call your LLM API here
    llm_response = huggingface_llm_query({
        "messages": [
            {
                "role": "user",
                "content": f"{user_query}"
            }
        ],
        "model": "meta-llama/Llama-3.1-8B-Instruct"
    })

    content = llm_response.get("choices", [{}])[0].get("message", {}).get("content", "")
    # content = jsonify(content)
    return content
    # plan = json.loads(content)
    # plan = validate_analytics_plan(plan)

    # if plan["analysis_type"] == "trend_decline":
    #     sql, params = compile_declining_books_sql(plan)
    # else:
    #     sql, params = compile_ranking_or_comparison_sql(plan)

    # rows = execute_analytics_query(conn, sql, params)

    # return {
    #     "type": "analytics",
    #     "user_query": user_query,
    #     "plan": plan,
    #     "sql": sql,
    #     "data": rows
    # }

@app.route("/")
def index():
    return render_template("react_one_pager.html")

# top earning titles in Germany
#
@app.route("/post-query", methods=["POST"])
@login_required
def post_query():
    input_text = request.form.get("query", "").strip()

    if not input_text:
        return jsonify({"error": "Query is required"}), 400

    try:
        result = run_llm_sql_engine(conn, input_text)

        return jsonify({
            "status": "ok",
            "results": result
        })

    except Exception as e:
        print("Analytics error:", e)

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route("/auth/google/login")
def google_login():

    is_popup = request.args.get("popup") == "true"
    next_url = request.args.get("next", "/")
    session["next_url"] = next_url
    session["oauth_popup"] = is_popup

    # IMPORTANT:
    # Google requires this URL to match exactly in Google Cloud Console.
    # Add this exact URI there:
    # http://localhost:5000/auth/google/callback
    #
    # If you run with a different host/port or HTTPS tunnel, set GOOGLE_REDIRECT_URI
    # to that exact callback URL and add the same value in Google Cloud Console.
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI") or url_for("google_callback", _external=True)

    return google.authorize_redirect(redirect_uri)


@app.route("/auth/google/callback")
def google_callback():

    token = google.authorize_access_token()

    user_info = token.get("userinfo")

    if not user_info:
        user_info = google.userinfo()

    user = royalty_db_service.upsert_google_user(conn, user_info)

    session["user_id"] = str(user["id"])
    session["user_email"] = user["email"]
    session["user_name"] = user["full_name"]
    session["user_avatar"] = user["avatar_url"]

    # Check if this is a popup auth request
    is_popup = session.pop("oauth_popup", False)
    if is_popup:
        return render_template("popup_callback.html")

    next_url = session.pop("next_url", "/")

    return redirect(next_url)


@app.route("/auth/me")
def auth_me():

    if "user_id" not in session:
        return jsonify({
            "authenticated": False
        })

    return jsonify({
        "authenticated": True,
        "user": {
            "id": session.get("user_id"),
            "email": session.get("user_email"),
            "name": session.get("user_name"),
            "picture": session.get("user_avatar")
        }
    })


@app.route("/auth/logout", methods=["POST"])
def auth_logout():

    session.clear()

    return jsonify({
        "status": "ok"
    })

@app.route("/reporting")
@login_required
def reporting_page():
    return render_template("react_one_pager.html")


@app.route("/api/reporting", methods=["GET"])
@login_required
def reporting_api():
    filters = {}

    for column in royalty_db_service.REPORTING_FILTER_COLUMNS:
        value = request.args.get(column)
        if value is not None and str(value).strip() != "":
            filters[column] = value

    sort_by = request.args.get("sort_by")
    sort_dir = request.args.get("sort_dir")
    if sort_by:
        filters["sort_by"] = sort_by
    if sort_dir:
        filters["sort_dir"] = sort_dir

    page = request.args.get("page", 1)
    page_size = request.args.get("page_size", 20)

    data = royalty_db_service.get_reporting_records(
        conn=conn,
        user_id=session["user_id"],
        filters=filters,
        page=page,
        page_size=page_size
    )

    return jsonify({
        "status": "ok",
        "results": data
    })


@app.route("/api/reporting/months", methods=["GET"])
@login_required
def reporting_months_api():
    return jsonify({
        "status": "ok",
        "results": royalty_db_service.get_available_report_months(
            conn=conn,
            user_id=session["user_id"]
        )
    })


@app.route("/api/reporting/<int:record_id>", methods=["GET"])
@login_required
def reporting_record_api(record_id):
    record = royalty_db_service.get_royalty_record(
        conn=conn,
        user_id=session["user_id"],
        record_id=record_id
    )

    if not record:
        return jsonify({"error": "NOT_FOUND"}), 404

    return jsonify({
        "status": "ok",
        "results": record
    })


@app.route("/api/reporting/<int:record_id>", methods=["DELETE"])
@login_required
def delete_reporting_record_api(record_id):
    deleted = royalty_db_service.delete_royalty_record(
        conn=conn,
        user_id=session["user_id"],
        record_id=record_id
    )

    if not deleted:
        return jsonify({"error": "NOT_FOUND"}), 404

    return jsonify({"status": "ok"})


@app.route("/api/me/data", methods=["DELETE"])
@login_required
def delete_my_data_api():
    result = royalty_db_service.delete_user_account_data(
        conn=conn,
        user_id=session["user_id"]
    )

    session.clear()

    return jsonify({
        "status": "ok",
        "results": result
    })


@app.route("/upload", methods=["POST"])
@login_required
def upload():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)

    data = royalty_db_service.insert_royalty_excel(
        conn=conn,
        excel_file=save_path,
        user_id=session["user_id"]
    )

    return jsonify({"status": "ok", "results": data})


if __name__ == "__main__":
    app.run(debug=True)
