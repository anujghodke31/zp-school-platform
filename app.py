from flask import Flask, request, jsonify, send_from_directory, Response, stream_with_context
from flask_cors import CORS
import sqlite3
import os
import time
import json
import hashlib
from datetime import datetime, timedelta
from queue import Queue

app = Flask(__name__, static_url_path='/static')
CORS(app)

DB_PATH = 'schools.db'

# Basic SSE Setup for Real-Time Alerts
clients = []

def notify_clients(message):
    for client in clients:
        client.put(message)

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ---------------------------------------------------------------
# Static File Routes
# ---------------------------------------------------------------
@app.route('/')
def index(): return send_from_directory('.', 'index.html')
@app.route('/style.css')
def style(): return send_from_directory('.', 'style.css')
@app.route('/script.js')
def script(): return send_from_directory('.', 'script.js')
@app.route('/manifest.json')
def manifest(): return send_from_directory('.', 'manifest.json')
@app.route('/sw.js')
def service_worker():
    resp = send_from_directory('.', 'sw.js')
    resp.headers['Content-Type'] = 'application/javascript'
    resp.headers['Service-Worker-Allowed'] = '/'
    return resp
@app.route('/zp_school_real.jpg')
def photo(): return send_from_directory('.', 'zp_school_real.jpg')
@app.route('/dashboard.html')
def dashboard(): return send_from_directory('.', 'dashboard.html')
@app.route('/dashboard.js')
def dashboard_js(): return send_from_directory('.', 'dashboard.js')
@app.route('/parent_portal.html')
def parent_portal(): return send_from_directory('.', 'parent_portal.html')
@app.route('/admin_panel.html')
def admin_panel(): return send_from_directory('.', 'admin_panel.html')
@app.route('/elearning.html')
def elearning(): return send_from_directory('.', 'elearning.html')

# ---------------------------------------------------------------
# SSE Real-Time Stream
# ---------------------------------------------------------------
@app.route('/stream')
def stream():
    def event_stream():
        q = Queue()
        clients.append(q)
        try:
            while True:
                msg = q.get()
                yield f"data: {json.dumps(msg)}\n\n"
        except GeneratorExit:
            clients.remove(q)
    return Response(stream_with_context(event_stream()), mimetype="text/event-stream")

# ---------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username', '')
    password = data.get('password', '')
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ? AND password_hash = ?', (username, hash_password(password))).fetchone()
    conn.close()

    time.sleep(0.5)
    if user:
        return jsonify({
            "success": True, 
            "token": f"jwt-{user['role']}-{os.urandom(8).hex()}", 
            "role": user['role'].capitalize(), 
            "name": user['name'], 
            "redirect": "admin_panel.html" if user['role'] == 'admin' else "dashboard.html"
        })
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/otp/send', methods=['POST'])
def send_otp():
    data = request.json
    phone = data.get('phone', '').replace('+91', '').replace(' ', '').strip()
    
    conn = get_db_connection()
    student = conn.execute('SELECT id FROM students WHERE parent_phone = ?', (phone,)).fetchone()
    conn.close()

    if student:
        # Generate stable OTP for demo purposes: last 6 digits of phone or 123456
        otp = "123456"
        print(f"\n[OTP] Real login simulation. Use OTP 123456 for phone {phone}\n")
        time.sleep(0.5)
        return jsonify({"success": True, "otp": otp, "student_found": True, "message": f"OTP sent to {phone}"})
    else:
        return jsonify({"success": False, "message": "No student found with this parent phone number."}), 404

@app.route('/api/otp/verify', methods=['POST'])
def verify_otp():
    data = request.json
    phone = data.get('phone', '').replace('+91', '').replace(' ', '').strip()
    entered = data.get('otp', '')
    
    conn = get_db_connection()
    student = conn.execute('SELECT id, name FROM students WHERE parent_phone = ?', (phone,)).fetchone()
    
    if student and entered == '123456':
        token = f"jwt-parent-{os.urandom(8).hex()}"
        conn.execute('INSERT INTO parent_sessions (token, student_id) VALUES (?, ?)', (token, student['id']))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "token": token, "role": "Parent", "student_id": student['id'], "student_name": student['name']})
    
    conn.close()
    return jsonify({"success": False, "message": "Invalid OTP"}), 401

# ---------------------------------------------------------------
# STUDENT & ATTENDANCE APIs
# ---------------------------------------------------------------
@app.route('/api/students', methods=['GET'])
def get_students():
    conn = get_db_connection()
    students_data = conn.execute('SELECT * FROM students').fetchall()
    
    today = datetime.now().strftime("%Y-%m-%d")
    result = []
    
    for s in students_data:
        history = dict(conn.execute('SELECT date, status FROM attendance WHERE student_id = ?', (s['id'],)).fetchall())
        total_days = len(history)
        present_days = sum(1 for v in history.values() if v == "P")
        pct = round((present_days / total_days * 100) if total_days else 0, 1)
        today_status = history.get(today, "—")
        
        result.append({
            "id": s['id'], "roll": s['roll_number'], "name": s['name'], "class": s['class_name'], 
            "parent_phone": s['parent_phone'], "attendance_pct": pct, 
            "present_days": present_days, "total_days": total_days, "today_status": today_status
        })
    conn.close()
    return jsonify(result)

