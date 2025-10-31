/**
 * Centralized API Endpoints
 * All API endpoint paths should be declared here
 */

// Auth endpoints
export const AUTH = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  CHANGE_PASSWORD: '/api/v1/auth/change-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  REFRESH: '/api/v1/auth/refresh',
  INVITE_USER: '/api/v1/auth/invite',
} as const;

// Users endpoints
export const USERS = {
  LIST: '/api/v1/users',
  GET_BY_ID: (id: number) => `/api/v1/users/${id}`,
  CREATE: '/api/v1/users',
  UPDATE: (id: number) => `/api/v1/users/${id}`,
  DELETE: (id: number) => `/api/v1/users/${id}`,
} as const;

// Roles endpoints
export const ROLES = {
  LIST: '/api/v1/roles',
  LIST_WITH_PERMISSIONS: '/api/v1/roles/with-permissions',
  GET_BY_ID: (id: number) => `/api/v1/roles/${id}`,
  CREATE: '/api/v1/roles',
  UPDATE: (id: number) => `/api/v1/roles/${id}`,
  DELETE: (id: number) => `/api/v1/roles/${id}`,
} as const;

// Permissions endpoints
export const PERMISSIONS = {
  SYNC: '/api/v1/permissions/sync',
  LIST: '/api/v1/permissions',
  GET_BY_ID: (id: number) => `/api/v1/permissions/${id}`,
  CREATE: '/api/v1/permissions',
  UPDATE: (id: number) => `/api/v1/permissions/${id}`,
  DELETE: (id: number) => `/api/v1/permissions/${id}`,
} as const;

// Jobs endpoints (keeping structure from jobEndpoints.ts)
export const JOBS = {
  LIST: '/api/v1/jobs',
  GET_BY_ID: (id: number | string) => `/api/v1/jobs/${id}`,
  CREATE: '/api/v1/jobs',
  UPDATE: (id: number | string) => `/api/v1/jobs/${id}`,
  DELETE: (id: number | string) => `/api/v1/jobs/${id}`,
  UPLOAD: '/api/v1/jobs/upload',
  SEARCH: '/api/v1/jobs/search',
} as const;

// Candidates endpoints
export const CANDIDATES = {
  LIST: '/api/v1/candidates',
  GET_BY_ID: (id: number) => `/api/v1/candidates/${id}`,
  CREATE: '/api/v1/candidates',
  UPDATE: (id: number) => `/api/v1/candidates/${id}`,
  DELETE: (id: number) => `/api/v1/candidates/${id}`,
} as const;

// Interviews endpoints
export const INTERVIEWS = {
  LIST: '/api/v1/interviews',
  GET_BY_ID: (id: number) => `/api/v1/interviews/${id}`,
  CREATE: '/api/v1/interviews',
  UPDATE: (id: number) => `/api/v1/interviews/${id}`,
  DELETE: (id: number) => `/api/v1/interviews/${id}`,
} as const;
