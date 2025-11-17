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
  INVITE_USER: '/api/v1/user/invite',
} as const;

// Users endpoints
export const USERS = {
  LIST: '/api/v1/users',
  GET_BY_ID: (id: number) => `/api/v1/user/${id}`,
  CREATE: '/api/v1/users',
  UPDATE: (id: number) => `/api/v1/user/${id}`,
  DELETE: (id: number) => `/api/v1/users/${id}`,
  UPDATE_PROFILE: '/api/v1/user/profile',
  UPDATE_ONBOARDING: (id: number) => `/api/v1/users/${id}/onboarding`,
} as const;

// Roles endpoints
export const ROLES = {
  LIST: '/api/v1/roles',
  LIST_WITH_PERMISSIONS: '/api/v1/roles/with-permissions',
  GET_BY_ID: (id: number) => `/api/v1/roles/${id}`,
  CREATE: '/api/v1/roles',
  UPDATE: (id: number) => `/api/v1/roles/${id}`,
  DELETE: (id: number) => `/api/v1/roles/${id}`,
  UPDATE_PERMISSIONS: (id: number) => `/api/v1/roles/${id}/permissions`,
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
  GET_BY_ID: (id: number | string) => `/api/v1/job/${id}`,
  CREATE: '/api/v1/job',
  UPDATE: (id: number | string) => `/api/v1/job/${id}`,
  DELETE: (id: number | string) => `/api/v1/job/${id}`,
  BULK_UPLOAD: '/api/v1/jobs/bulk-upload',
} as const;

// Job categories endpoints
export const JOB_CATEGORIES = {
  LIST: '/api/v1/job-categories',
  GET_BY_ID: (id: number | string) => `/api/v1/job-category/${id}`,
  CREATE: '/api/v1/job-category',
  UPDATE: (id: number | string) => `/api/v1/job-category/${id}`,
  DELETE: (id: number | string) => `/api/v1/job-category/${id}`,
} as const;

// Major skills endpoints
export const MAJOR_SKILLS = {
  LIST: '/api/v1/major-skills',
  GET_BY_ID: (id: number | string) => `/api/v1/major-skill/${id}`,
  CREATE: '/api/v1/major-skill',
  UPDATE: (id: number | string) => `/api/v1/major-skill/${id}`,
  DELETE: (id: number | string) => `/api/v1/major-skill/${id}`,
} as const;

// Skills endpoints
export const SKILLS = {
  LIST: '/api/v1/skills',
  GET_BY_ID: (id: number | string) => `/api/v1/skill/${id}`,
  CREATE: '/api/v1/skill',
  UPDATE: (id: number | string) => `/api/v1/skill/${id}`,
  DELETE: (id: number | string) => `/api/v1/skill/${id}`,
} as const;

// Candidates endpoints
export const CANDIDATES = {
  LIST: '/api/v1/candidates',
  GET_BY_ID: (id: number | string) => `/api/v1/candidate/${id}`,
  CREATE: '/api/v1/candidate',
  UPDATE: (id: number | string) => `/api/v1/candidate/${id}`,
  DELETE: (id: number | string) => `/api/v1/candidate/${id}`,
  PARSE_RESUME: '/api/v1/candidate/parse-resume',
  MATCH_RESUME: (jobId: number) =>
    `/api/v1/candidate/match-resume?job_id=${jobId}`,
} as const;

// Interviews endpoints
export const INTERVIEWS = {
  LIST: '/api/v1/interviews',
  GET_BY_ID: (id: number) => `/api/v1/interviews/${id}`,
  CREATE: '/api/v1/interviews',
  UPDATE: (id: number) => `/api/v1/interviews/${id}`,
  DELETE: (id: number) => `/api/v1/interviews/${id}`,
} as const;

// Organizations endpoints
export const ORGANIZATIONS = {
  LIST: '/api/v1/organizations',
  GET_BY_ID: (id: number) => `/api/v1/organization/${id}`,
  CREATE: '/api/v1/organization',
  UPDATE: (id: number) => `/api/v1/organization/${id}`,
  DELETE: (id: number) => `/api/v1/organization/${id}`,
  GET_USERS: (id: number) => `/api/v1/organizations/${id}/users`,
  ASSIGN_USERS: (id: number) => `/api/v1/organizations/${id}/users`,
} as const;
