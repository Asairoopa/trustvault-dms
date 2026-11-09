# 🛡️ TrustVault - Secure Document Management System

TrustVault is a secure, role-based document management system built with Node.js, Express, and SQLite. It features multi-role access controls (Admin, Owner, Viewer) and a tamper-evident audit logging system secured with cryptographic SHA-256 hash chaining.

---

## 🚀 Features

- **Multi-Role Access Control (RBAC):** Distinct permissions for Administrators, Owners, and Viewers.
- **Tamper-Evident Audit Logs:** Cryptographic SHA-256 hash chaining to ensure log integrity.
- **Secure File Operations:** Upload, manage, and retrieve documents securely.
- **Lightweight & Fast:** Powered by Node.js, Express, and SQLite.

---

## 📁 Project Structure

```text
trustvault-dms/
├── backend/
│   ├── node_modules/         # Dependencies (ignored in Git)
│   ├── public/               # Static frontend assets / uploads
│   ├── database.sqlite       # SQLite database file
│   ├── package.json          # Project metadata & dependencies
│   ├── package-lock.json     # Locked dependency versions
│   └── server.js             # Main application entry point
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
