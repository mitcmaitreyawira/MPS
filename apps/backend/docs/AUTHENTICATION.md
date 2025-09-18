# Authentication & Password Management

This document describes the authentication and password management system implemented in the application.

## Features

- **JWT-based authentication** with HttpOnly cookies
- **Role-based access control** (RBAC)
- **Password policy enforcement**
- **Account lockout** after multiple failed attempts
- **Password history** to prevent reuse
- **Password expiration**
- **Audit logging** of security-related events
- **Password reset** via email

## Authentication Flow

1. **Login**
   - User provides email/username and password
   - System validates credentials
   - On success, issues JWT token in HttpOnly cookie
   - On failure, increments failed login attempts counter

2. **Password Reset**
   - User requests password reset with their email
   - System generates a time-limited reset token
   - User receives email with reset link
   - User submits new password with the reset token
   - System validates token and updates password

## Password Policy

The following password policies are enforced:

- Minimum length: 12 characters
- Must include uppercase and lowercase letters
- Must include at least one number
- Must include at least one special character
- Cannot be one of the last 5 used passwords
- Expires after 90 days

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PASSWORD_MIN_LENGTH` | Minimum password length | 12 |
| `PASSWORD_REQUIRE_UPPERCASE` | Require uppercase letters | true |
| `PASSWORD_REQUIRE_LOWERCASE` | Require lowercase letters | true |
| `PASSWORD_REQUIRE_NUMBER` | Require numbers | true |
| `PASSWORD_REQUIRE_SPECIAL_CHAR` | Require special characters | true |
| `PASSWORD_MAX_AGE_DAYS` | Password expiration in days | 90 |
| `PASSWORD_HISTORY_SIZE` | Number of previous passwords to remember | 5 |
| `MAX_LOGIN_ATTEMPTS` | Maximum failed login attempts before lockout | 5 |
| `ACCOUNT_LOCKOUT_MINUTES` | Lockout duration in minutes | 15 |
| `BCRYPT_ROUNDS` | Number of bcrypt hashing rounds | 12 |

## API Endpoints

### Authentication

- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Invalidate session
- `GET /auth/me` - Get current user profile

### Password Management

- `POST /auth/change-password` - Change password (authenticated)
- `POST /auth/request-password-reset` - Request password reset
- `POST /auth/reset-password` - Reset password with token

## Audit Logging

All security-related events are logged to the audit log, including:

- Login attempts (successful and failed)
- Password changes
- Password reset requests
- Account lockouts
- Role changes

## Security Best Practices

1. **Never store plaintext passwords** - Always use strong hashing (bcrypt)
2. **Use HttpOnly cookies** for JWT tokens to prevent XSS attacks
3. **Implement rate limiting** to prevent brute force attacks
4. **Log all security events** for monitoring and forensics
5. **Enforce strong password policies**
6. **Implement account lockout** after multiple failed attempts
7. **Use secure headers** (HSTS, CSP, etc.)
8. **Regularly rotate secrets** (JWT, database credentials, etc.)
