from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import os
from functools import wraps

try:
    from . import royalty_db_service
except ImportError:
    import royalty_db_service
try:
    from .llm_service import route_user_query
except ImportError:
    from llm_service import route_user_query

from authlib.integrations.flask_client import OAuth

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
        result = route_user_query(conn, input_text)

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
            "full_name": session.get("user_name"),
            "picture": session.get("user_avatar"),
            "avatar_url": session.get("user_avatar")
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


@app.route("/dashboard")
@login_required
def dashboard_page():
    return render_template("react_one_pager.html")


@app.route("/ai-assistance")
def ai_assistance_page():
    return render_template("react_one_pager.html")


@app.route("/settings")
def settings_page():
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
