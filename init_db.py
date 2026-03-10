import sqlite3
import os
import random
from datetime import datetime, timedelta
import hashlib
import uuid

DB_PATH = 'schools.db'

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Create tables
    c.executescript('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            school_udise TEXT
        );

        CREATE TABLE students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roll_number TEXT NOT NULL,
            name TEXT NOT NULL,
            class_name TEXT NOT NULL,
            parent_phone TEXT UNIQUE NOT NULL,
            school_udise TEXT
        );
        
        CREATE TABLE parent_sessions (
            token TEXT PRIMARY KEY,
            student_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(student_id) REFERENCES students(id)
        );

        CREATE TABLE attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            student_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY(student_id) REFERENCES students(id),
            UNIQUE(date, student_id)
        );

        CREATE TABLE assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            class_name TEXT NOT NULL,
            due_date DATE NOT NULL,
            description TEXT
        );

        CREATE TABLE assignment_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assignment_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            submitted_at TIMESTAMP,
            FOREIGN KEY(assignment_id) REFERENCES assignments(id),
            FOREIGN KEY(student_id) REFERENCES students(id),
            UNIQUE(assignment_id, student_id)
        );

        CREATE TABLE materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            duration TEXT,
            source TEXT
        );

        CREATE TABLE notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            date DATE NOT NULL,
            audience TEXT NOT NULL
        );
    ''')

    # Insert Admins & Teachers
    c.execute("INSERT INTO users (username, password_hash, role, name, school_udise) VALUES (?, ?, 'admin', 'Super Admin', '27252001410')", ('admin', hash_password('admin123')))
    c.execute("INSERT INTO users (username, password_hash, role, name, school_udise) VALUES (?, ?, 'teacher', 'Smt. Priya Deshmukh', '27252001410')", ('teacher1', hash_password('teacher123')))

    # Insert Students
    students = [
        ("A", "Aanya Patil", "7A", "9876543001"),
        ("B", "Bharat Shinde", "7A", "9876543002"),
        ("C", "Chitra Deshmukh", "7A", "9876543003"),
        ("D", "Deepak Jadhav", "7A", "9876543004"),
        ("E", "Esha Kulkarni", "7A", "9876543005"),
        ("F", "Farhan Shaikh", "7A", "9876543006"),
        ("G", "Gauri Wagh", "7A", "9876543007"),
        ("H", "Harish Pawar", "7A", "9876543008"),
        ("I", "Ishaan Bhor", "7A", "9876543009"),
        ("J", "Janhavi Kale", "7A", "9876543010"),
    ]
    c.executemany("INSERT INTO students (roll_number, name, class_name, parent_phone, school_udise) VALUES (?, ?, ?, ?, '27252001410')", students)

    # Insert Attendance History
    base_date = datetime.now()
    attendance_records = []
    
    thresholds = {1:0.96, 2:0.88, 3:0.92, 4:0.78, 5:0.95, 6:0.85, 7:0.90, 8:0.70, 9:0.93, 10:0.97}
    for sid in range(1, 11):
        for d in range(30, -1, -1):
            day = base_date - timedelta(days=d)
            if day.weekday() >= 5: continue
            present = random.random() < thresholds.get(sid, 0.9)
            attendance_records.append((day.strftime("%Y-%m-%d"), sid, "P" if present else "A"))
    
    c.executemany("INSERT INTO attendance (date, student_id, status) VALUES (?, ?, ?)", attendance_records)

    # Insert Assignments
    assignments = [
        ("Fractions & Decimals Worksheet", "Mathematics", "7A", (base_date + timedelta(days=2)).strftime("%Y-%m-%d"), "Complete exercises 1 to 20 on page 45."),
        ("Photosynthesis Diagram", "Science", "7A", (base_date + timedelta(days=3)).strftime("%Y-%m-%d"), "Draw and label the process of photosynthesis."),
        ("Grammar Practice — Tenses", "English", "7A", (base_date - timedelta(days=1)).strftime("%Y-%m-%d"), "Fill in the blanks using correct verb tenses."),
        ("Shivaji Maharaj Essay", "Marathi", "7A", (base_date + timedelta(days=5)).strftime("%Y-%m-%d"), "Write a 300-word essay on Chhatrapati Shivaji Maharaj."),
        ("Mughal Empire Timeline", "History", "7A", (base_date + timedelta(days=1)).strftime("%Y-%m-%d"), "Create a timeline of the Mughal emperors.")
    ]
    c.executemany("INSERT INTO assignments (title, subject, class_name, due_date, description) VALUES (?, ?, ?, ?, ?)", assignments)

    # Insert Materials
    materials = [
        ("Mathematics", "video", "Fractions & Decimals — Part 1", "Interactive video lesson covering basics of fractions and decimal points.", "12 mins", "Diksha Portal"),
        ("Mathematics", "quiz", "Fractions Practice Quiz", "Test your understanding of adding and subtracting fractions.", "15 Questions", "MahaVidya"),
        ("Science", "video", "Photosynthesis Explained", "Animated explanation of how plants make food.", "8 mins", "SCERT Maharashtra"),
        ("Science", "pdf", "Chapter 4 — Plant Life Notes", "Summary notes and diagrams for Chapter 4.", "4 Pages", "Diksha Portal"),
        ("English", "video", "Grammar: English Tenses", "Easy way to remember past, present, and future tenses.", "15 mins", "Diksha Portal"),
        ("Marathi", "pdf", "Kavita 3 — Shravanmas", "Poem text along with meaning and Q&A.", "3 Pages", "SCERT Maharashtra")
    ]
    c.executemany("INSERT INTO materials (subject, type, title, description, duration, source) VALUES (?, ?, ?, ?, ?, ?)", materials)
    
    # Insert Notices
    notices = [
        ("Unit Test 2 Schedule", "Unit Test 2 begins on 18 March 2026. Please check the timetable.", (base_date - timedelta(days=2)).strftime("%Y-%m-%d"), "All Parents"),
        ("Science Exhibition — Registration", "Students from class 6-8 can register for the science fair by 15th March.", (base_date - timedelta(days=4)).strftime("%Y-%m-%d"), "Class 6-8")
    ]
    c.executemany("INSERT INTO notices (title, message, date, audience) VALUES (?, ?, ?, ?)", notices)

    conn.commit()
    conn.close()
    print("Database initialized successfully at", DB_PATH)

if __name__ == '__main__':
    init_db()
