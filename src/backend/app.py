from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import timedelta
import os
import sqlite3
import json
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None
    RealDictCursor = None
from functools import wraps
from urllib.parse import urlparse

# ------------------ APP CONFIG ------------------

# Configuration to serve frontend from the backend
# Assuming frontend files are located at ../frontend relative to this file
FRONTEND_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend')
UPLOAD_FOLDER = os.path.join(FRONTEND_FOLDER, 'uploads')

app = Flask(__name__, static_folder=FRONTEND_FOLDER, static_url_path='')
CORS(app)

app.config['JWT_SECRET_KEY'] = os.environ.get("JWT_SECRET_KEY", "dev-secret-key")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = "uploads" # Relative to where the script runs, but we'll specific full path
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

jwt = JWTManager(app)

# ------------------ DATABASE CONFIG ------------------

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # Use PostgreSQL (Railway/Production)
        try:
            conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
            return conn
        except Exception as e:
            print("PostgreSQL Connection Error:", e)
            return None
    else:
        # Use SQLite (Local Development)
        try:
            db_path = os.path.join(os.path.dirname(__file__), 'internship_portal.db')
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            return conn
        except Exception as e:
            print("SQLite Connection Error:", e)
            return None

def init_db():
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database during initialization.")
        return

    # Check if using PostgreSQL or SQLite
    is_postgres = hasattr(conn, 'itersize') # psycopg2 objects have this, sqlite3 do not (sort of)

    if is_postgres: 
        # PostgreSQL Queries
        schema_queries = [
            '''CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                course VARCHAR(255),
                year INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )''',
            '''CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )''',
            '''CREATE TABLE IF NOT EXISTS internships (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                company VARCHAR(255) NOT NULL,
                description TEXT,
                duration VARCHAR(100),
                slots INTEGER DEFAULT 0,
                date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                admin_id INTEGER REFERENCES admins(id)
            )''',
            '''CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id),
                internship_id INTEGER REFERENCES internships(id),
                cv_file TEXT,
                cover_letter TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, internship_id)
            )'''
        ]
        placeholder = "%s"
    else:
        # SQLite Queries
        schema_queries = [
            '''CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                course TEXT,
                year INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )''',
            '''CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )''',
            '''CREATE TABLE IF NOT EXISTS internships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                description TEXT,
                duration TEXT,
                slots INTEGER DEFAULT 0,
                date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                admin_id INTEGER,
                FOREIGN KEY (admin_id) REFERENCES admins(id)
            )''',
            '''CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                internship_id INTEGER NOT NULL,
                cv_file TEXT,
                cover_letter TEXT,
                status TEXT DEFAULT 'Pending',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (internship_id) REFERENCES internships(id),
                UNIQUE(student_id, internship_id)
            )'''
        ]
        placeholder = "?"

    try:
        cur = conn.cursor()
        for query in schema_queries:
            cur.execute(query)
        
        # Check for default admin
        email = "admin@example.com"
        cur.execute(f"SELECT id FROM admins WHERE email = {placeholder}", (email,))
        if not cur.fetchone():
            hashed_password = generate_password_hash("admin123")
            cur.execute(
                f"INSERT INTO admins (name, email, password) VALUES ({placeholder}, {placeholder}, {placeholder})",
                ("Admin User", email, hashed_password)
            )
            print("Default admin created.")

        conn.commit()
        cur.close()
        conn.close()
        print("Database initialized successfully.")
    except Exception as e:
        print("Error initializing database:", e)


# ------------------ HELPERS ------------------

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def dict_from_row(row):
    """Convert row to dictionary depending on DB type"""
    if row is None:
        return None
    return dict(row)

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = json.loads(get_jwt_identity())
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "DB error"}), 500

        try:
            placeholder = "%s" if hasattr(conn, 'itersize') else "?"
            cur = conn.cursor()
            cur.execute(f"SELECT id FROM admins WHERE id={placeholder}", (user["id"],))
            admin = cur.fetchone()
            cur.close()
            conn.close()

            if not admin:
                return jsonify({"error": "Admin access required"}), 403
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return wrapper

