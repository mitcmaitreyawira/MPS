// Import the apiRequest function from the main api module
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const API_URL: string = (import.meta as any).env?.VITE_API_URL || '/api';
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const method = options.method?.toUpperCase() || 'GET';
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      (headers as Record<string, string>)['X-CSRF-Token'] = csrfToken;
    }
  }

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

function getCsrfToken(): string | null {
  const csrfCookie = document.cookie.split(';').find(c => c.trim().startsWith('csrf_token='));
  return csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialChars: string;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface GeneratedPassword {
  password: string;
  strength: 'weak' | 'medium' | 'strong';
  length: number;
}

export interface ResetToken {
  token: string;
  expiresAt: string;
  userId: string;
}

// Get password policy
export const getPasswordPolicy = (): Promise<{ data: PasswordPolicy }> => {
  return apiRequest('/password-management/policy');
};

// Validate password
export const validatePassword = (password: string, userId?: string): Promise<{ data: PasswordValidation }> => {
  return apiRequest('/password-management/validate-password', {
    method: 'POST',
    body: JSON.stringify({ password, userId })
  });
};

// Generate secure password
export const generateSecurePassword = (length: number = 16): Promise<{ data: GeneratedPassword }> => {
  return apiRequest('/password-management/generate-password', {
    method: 'POST',
    body: JSON.stringify({ length })
  });
};

// Change user password (admin only)
export const changeUserPassword = (
  userId: string, 
  newPassword: string, 
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  return apiRequest('/password-management/change-password', {
    method: 'POST',
    body: JSON.stringify({ userId, newPassword, reason })
  });
};

// Initiate password reset (admin only)
export const initiatePasswordReset = (
  userId: string, 
  reason?: string
): Promise<{ data: ResetToken }> => {
  return apiRequest('/password-management/initiate-reset', {
    method: 'POST',
    body: JSON.stringify({ userId, reason })
  });
};

// Reset password with token
export const resetPasswordWithToken = (
  token: string, 
  newPassword: string, 
  userId?: string
): Promise<{ success: boolean; message: string }> => {
  return apiRequest('/password-management/reset-with-token', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword, userId })
  });
};
