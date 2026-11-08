const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { db, logAudit } = require('./db');

// --- BUILT-IN AUTHENTICATION HELPERS ---
const JWT_SECRET = process.env.JWT_SECRET || 'trustvault_super_secret_key_2026';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token missing or unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token is invalid or expired' });
        }
        req.user = user;
        next();
    });
}
// --------------------------------------

const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files safely from backend/public
app.use(express.static(path.join(__dirname, 'public')));

// Explicit root route handler to completely prevent "Cannot GET /" error
app.get('/', (req, res) => {
  const localPath = path.join(__dirname, 'public/index.html');
  
  if (fs.existsSync(localPath)) {
    res.sendFile(localPath);
  } else {
    res.status(404).send('Error: index.html file not found in backend/public!');
  }
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const upload = multer({ dest: uploadDir });

// SEED DEFAULT USERS
setTimeout(() => {
  const defaultPass = bcrypt.hashSync('Password123!', 8);
  const users = [
    ['admin@trustvault.com', defaultPass, 'ADMIN'],
    ['owner@trustvault.com', defaultPass, 'OWNER'],
    ['viewer@trustvault.com', defaultPass, 'VIEWER']
  ];
  users.forEach(([email, pass, role]) => {
    db.run(`INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)`, [email, pass, role]);
  });
  console.log('✅ Default Users Seeded: Admin, Owner, Viewer');
}, 1000);

// AUTH LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid email or password' });

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, role: user.role, email: user.email, userId: user.id });
  });
});

// UPLOAD DOCUMENT
app.post('/api/documents/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (req.user.role === 'VIEWER') {
    return res.status(403).json({ error: 'Viewers cannot upload documents' });
  }

  const { title, category } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  db.run(
    `INSERT INTO documents (title, filename, filepath, category, owner_id) VALUES (?, ?, ?, ?, ?)`,
    [title || file.originalname, file.originalname, file.path, category || 'General', req.user.id],
    function (err) {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({ error: 'Database error during upload' });
      }
      const docId = this.lastID;
      logAudit(req.user.id, 'UPLOAD', docId, 'SUCCESS');
      res.json({ message: 'Document uploaded successfully', documentId: docId });
    }
  );
});

// LIST DOCUMENTS
app.get('/api/documents', authenticateToken, (req, res) => {
  let query = `
    SELECT DISTINCT d.*, u.email as owner_email 
    FROM documents d 
    JOIN users u ON d.owner_id = u.id 
    LEFT JOIN permissions p ON d.id = p.document_id 
    WHERE 1=1
  `;
  let params = [];

  if (req.user.role !== 'ADMIN') {
    query += ` AND (d.owner_id = ? OR p.user_id = ?)`;
    params.push(req.user.id, req.user.id);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// SECURE DOWNLOAD
app.get('/api/documents/:id/download', authenticateToken, (req, res) => {
  const docId = req.params.id;
  db.get(`SELECT * FROM documents WHERE id = ?`, [docId], (err, doc) => {
    if (err || !doc) return res.status(404).json({ error: 'Document not found' });

    logAudit(req.user.id, 'DOWNLOAD', docId, 'SUCCESS');
    res.download(doc.filepath, doc.filename);
  });
});

// DELETE DOCUMENT
app.delete('/api/documents/:id', authenticateToken, (req, res) => {
  const docId = req.params.id;
  db.get(`SELECT * FROM documents WHERE id = ?`, [docId], (err, doc) => {
    if (err || !doc) return res.status(404).json({ error: 'Document not found' });

    if (req.user.role !== 'ADMIN' && doc.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this document' });
    }

    if (fs.existsSync(doc.filepath)) {
      try { fs.unlinkSync(doc.filepath); } catch (e) { console.error(e); }
    }

    db.run(`DELETE FROM documents WHERE id = ?`, [docId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete from database' });

      logAudit(req.user.id, 'DELETE', docId, 'SUCCESS');
      res.json({ message: 'Document deleted successfully' });
    });
  });
});

// AUDIT LOGS
app.get('/api/admin/audit-logs', authenticateToken, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all(`
    SELECT a.*, u.email as actor_email 
    FROM audit_logs a 
    LEFT JOIN users u ON a.actor_id = u.id 
    ORDER BY a.id DESC LIMIT 100
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 TrustVault Server running on port ${PORT}`));