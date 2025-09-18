export const AUTH_CONSTANTS = {
  JWT: {
    ACCESS_TOKEN_EXPIRES_IN: '15m',
    ALGORITHM: 'HS256',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
} as const;

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;