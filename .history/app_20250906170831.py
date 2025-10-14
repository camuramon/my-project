from flask import Flask, render_template, request, redirect, url_for, session
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone

# -------------------------
# Firebase setup
# -------------------------
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# -------------------------
# Flask setup
# -------------------------
app = Flask(__name__)
app.secret_key = "secret_key"

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.jinja_env.auto_reload = True

# -------------------------
# Helper: Role-based access
# -------------------------
def login_required(role=None):
    def wrapper(func):
        def decorated(*args, **kwargs):
            if "user_id" not in session:
                return redirect(url_for("login"))
            if role and session.get("role") != role:
                # Redirect based on role
                if session.get("role") == "admin":
                    return redirect(url_for("admin_dashboard"))
                else:
                    return redirect(url_for("guard_dashboard"))
            return func(*args, **kwargs)
        decorated.__name__ = func.__name__
        return decorated
    return wrapper

# -------------------------
# Login
# -------------------------
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        users_ref = db.collection("users")
        query = users_ref.where("username", "==", username).where("password", "==", password).stream()
        
        user = None
        for u in query:
            user = u.to_dict()
            user["id"] = u.id

        if user:
            session["user_id"] = user["id"]
            session["role"] = user["role"]

            if user["role"] == "admin":
                return redirect(url_for("admin_dashboard"))
            elif user["role"] == "guard":
                return redirect(url_for("guard_dashboard"))
        else:
            return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")

# -------------------------
# Guard Pages
# -------------------------
@app.route("/guard/dashboard")
@login_required(role="guard")
def guard_dashboard():
    visitors_ref = db.collection("visitors").stream()
    visitors = [dict(v.to_dict(), id=v.id) for v in visitors_ref]
    return render_template("guard/dashboard.html", visitors=visitors)

@app.route("/guard/add_visitor", methods=["POST"])
@login_required(role="guard")
def add_visitor():
    name = request.form["name"]
    purpose = request.form["purpose"]

    db.collection("visitors").add({
        "name": name,
        "purpose": purpose,
        "status": "Active",   # default kapag kaka-enter
        "created_at": firestore.SERVER_TIMESTAMP
    })

    return redirect(url_for("guard_dashboard"))

# -------------------------
# Admin Pages
# -------------------------
@app.route('/admin/dashboard')
@login_required(role="admin")
def admin_dashboard():
    visitors_ref = db.collection("visitors").stream()
    visitors = [dict(v.to_dict(), id=v.id) for v in visitors_ref]

    # Stats
    total_visitors = len(visitors)
    active_visitors = sum(1 for v in visitors if v.get("status") == "Active")
    expired_visitors = sum(1 for v in visitors if v.get("status") == "Expired")

    # Entry logs ngayong araw
    today = datetime.now(timezone.utc).date()
    entry_logs_today = sum(
        1 for v in visitors if v.get("created_at") 
        and v["created_at"].date() == today
    )

    return render_template(
        'admin/dashboard.html',
        active_page='dashboard',
        visitors=visitors,
        total_visitors=total_visitors,
        active_visitors=active_visitors,
        expired_visitors=expired_visitors,
        entry_logs_today=entry_logs_today
    )

@app.route('/admin/residents')
@login_required(role="admin")
def admin_residents():
    return render_template('admin/residents.html', active_page='residents')

@app.route('/admin/visitors')
@login_required(role="admin")
def admin_visitors():
    visitors_ref = db.collection("visitors").stream()
    visitors = [dict(v.to_dict(), id=v.id) for v in visitors_ref]
    return render_template('admin/visitors.html', visitors=visitors, active_page='visitors')

@app.route('/admin/guards')
@login_required(role="admin")
def admin_guards():
    return render_template('admin/guards.html', active_page='guards')

@app.route('/admin/access_logs')
@login_required(role="admin")
def admin_access_logs():
    return render_template('admin/access_logs.html', active_page='access_logs')

@app.route('/admin/reports')
@login_required(role="admin")
def admin_reports():
    return render_template('admin/reports.html', active_page='reports')

@app.route('/admin/settings')
@login_required(role="admin")
def admin_settings():
    return render_template('admin/settings.html', active_page='settings')

# -------------------------
# Logout
# -------------------------
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

# -------------------------
# Default Users in Firestore
# -------------------------
with app.app_context():
    users_ref = db.collection("users")

    # Default guard
    guard_query = users_ref.where("username", "==", "guard").limit(1).stream()
    if not any(guard_query):
        users_ref.add({"username": "guard", "password": "123", "role": "guard"})
        print("✅ Default guard account created (username: guard, password: 123)")

    # Default admin
    admin_query = users_ref.where("username", "==", "admin").limit(1).stream()
    if not any(admin_query):
        users_ref.add({"username": "admin", "password": "admin123", "role": "admin"})
        print("✅ Default admin account created (username: admin, password: admin123)")

# -------------------------
# Run App
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)
