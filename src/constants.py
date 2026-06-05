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

ALLOWED_OPERATORS = {"=", "!="}

HUGGINGFACE_MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct"
