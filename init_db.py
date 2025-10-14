import sqlite3
import os

# siguraduhin may 'instance' folder
os.makedirs("instance", exist_ok=True)

# connect sa database (gagawa kung wala pa)
conn = sqlite3.connect("instance/visitors.db")
cursor = conn.cursor()

# create user table kung wala pa
cursor.execute("""
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
)
""")

# insert sample guard account
cursor.execute("INSERT OR IGNORE INTO user (username, password, role) VALUES (?, ?, ?)", 
               ("guard", "123", "guard"))

conn.commit()
conn.close()

print("Database initialized with guard account.")