def student_required(f):
    @wraps(f)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = json.loads(get_jwt_identity())
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "DB error"}), 500

        try:
            placeholder = "%s" if hasattr(conn, 'itersize') else "?"
            cur = conn.cursor()
            cur.execute(f"SELECT id FROM students WHERE id={placeholder}", (user["id"],))
            student = cur.fetchone()
            cur.close()
            conn.close()

            if not student:
                return jsonify({"error": "Student access required"}), 403
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return wrapper

# ------------------ STATIC ROUTES ------------------

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


# ------------------ API ROUTES ------------------

@app.route("/api/register/student", methods=["POST"])
def register_student():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    placeholder = "%s" if hasattr(conn, 'itersize') else "?"
    
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM students WHERE email={placeholder}", (data["email"],))
        if cur.fetchone():
            return jsonify({"error": "Email already exists"}), 400

        hashed = generate_password_hash(data["password"])
        cur.execute(
            f"INSERT INTO students (name, email, password, course, year) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})",
            (data.get("name"), data["email"], hashed, data.get("course"), data.get("year"))
        )
        conn.commit()
        return jsonify({"message": "Student registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route("/api/register/admin", methods=["POST"])
def register_admin():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    placeholder = "%s" if hasattr(conn, 'itersize') else "?"

    try:
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM admins WHERE email={placeholder}", (data["email"],))
        if cur.fetchone():
            return jsonify({"error": "Email already exists"}), 400

        hashed = generate_password_hash(data["password"])
        cur.execute(
            f"INSERT INTO admins (name, email, password) VALUES ({placeholder}, {placeholder}, {placeholder})",
            (data.get("name"), data["email"], hashed)
        )
        conn.commit()
        return jsonify({"message": "Admin registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    placeholder = "%s" if hasattr(conn, 'itersize') else "?"

    try:
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM students WHERE email={placeholder}", (data["email"],))
        user_row = cur.fetchone()
        user = dict_from_row(user_row)
        role = "student"

        if not user:
            cur.execute(f"SELECT * FROM admins WHERE email={placeholder}", (data["email"],))
            user_row = cur.fetchone()
            user = dict_from_row(user_row)
            role = "admin"

        if not user or not check_password_hash(user["password"], data["password"]):
            return jsonify({"error": "Invalid credentials"}), 401

        token = create_access_token(identity=json.dumps({"id": user["id"], "email": user["email"], "role": role}))
        return jsonify({"access_token": token, "role": role}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route("/api/internships", methods=["GET"])
def get_internships():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500

    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM internships ORDER BY date_posted DESC")
        internships = [dict_from_row(row) for row in cur.fetchall()]
        return jsonify(internships), 200
    finally:
        conn.close()

@app.route("/api/internships", methods=["POST"])
@admin_required
def create_internship():
    data = request.get_json()
    user = json.loads(get_jwt_identity())
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    placeholder = "%s" if hasattr(conn, 'itersize') else "?"

    try:
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO internships (title, company, description, duration, slots, admin_id) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})",
            (data.get("title"), data.get("company"), data.get("description"), data.get("duration"), data.get("slots", 0), user["id"])
        )
        conn.commit()
        return jsonify({"message": "Internship created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route("/api/apply", methods=["POST"])
@student_required
def apply_for_internship():
    user = json.loads(get_jwt_identity())
    internship_id = request.form.get("internship_id")
    cover_letter = request.form.get("cover_letter", "")
    cv_file = request.files.get("cv")
    
    if not internship_id: return jsonify({"error": "Internship ID required"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    placeholder = "%s" if hasattr(conn, 'itersize') else "?"

    try:
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM applications WHERE student_id={placeholder} AND internship_id={placeholder}", (user["id"], internship_id))
        if cur.fetchone():
            return jsonify({"error": "Already applied"}), 400

        cv_filename = None
        if cv_file and allowed_file(cv_file.filename):
            filename = secure_filename(cv_file.filename)
            cv_filename = f"{user['id']}_{internship_id}_{filename}"
            # Ensure folder exists
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            cv_file.save(os.path.join(app.config['UPLOAD_FOLDER'], cv_filename))

        cur.execute(
            f"INSERT INTO applications (student_id, internship_id, cv_file, cover_letter) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder})",
            (user["id"], internship_id, cv_filename, cover_letter)
        )
        conn.commit()
        return jsonify({"message": "Application submitted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route("/api/status", methods=["GET"])
@student_required
def get_student_applications():
    user = json.loads(get_jwt_identity())
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    placeholder = "%s" if hasattr(conn, 'itersize') else "?"

    try:
        cur = conn.cursor()
        cur.execute(f"""
            SELECT a.*, i.title, i.company
            FROM applications a
            JOIN internships i ON a.internship_id = i.id
            WHERE a.student_id = {placeholder}
            ORDER BY a.applied_at DESC
        """, (user["id"],))
        applications = [dict_from_row(row) for row in cur.fetchall()]
        return jsonify(applications), 200
    finally:
        conn.close()

@app.route("/api/applications", methods=["GET"])
@admin_required
def get_all_applications():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500

    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT a.*, s.name as student_name, s.email as student_email, s.course, s.year,
                   i.title, i.company
            FROM applications a
            JOIN students s ON a.student_id = s.id
            JOIN internships i ON a.internship_id = i.id
            ORDER BY a.applied_at DESC
        """)
        applications = [dict_from_row(row) for row in cur.fetchall()]
        return jsonify(applications), 200
    finally:
        conn.close()

@app.route("/api/applications/<int:application_id>/approve", methods=["POST"])
@admin_required
def approve_application(application_id):
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    placeholder = "%s" if hasattr(conn, 'itersize') else "?"

    try:
        cur = conn.cursor()
        cur.execute(f"UPDATE applications SET status = 'Approved' WHERE id = {placeholder}", (application_id,))
        conn.commit()
        return jsonify({"message": "Application approved successfully"}), 200
    finally:
        conn.close()

@app.route("/api/applications/<int:application_id>/reject", methods=["POST"])
@admin_required
def reject_application(application_id):
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500
    
    placeholder = "%s" if hasattr(conn, 'itersize') else "?"

    try:
        cur = conn.cursor()
        cur.execute(f"UPDATE applications SET status = 'Rejected' WHERE id = {placeholder}", (application_id,))
        conn.commit()
        return jsonify({"message": "Application rejected successfully"}), 200
    finally:
        conn.close()

@app.route("/api/stats", methods=["GET"])
@admin_required
def get_statistics():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB error"}), 500

    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM internships")
        total_internships = cur.fetchone()[0] if hasattr(conn, 'itersize') else cur.fetchone()[0]
        # Note: psycopg2 count returns a tuple too, so index 0 is fine for both usually if query is SELECT COUNT(*)
        # But RealDictCursor from psycopg2 might return {'count': 5}. Let's be careful.
        # Actually with RealDictCursor, fetchone returns a dictionary.
        
        # Let's handle RealDictCursor vs Sqlite Row
        def get_count(cursor, query):
            cursor.execute(query)
            res = cursor.fetchone()
            if res is None: return 0
            if isinstance(res, dict): # RealDictCursor
                return list(res.values())[0]
            if isinstance(res, sqlite3.Row):
                return res[0]
            return res[0] # Normal tuple cursor

        total_internships = get_count(cur, "SELECT COUNT(*) FROM internships")
        total_applications = get_count(cur, "SELECT COUNT(*) FROM applications")
        pending = get_count(cur, "SELECT COUNT(*) FROM applications WHERE status = 'Pending'")
        approved = get_count(cur, "SELECT COUNT(*) FROM applications WHERE status = 'Approved'")
        rejected = get_count(cur, "SELECT COUNT(*) FROM applications WHERE status = 'Rejected'")
        total_students = get_count(cur, "SELECT COUNT(*) FROM students")

        return jsonify({
            "total_internships": total_internships,
            "total_applications": total_applications,
            "pending_applications": pending,
            "approved_applications": approved,
            "rejected_applications": rejected,
            "total_students": total_students
        }), 200
    finally:
        conn.close()


@app.route("/api/me", methods=["GET"])
@jwt_required()
def get_current_user():
    return jsonify(json.loads(get_jwt_identity())), 200

# ------------------ RUN APP ------------------

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
