const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables with all required columns including target_id
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    filename TEXT,
    filepath TEXT,
    category TEXT,
    owner_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER,
    user_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER,
    action TEXT,
    target_id INTEGER,
    status TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

function logAudit(actorId, action, targetId, status) {
  db.run(
    `INSERT INTO audit_logs (actor_id, action, target_id, status) VALUES (?, ?, ?, ?)`,
    [actorId, action, targetId, status],
    (err) => {
      if (err) console.error("Audit log error:", err.message);
    }
  );
}

module.exports = { db, logAudit };