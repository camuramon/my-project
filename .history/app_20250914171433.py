from flask import Flask, render_template, request, redirect, url_for, session
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone
import qrcode
import os

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

@app.route("/")
def dashboard():
    return render_template("qr.html")  # default landing page

@app.route("/register")
def register():
    return render_template("visitor_register.html")

@app.route("/qr")
def qr_page():
    return render_template("qr.html")

@app.route("/guard/dashboard")
@login_required(role="guard")
def guard_dashboard():
    visitors_ref = db.collection("visitors").stream()
    visitors = [dict(v.to_dict(), id=v.id) for v in visitors_ref]
    return render_template("guard/dashboard.html", visitors=visitors)

@app.route("/guard/add_visitor", methods=["POST"])
@login_required(role="guard")
def add_visitor():
    name = request.form["full-name"]
    plate = request.form["plate-number"]
    purpose = request.form["purpose"]
    visit_date = request.form["visit-date"]
    visit_time = request.form["visit-time"]

    # 📂 Ensure folders exist
    UPLOAD_FOLDER = "static/uploads"
    QR_FOLDER = "static/qr"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(QR_FOLDER, exist_ok=True)

    # 1️⃣ Save uploaded photo
    photo_file = request.files.get("photo")
    if photo_file and photo_file.filename != "":
        photo_filename = f"{name}_{plate}.png".replace(" ", "_")
        photo_path = os.path.join(UPLOAD_FOLDER, photo_filename)
        photo_file.save(photo_path)
        photo_url = f"/{photo_path}"   # path lang sa Firestore
    else:
        photo_url = "/static/images/default-visitor.png"

    # 2️⃣ Generate & save QR code
    qr = qrcode.make(f"Visitor: {name}, Plate: {plate}, Date: {visit_date}")
    qr_filename = f"{name}_{plate}_qr.png".replace(" ", "_")
    qr_path = os.path.join(QR_FOLDER, qr_filename)
    qr.save(qr_path)
    qr_url = f"/{qr_path}"

    # 3️⃣ Save visitor record to Firestore
    db.collection("visitors").add({
        "fullName": name,
        "plateNumber": plate,
        "purpose": purpose,
        "visitDate": visit_date,
        "visitTime": visit_time,
        "photoUrl": photo_url,   # ✅ visitor photo (file path)
        "qrUrl": qr_url,         # ✅ QR code (file path)
        "status": "Active",
        "created_at": firestore.SERVER_TIMESTAMP
    })

    return redirect(url_for("guard_dashboard"))




# -------------------------
# Admin Pages
# -------------------------
@app.route('/admin/dashboard')
@login_required(role="admin")
def admin_dashboard():
    residents_ref = db.collection("residents").stream()
    residents = [dict(r.to_dict(), id=r.id) for r in residents_ref]
    total_residents = len(residents)

    visitors_ref = db.collection("visitors").stream()
    visitors = []
    active_visitors = 0
    entry_logs_today = 0
    today = datetime.now(timezone.utc).date()

    for v in visitors_ref:
        data = v.to_dict()
        data["id"] = v.id
        data["status"] = "Active" if "visitDate" in data and data["visitDate"] == str(today) else "Active"
        visitors.append(data)
        if data["status"] == "Active":
            active_visitors += 1
        if "visitDate" in data and data["visitDate"] == str(today):
            entry_logs_today += 1

    qr_codes_ref = db.collection("visitors").where("qrUrl", "!=", "").stream()
    valid_qr_codes = sum(1 for _ in qr_codes_ref)

    vehicles_ref = db.collection("vehicles").stream()
    total_vehicles = len([v for v in vehicles_ref])

    properties_ref = db.collection("properties").stream()
    total_properties = len([p for p in properties_ref])

    notifications = visitors[-5:]

    return render_template(
        'admin/dashboard.html',
        active_page='dashboard',
        total_residents=total_residents,
        active_visitors=active_visitors,
        valid_qr_codes=valid_qr_codes,
        total_vehicles=total_vehicles,
        entry_logs_today=entry_logs_today,
        total_properties=total_properties,
        visitors=notifications,
        residents=residents
    )

@app.route("/admin/qr")
@login_required(role="admin")
def admin_qr():
    visitors_ref = db.collection("visitors").stream()
    visitors = [dict(v.to_dict(), id=v.id) for v in visitors_ref]
    return render_template("admin/qr.html", visitors=visitors, active_page="qr")

@app.route('/admin/residents')
@login_required(role="admin")
def admin_residents():
    residents_ref = db.collection("residents").stream()
    residents = [dict(r.to_dict(), id=r.id) for r in residents_ref]
    return render_template('admin/residents.html', residents=residents, active_page='residents')

@app.route('/admin/add_resident', methods=['POST'])
@login_required(role="admin")
def admin_add_resident():
    full_name = request.form.get("full_name")
    address = request.form.get("address")
    contact = request.form.get("contact")
    status = request.form.get("status")

    db.collection("residents").add({
        "fullName": full_name,
        "address": address,
        "contact": contact,
        "status": status,
        "created_at": firestore.SERVER_TIMESTAMP
    })

    return redirect(url_for("admin_residents"))

@app.route('/admin/visitors')
@login_required(role="admin")
def admin_visitors():
    visitors_ref = db.collection("visitors").stream()
    visitors = [dict(v.to_dict(), id=v.id) for v in visitors_ref]
    return render_template('admin/visitors.html', visitors=visitors, active_page='visitors')

@app.route('/admin/guards')
@login_required(role="admin")
def admin_guards():
    guards_ref = db.collection("users").where("role", "==", "guard").stream()
    guards = [dict(g.to_dict(), id=g.id) for g in guards_ref]
    return render_template('admin/guards.html', guards=guards, active_page='guards')

@app.route('/admin/access_logs')
@login_required(role="admin")
def admin_access_logs():
    access_logs_ref = db.collection("access_logs").stream()
    logs = [dict(l.to_dict(), id=l.id) for l in access_logs_ref]
    return render_template('admin/access_logs.html', logs=logs, active_page='access_logs')

@app.route('/admin/reports')
@login_required(role="admin")
def admin_reports():
    reports_ref = db.collection("reports").stream()
    reports = [dict(r.to_dict(), id=r.id) for r in reports_ref]
    return render_template('admin/reports.html', reports=reports, active_page='reports')

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

    guard_query = users_ref.where("username", "==", "guard").limit(1).stream()
    if not any(guard_query):
        users_ref.add({"username": "guard", "password": "123", "role": "guard"})
        print("✅ Default guard account created (username: guard, password: 123)")

    admin_query = users_ref.where("username", "==", "admin").limit(1).stream()
    if not any(admin_query):
        users_ref.add({"username": "admin", "password": "admin123", "role": "admin"})
        print("✅ Default admin account created (username: admin, password: admin123)")

# -------------------------
# Run App
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)
