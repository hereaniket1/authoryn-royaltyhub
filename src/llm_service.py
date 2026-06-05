import json
import os
import re

import requests

try:
    from .constants import (
        ANALYTICS_DIMENSIONS,
        ANALYTICS_METRICS,
        ALLOWED_OPERATORS,
        COUNTRY_MAP,
        HUGGINGFACE_MODEL_NAME,
    )
except ImportError:
    from constants import (
        ANALYTICS_DIMENSIONS,
        ANALYTICS_METRICS,
        ALLOWED_OPERATORS,
        COUNTRY_MAP,
        HUGGINGFACE_MODEL_NAME,
    )

try:
    from . import royalty_db_service
except ImportError:
    import royalty_db_service

HUGGINGFACE_AI_TOKEN = os.getenv("HUGGINGFACE_AI_TOKEN")
HUGGINGFACE_API_URL = os.getenv("HUGGINGFACE_API_URL")


def huggingface_llm_query(payload):
    header = {
        "Authorization": f"Bearer {HUGGINGFACE_AI_TOKEN}"
    }
    response = requests.post(HUGGINGFACE_API_URL, headers=header, json=payload)
    return response.json()


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


def build_intent_prompt(user_query):
    return f"""
Classify the user query into exactly one intent.

Return only valid JSON, no explanation.

Allowed intents:
analytics
general

Rules:
- Use analytics when the user asks for report-like, comparative, ranked, trend, or filtered data over the royalty tables.
- Use general when the user asks a normal question, explanation, help, greeting, or anything that does not require SQL/reporting.
- If the query is ambiguous, choose general.

Examples:
Question: top earning titles in Germany
JSON: {{"intent":"analytics","confidence":0.97}}

Question: what does ACX mean
JSON: {{"intent":"general","confidence":0.96}}

Question: show me declining books this month
JSON: {{"intent":"analytics","confidence":0.95}}

Question: how do I upload a file
JSON: {{"intent":"general","confidence":0.96}}

User question: {user_query}
JSON:
"""


def parse_llm_json(text):
    text = text.strip()

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("LLM did not return JSON")

    return json.loads(text[start:end + 1])


def is_probable_analytics_query(user_query):
    text = (user_query or "").lower()
    keywords = [
        "top", "highest", "lowest", "compare", "comparison", "trend",
        "decline", "declining", "report", "reports", "analytics",
        "earnings", "units sold", "marketplace", "country", "month",
        "by title", "by author", "by source", "filter", "show me"
    ]
    return any(keyword in text for keyword in keywords)


def classify_query_intent(user_query):
    prompt = build_intent_prompt(user_query)

    try:
        llm_response = huggingface_llm_query({
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "model": HUGGINGFACE_MODEL_NAME
        })

        content = llm_response.get("choices", [{}])[0].get("message", {}).get("content", "")
        payload = parse_llm_json(re.sub(r'```json\s*|\s*```', '', content).strip())

        intent = str(payload.get("intent", "general")).strip().lower()
        confidence = float(payload.get("confidence", 0))

        if intent not in {"analytics", "general"}:
            intent = "general"

        if confidence < 0.5:
            intent = "general"

        return {
            "intent": intent,
            "confidence": confidence,
            "raw": payload
        }
    except Exception as error:
        print("Intent classification fallback:", error)
        return {
            "intent": "analytics" if is_probable_analytics_query(user_query) else "general",
            "confidence": 0.0,
            "raw": None
        }


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


def run_llm_user_query(user_query):
    llm_response = huggingface_llm_query({
        "messages": [
            {
                "role": "user",
                "content": f"{user_query}"
            }
        ],
        "model": HUGGINGFACE_MODEL_NAME
    })

    content = llm_response.get("choices", [{}])[0].get("message", {}).get("content", "")
    return content


def run_llm_sql_engine(conn, user_query):
    prompt = build_analytics_prompt(user_query)

    llm_response = huggingface_llm_query({
        "messages": [
            {
                "role": "user",
                "content": f"{prompt}"
            }
        ],
        "model": HUGGINGFACE_MODEL_NAME
    })

    content = llm_response.get("choices", [{}])[0].get("message", {}).get("content", "")
    json_str = re.sub(r'```json\s*|\s*```', '', content).strip()
    plan = json.loads(json_str)
    plan = validate_analytics_plan(plan)

    if plan["analysis_type"] == "trend_decline":
        sql, params = compile_declining_books_sql(plan)
    else:
        sql, params = compile_ranking_or_comparison_sql(plan)

    rows = royalty_db_service.execute_analytics_query(conn, sql, params)

    return {
        "type": "analytics",
        "user_query": user_query,
        "plan": plan,
        "sql": sql,
        "data": rows
    }


def route_user_query(conn, user_query):
    intent = classify_query_intent(user_query)

    if intent["intent"] == "analytics":
        try:
            return run_llm_sql_engine(conn, user_query)
        except Exception as error:
            print("Analytics route fallback:", error)

    answer = run_llm_user_query(user_query)
    return {
        "type": "assistant",
        "user_query": user_query,
        "intent": intent,
        "answer": answer
    }