@app.route('/api/student/<int:student_id>/attendance', methods=['GET'])
def get_student_attendance(student_id):
    conn = get_db_connection()
    s = conn.execute('SELECT * FROM students WHERE id = ?', (student_id,)).fetchone()
    if not s:
        conn.close()
        return jsonify({"error": "Student not found"}), 404
        
    history = dict(conn.execute('SELECT date, status FROM attendance WHERE student_id = ?', (student_id,)).fetchall())
    conn.close()
    
    sorted_history = dict(sorted(history.items()))
    total = len(sorted_history)
    present = sum(1 for v in sorted_history.values() if v == "P")
    pct = round((present / total * 100) if total else 0, 1)
    
    return jsonify({
        "id": s['id'], "roll": s['roll_number'], "name": s['name'], "class": s['class_name'], 
        "attendance_pct": pct, "present_days": present, "total_days": total, "history": sorted_history
    })

# ---------------------------------------------------------------
# Events, Results & Notices APIs
# ---------------------------------------------------------------
@app.route('/api/notices', methods=['GET'])
def get_notices():
    conn = get_db_connection()
    notices = conn.execute('SELECT title, message FROM notices ORDER BY id DESC LIMIT 5').fetchall()
    conn.close()
    
    ticker = [f"📢 {n['title']} — {n['message']}" for n in notices]
    return jsonify({"notices": ticker if ticker else ["Welcome to MahaVidya ZP School Network!"], "date": datetime.now().strftime("%d %b %Y")})

@app.route('/api/notices', methods=['POST'])
def create_notice():
    data = request.json
    title = data.get('title', 'Admin Announcement')
    message = data.get('message', '')
    audience = data.get('audience', 'All')
    
    conn = get_db_connection()
    conn.execute('INSERT INTO notices (title, message, date, audience) VALUES (?, ?, ?, ?)', 
                 (title, message, datetime.now().strftime("%Y-%m-%d"), audience))
    conn.commit()
    conn.close()
    
    # Broadcast real-time SSE event to all connected clients
    notify_clients({"type": "notice", "title": title, "message": message})
    return jsonify({"success": True})

# ---------------------------------------------------------------
# Assignments & E-Learning
# ---------------------------------------------------------------
@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    conn = get_db_connection()
    assignments = conn.execute('SELECT * FROM assignments ORDER BY due_date ASC').fetchall()
    
    res = []
    for a in assignments:
        submissions = conn.execute('SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = ?', (a['id'],)).fetchone()[0]
        status = 'active' if datetime.strptime(a['due_date'], "%Y-%m-%d") >= datetime.now() else 'completed'
        res.append({
            "id": a['id'], "title": a['title'], "subject": a['subject'], "class": a['class_name'],
            "due": a['due_date'], "due_display": datetime.strptime(a['due_date'], "%Y-%m-%d").strftime("%d %b %Y"),
            "desc": a['description'], "submissions": submissions, "total": 10, "status": status
        })
    conn.close()
    return jsonify(res)

@app.route('/api/elearning/materials', methods=['GET'])
def get_elearning_materials():
    subject = request.args.get('subject', '').lower()
    conn = get_db_connection()
    if subject and subject != 'all':
        materials = conn.execute('SELECT * FROM materials WHERE LOWER(subject) = ?', (subject,)).fetchall()
    else:
        materials = conn.execute('SELECT * FROM materials').fetchall()
    conn.close()
    
    colors = {"Mathematics": "#1565C0", "Science": "#2E7D32", "English": "#E65100", "Marathi": "#6A1B9A", "History": "#BF360C"}
    bgs = {"Mathematics": "#E3F2FD", "Science": "#E8F5E9", "English": "#FFF3E0", "Marathi": "#F3E5F5", "History": "#FBE9E7"}
    icons = {"video": "fa-circle-play", "pdf": "fa-file-pdf", "quiz": "fa-circle-question"}
    
    return jsonify([{
        "id": m['id'], "subject": m['subject'], "type": m['type'], "title": m['title'], "desc": m['description'],
        "duration": m['duration'], "source": m['source'], "color": colors.get(m['subject'], "#000"),
        "bg": bgs.get(m['subject'], "#EEE"), "icon": icons.get(m['type'], "fa-book")
    } for m in materials])

# ---------------------------------------------------------------
# Dashboard Analytics
# ---------------------------------------------------------------
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    conn = get_db_connection()
    total_st = conn.execute('SELECT COUNT(*) FROM students').fetchone()[0]
    total_assign = conn.execute('SELECT COUNT(*) FROM assignments').fetchone()[0]
    
    # Simple risk calculation
    students = conn.execute('SELECT id FROM students').fetchall()
    at_risk = 0
    total_sum = 0
    for s in students:
        history = conn.execute('SELECT status FROM attendance WHERE student_id = ?', (s['id'],)).fetchall()
        t = len(history)
        p = sum(1 for h in history if h['status'] == 'P')
        pct = (p/t*100) if t else 100
        total_sum += pct
        if pct < 80: at_risk += 1
        
    conn.close()
    
    return jsonify({
        "total_students": total_st,
        "total_teachers": 2, # Based on init_db seeded data
        "total_classes": 1, 
        "avg_attendance": round(total_sum / total_st if total_st else 0, 1),
        "at_risk_count": at_risk,
        "total_assignments": total_assign,
        "schools_in_network": 1,
        "active_sessions": len(clients)
    })

if __name__ == '__main__':
    app.run(debug=True, port=8000, host='0.0.0.0')
