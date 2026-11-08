# THREATS.md - TrustVault Security Threat Assessment

## 1. Unauthorized Access & RBAC Bypassing
- **Threat**: Attackers changing payload identifiers to read higher security documents.
- **Mitigation**: Server-side JWT claims check combined with SQLite database user authorization query on every restricted route.

## 2. Audit Trail Tampering
- **Threat**: Compromised admin trying to edit activity logs to cover file deletions.
- **Mitigation**: Immutable SHA-256 hash chaining sequence; breaking link invalidates historical hash verification.

## 3. Persistent Token Theft (XSS/CSRF)
- **Threat**: Malicious scripts stealing local storage bearer tokens.
- **Mitigation**: Strict CORS domain matching, sanitized client inputs, short token lifespans.