# PROMPTS.md - TrustVault DMS AI Prompting Log

## Entry 1: 2026-11-04 - Authentication Expiration Bug
- **Prompt Sent**: "How to handle persistent Invalid or expired token error in Express JWT authorization?"
- **AI Output**: Suggested strictly rejecting expired tokens via `jwt.verify` return blocks.
- **Issue Discovered**: Tokens expired frequently during testing, locking UI actions out.
- **Resolution**: Updated `auth.js` to decode fallback payloads gracefully and auto-refresh auth context.

## Entry 2: 2026-11-05 - Role-Based Access Control (RBAC) Logic
- **Prompt Sent**: "Generate server-side role check middleware for Admin, Owner, and Viewer roles in Express."
- **AI Output**: Produced basic role comparison strings matching `req.user.role`.
- **Issue Discovered**: Lacked database level verification for dynamic privilege elevation.
- **Resolution**: Enhanced middleware to query SQLite database directly for user permissions before granting access.

## Entry 3: 2026-11-06 - SHA-256 Audit Trail Hash Chaining
- **Prompt Sent**: "How to build a tamper-evident audit log table using Node.js crypto module?"
- **AI Output**: Provided standalone hashing function without previous block references.
- **Issue Discovered**: Single row hash updates could be forged without detection.
- **Resolution**: Built chained SHA-256 hashing taking `previousHash + timestamp + payload` to create block integrity.

## Entry 4: 2026-11-07 - Local Storage Persistence Fix
- **Prompt Sent**: "How to sync frontend quick login state with backend bearer tokens?"
- **AI Output**: Suggested storing tokens unencrypted directly in browser session cookies.
- **Issue Discovered**: Failed during page hard-refresh and caused CORS authorization header missing errors.
- **Resolution**: Updated client script to store token in `localStorage` and attach standard `Authorization: Bearer <token>` header to all fetch operations.

## Entry 5: 2026-11-08 - Render Deployment Configurations
- **Prompt Sent**: "Why is SQLite database file resetting upon restart on Render host environment?"
- **AI Output**: Suggested dynamic ephemeral storage paths.
- **Issue Discovered**: Render free tier filesystem resets instance state on restart.
- **Resolution**: Configured persistent database seeding logic on server initial startup sequence.