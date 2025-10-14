from flask import Flask, render_template, request, redirect, url_for, session
import firebase_admin
from firebase_admin import credentials, firestore

# -------------------------
# Firebase setup (safe initialize)
# -------------------------
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")  # make sure this file exists
    firebase_admin.initialize_app(cred)

db = firestore.client()

# -------------------------
# Flask setup
# -------------------------
app = Flask(__name__)
app.secret_key = "secret_key"

# -------------------------
# Routes
# -------------------------
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        # Query Firestore for user
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
# Guard Dashboard
# -------------------------
@app.route("/guard/dashboard")
def guard_dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "guard":
        return redirect(url_for("admin_dashboard"))

    visitors_ref = db.collection("visitors").stream()
    visitors = [dict(v.to_dict(), id=v.id) for v in visitors_ref]

    return render_template("guard/dashboard.html", visitors=visitors)

@app.route("/guard/add_visitor", methods=["POST"])
def add_visitor():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "guard":
        return redirect(url_for("admin_dashboard"))

    name = request.form["name"]
    purpose = request.form["purpose"]

    db.collection("visitors").add({
        "name": name,
        "purpose": purpose,
        "created_at": firestore.SERVER_TIMESTAMP
    })

    return redirect(url_for("guard_dashboard"))

# -------------------------
# Admin Dashboard
# -------------------------
@app.route('/admin/dashboard')
def admin_dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("guard_dashboard"))
    return render_template('admin/dashboard.html')

@app.route('/admin/visitors')
def visitors():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("guard_dashboard"))

    visitors_ref = db.collection("visitors").stream()
    visitors = [dict(v.to_dict(), id=v.id) for v in visitors_ref]

    return render_template('admin/visitors.html', visitors=visitors)

@app.route('/admin/residents')
def residents():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("guard_dashboard"))
    return render_template('admin/residents.html')

@app.route('/admin/guards')
def guards():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("guard_dashboard"))
    return render_template('admin/guards.html')

@app.route('/admin/access-logs')
def access_logs():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("guard_dashboard"))
    return render_template('admin/access_logs.html')

@app.route('/admin/reports')
def reports():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("guard_dashboard"))
    return render_template('admin/reports.html')

@app.route('/admin/settings')
def settings():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("guard_dashboard"))
    return render_template('admin/settings.html')

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
        users_ref.add({
            "username": "guard",
            "password": "123",
            "role": "guard"
        })
        print("✅ Default guard account created (username: guard, password: 123)")

    # Default admin
    admin_query = users_ref.where("username", "==", "admin").limit(1).stream()
    if not any(admin_query):
        users_ref.add({
            "username": "admin",
            "password": "admin123",
            "role": "admin"
        })
        print("✅ Default admin account created (username: admin, password: admin123)")

# -------------------------
# Run
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)
