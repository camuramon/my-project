from flask import Flask, render_template, request, redirect, url_for, session
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone
import qrcode
import os
import base64
from io import BytesIO

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
                elif session.get("role") == "guard":
                    return redirect(url_for("guard_dashboard"))
            return func(*args, **kwargs)
        decorated.__name__ = func.__name__
        return decorated
    return wrapper

# -------------------------
# Helper: QR Generator
# -------------------------
def generate_qr(data, name, plate):
    """Generate QR code and return (file_url, base64_string)"""
    QR_FOLDER = "static/qr"
    os.makedirs(QR_FOLDER, exist_ok=True)
    qr = qrcode.make(data)

      # Save as file
    qr_filename = f"{name}_{plate}_qr.png".replace(" ", "_")
    qr_path = os.path.join(QR_FOLDER, qr_filename)
    qr.save(qr_path)
    # Save as base64
    buf = BytesIO()
    qr.save(buf, format="PNG")
    qr_b64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

    return qr_url, qr_b64

# -------------------------
# Login (DEFAULT ROUTE)
# -------------------------
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"].strip()
        password = request.form["password"].strip()

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
    visitors_ref = db.collection("visitors").order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    visitors = [dict(v.to_dict(), id=v.id) for v in visitors_ref]
    return render_template("guard/dashboard.html", visitors=visitors)

@app.route("/guard/register")
@login_required(role="guard")
def visitor_register():
    return render_template("visitor_register.html")

@app.route("/guard/add_visitor", methods=["POST"])
@login_required(role="guard")
def add_visitor():
    name = request.form.get("full-name")
    plate = request.form.get("plate-number")
    purpose = request.form.get("purpose")
    visit_date = request.form.get("visit-date")
    visit_time = request.form.get("visit-time")
    id_number = request.form.get("id-number")
    id_type = request.form.get("id-type")

    # ✅ Registration & Expiry
    now = datetime.now(timezone.utc)
    registration_date = now.isoformat()
    expiry_date = (now.replace(year=now.year + 1)).isoformat()

    # ✅ Handle uploaded photo → Base64
    photo_file = request.files.get("photo")
    photo_base64 = ""
    if photo_file and photo_file.filename != "":
        photo_bytes = photo_file.read()
        photo_base64 = "data:image/jpeg;base64," + base64.b64encode(photo_bytes).decode("utf-8")

    # ✅ Generate QR
    qr_data = f"Visitor: {name}, Plate: {plate}, Date: {visit_date}, Time: {visit_time}"
    qr_url, qr_b64 = generate_qr(qr_data, name, plate)

    # ✅ Save record to Firestore
    db.collection("visitors").add({
        "fullName": name,
        "plateNumber": plate,
        "purpose": purpose,
        "visitDate": visit_date,
        "visitTime": visit_time,
        "idNumber": id_number,
        "idType": id_type,
        "registrationDate": registration_date,
        "expiryDate": expiry_date,
        "photo": photo_base64,    # base64 photo
        "qrUrl": qr_url,          # ✅ file path ng QR code
        "qrCode": qr_b64,         # ✅ base64 QR code
        "status": "Active",
        "created_at": firestore.SERVER_TIMESTAMP
    })

    # ✅ Show QR page after registration
    return render_template("qr.html",
                           name=name,
                           plate=plate,
                           purpose=purpose,
                           visit_date=visit_date,
                           visit_time=visit_time,
                           id_number=id_number,
                           id_type=id_type,
                           photo=photo_base64,
                           qr_url="/" + qr_url,  # for <img src> sa HTML
                           qr_code=qr_b64)

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

        if "visitDate" in data and data["visitDate"] == str(today):
            data["status"] = "Active"
            active_visitors += 1
            entry_logs_today += 1
        else:
            data["status"] = "Expired"

        visitors.append(data)

    qr_codes_ref = db.collection("visitors").where("qrCode", "!=", "").stream()
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
