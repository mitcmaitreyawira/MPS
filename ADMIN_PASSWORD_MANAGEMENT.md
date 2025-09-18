# Admin Password Management System

## Overview

This document describes the secure password management system implemented for admin users in the MPS Launch application. The system provides a comprehensive, reusable, and maintainable solution for managing user passwords with proper validation, role-based access control, and audit logging.

## Features

### Backend Components

#### 1. Password Policy Configuration (`password-policy.config.ts`)
- Configurable password policies via environment variables
- Default secure settings with override capability
- Password strength validation
- Reset token configuration

**Environment Variables:**
```bash
PASSWORD_MIN_LENGTH=12
PASSWORD_MAX_LENGTH=128
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true
PASSWORD_SPECIAL_CHARS=!@#$%^&*()_+-=[]{}|;:,.<>?
PASSWORD_RESET_TOKEN_LENGTH=32
PASSWORD_RESET_TOKEN_EXPIRY_HOURS=24
```

#### 2. Password Management Service (`password-management.service.ts`)
- Password validation with strength checking
- Secure password hashing using bcrypt
- Password change functionality with audit logging
- Password reset token generation and validation
- Secure random password generation
- Policy retrieval

#### 3. Password Management Controller (`password-management.controller.ts`)
- RESTful API endpoints with Swagger documentation
- Role-based access control (admin/teacher only)
- Input validation and error handling
- Comprehensive API responses

**API Endpoints:**
- `POST /api/v1/password-management/change-password` - Change user password
- `POST /api/v1/password-management/validate-password` - Validate password strength
- `POST /api/v1/password-management/generate-password` - Generate secure password
- `POST /api/v1/password-management/initiate-reset` - Create password reset token
- `POST /api/v1/password-management/reset-with-token` - Reset password using token
- `GET /api/v1/password-management/policy` - Get password policy

#### 4. Audit Service (`audit.service.ts`)
- Comprehensive logging of password-related actions
- Structured audit trail with timestamps
- User action tracking for compliance

### Frontend Components

#### 1. Password Management Component (`PasswordManagement.tsx`)
- User selection dropdown with search
- Password input with real-time validation
- Secure password generation
- Visual feedback for password strength
- Reason input for audit trail
- Success/error messaging

#### 2. Password Management API (`password-management.api.ts`)
- Type-safe API client functions
- Error handling and response parsing
- CSRF token integration
- Credential management

#### 3. Password Management Page (`PasswordManagement.tsx`)
- Admin dashboard integration
- Responsive design
- Proper layout and styling

## Security Features

### 1. Password Validation
- Minimum/maximum length requirements
- Character type requirements (uppercase, lowercase, numbers, special chars)
- Prevention of common passwords
- Personal information detection
- Strength scoring (weak/medium/strong)

### 2. Access Control
- Role-based permissions (admin/teacher only)
- JWT token validation
- CSRF protection
- HttpOnly cookie authentication

### 3. Audit Logging
- All password changes logged with:
  - Admin user ID and target user ID
  - Timestamp and reason
  - Password strength assessment
  - Action type (change/reset/generate)

### 4. Secure Token Management
- Cryptographically secure reset tokens
- Configurable expiration times
- Single-use token validation
- Automatic cleanup of expired tokens

## Usage Examples

### 1. Change User Password (Admin)
```typescript
import { changeUserPassword } from '../services/api';

try {
  await changeUserPassword(
    'user123', 
    'NewSecurePassword123!', 
    'Password reset requested by user'
  );
  console.log('Password changed successfully');
} catch (error) {
  console.error('Password change failed:', error.message);
}
```

### 2. Generate Secure Password
```typescript
import { generateSecurePassword } from '../services/api';

const { data } = await generateSecurePassword(16);
console.log('Generated password:', data.password);
console.log('Strength:', data.strength);
```

### 3. Validate Password Strength
```typescript
import { validatePassword } from '../services/api';

const { data } = await validatePassword('TestPassword123!');
if (data.isValid) {
  console.log('Password is valid, strength:', data.strength);
} else {
  console.log('Validation errors:', data.errors);
}
```

## Configuration

### Backend Configuration
Add to your `.env` file:
```bash
# Password Policy Settings
PASSWORD_MIN_LENGTH=12
PASSWORD_MAX_LENGTH=128
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true

# Reset Token Settings
PASSWORD_RESET_TOKEN_LENGTH=32
PASSWORD_RESET_TOKEN_EXPIRY_HOURS=24
```

### Frontend Integration
1. Import the password management component:
```typescript
import { PasswordManagement } from '../components/admin/PasswordManagement';
```

2. Add to your admin dashboard:
```tsx
<Route path="/admin/password-management" component={PasswordManagementPage} />
```

## Best Practices

### 1. Security
- Always validate passwords on both client and server side
- Use HTTPS for all password-related operations
- Implement proper session management
- Regular security audits of password policies

### 2. User Experience
- Provide clear feedback on password requirements
- Show password strength indicators
- Allow secure password generation
- Implement proper error messaging

### 3. Compliance
- Maintain comprehensive audit logs
- Regular review of password policies
- Document all administrative actions
- Implement proper data retention policies

## Troubleshooting

### Common Issues

1. **Password validation fails**
   - Check password policy configuration
   - Verify character requirements are met
   - Ensure password length is within limits

2. **API authentication errors**
   - Verify user has admin/teacher role
   - Check JWT token validity
   - Ensure CSRF token is included

3. **Audit logging not working**
   - Check audit service configuration
   - Verify database connectivity
   - Review log file permissions

### Error Codes
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (user not found)
- `500` - Internal Server Error (system error)

## Future Enhancements

1. **Multi-factor Authentication**
   - SMS/Email verification for password changes
   - TOTP integration for admin actions

2. **Advanced Password Policies**
   - Password history tracking
   - Account lockout policies
   - Breach detection integration

3. **Enhanced Audit Features**
   - Real-time monitoring dashboard
   - Automated compliance reporting
   - Integration with SIEM systems

4. **User Self-Service**
   - Password reset via email
   - Security question integration
   - Account recovery workflows

## Support

For technical support or questions about the password management system:
1. Check this documentation first
2. Review the API documentation at `/api/docs`
3. Check application logs for error details
4. Contact the development team with specific error messages and steps to reproduce
