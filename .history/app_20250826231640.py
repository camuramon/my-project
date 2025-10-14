from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.secret_key = "secret_key"

# -------------------------
# Database setup
# -------------------------
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "instance")
os.makedirs(db_path, exist_ok=True)  # ensure instance folder exists
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(db_path, "visitors.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# -------------------------
# Database Models
# -------------------------
class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)

class Visitor(db.Model):
    __tablename__ = "visitors"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    purpose = db.Column(db.String(200), nullable=False)

# -------------------------
# Routes
# -------------------------
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = User.query.filter_by(username=username, password=password).first()
        if user:
            session["user_id"] = user.id
            session["role"] = user.role

            # Redirect depende sa role
            if user.role == "admin":
                return redirect(url_for("admin_dashboard"))
            else:
                return redirect(url_for("dashboard"))
        else:
            return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "guard":
        return redirect(url_for("admin_dashboard"))  # Admins bawal dito
    visitors = Visitor.query.all()
    return render_template("dashboard.html", visitors=visitors)

@app.route("/add_visitor", methods=["POST"])
def add_visitor():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "guard":
        return redirect(url_for("admin_dashboard"))

    name = request.form["name"]
    purpose = request.form["purpose"]

    visitor = Visitor(name=name, purpose=purpose)
    db.session.add(visitor)
    db.session.commit()

    qr_data = f"VISITOR-{visitor.id} | Name: {visitor.name} | Purpose: {visitor.purpose}"

    visitors = Visitor.query.all()
    return render_template("dashboard.html", visitors=visitors, qr_data=qr_data)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

# -------------------------
# Admin Section Routes
# -------------------------
@app.route('/admin')
def admin_dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("dashboard"))  # Guards walang access
    return render_template('admin/index.html')

@app.route('/visitors')
def visitors():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("dashboard"))
    return render_template('visitors.html')

@app.route('/residents')
def residents():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("dashboard"))
    return render_template('residents.html')

@app.route('/guards')
def guards():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("dashboard"))
    return render_template('guards.html')

@app.route('/access-logs')
def access_logs():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("dashboard"))
    return render_template('access_logs.html')

@app.route('/reports')
def reports():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("dashboard"))
    return render_template('reports.html')

@app.route('/settings')
def settings():
    if "user_id" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        return redirect(url_for("dashboard"))
    return render_template('settings.html')

# -------------------------
# Initialize Database & Default Users
# -------------------------
with app.app_context():
    db.create_all()

    # Ensure guard exists
    guard = User.query.filter_by(username="guard").first()
    if not guard:
        db.session.add(User(username="guard", password="123", role="guard"))
        print("✅ Default guard account created (username: guard, password: 123)")

    # Ensure admin exists
    admin = User.query.filter_by(username="admin").first()
    if not admin:
        db.session.add(User(username="admin", password="admin123", role="admin"))
        print("✅ Default admin account created (username: admin, password: admin123)")

    db.session.commit()

# -------------------------
# Run
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)
