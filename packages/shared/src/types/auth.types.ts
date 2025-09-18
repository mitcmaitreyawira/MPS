export interface LoginCredentials {
  nisn: string;
  password: string;
}

export interface RegisterCredentials {
  nisn: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface TokenPayload {
  sub: string;
  email?: string;
  nisn: string;
  roles: string[];
  iat: number;
  exp: number;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type Role = 'admin' | 'user';