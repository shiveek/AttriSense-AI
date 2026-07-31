# Security Policy

## Supported Versions

| Version | Supported |
| :--- | :--- |
| 1.0.x | :white_check_mark: |
| < 1.0.0 | :x: |

---

## Reporting a Vulnerability

AttriSense AI takes security seriously. If you discover a security vulnerability within this repository, please do **NOT** open a public issue.

Instead, please report the vulnerability directly to our security maintainers:

- **Email**: `security@attrisense.com`
- **PCP Key / Encrypted Comm**: Available upon request.

---

## Response Matrix

- **Acknowledgment**: Within 24 hours.
- **Initial Severity Assessment**: Within 48 hours.
- **Hotfix Target SLA**: Within 7 business days for High/Critical severity issues.

---

## Security Practices Implemented

- **Password Hashing**: `passlib[bcrypt]` with salted iterations.
- **Authentication**: Stateless OAuth2 Bearer tokens signed with HMAC-SHA256 (`HS256`).
- **SQL Injection Prevention**: Parameterized queries via SQLAlchemy 2.0 ORM.
- **XSS & CORS**: Strict CORS headers and React automatic DOM escaping.
- **Compliance Audit Logging**: All sensitive mutations generate structured audit trail records.
