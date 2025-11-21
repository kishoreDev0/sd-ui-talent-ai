# Axios Configuration Guide

## Overview

This application uses a centralized Axios instance configured with backend URL, authentication token management, and automatic request/response interceptors.

## Configuration Files

### 1. **Centralized Axios Instance** (`src/axios-setup/axios-instance.ts`)

- **Base URL**: Configured from environment variables (`VITE_API_URL` or `VITE_API_BASE_URL`)
- **Default Fallback**: `http://127.0.0.1.nip.io:5010` (only used if `.env` is not configured)
- **Timeout**: 30 seconds
- **Default Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer <token>` (added automatically)

### 2. **Request Interceptor**

- Automatically adds authentication token from localStorage (`access_token` or `token`)
- Token is attached as `Bearer` token in Authorization header

### 3. **Response Interceptor**

- **401 Handling**: Automatically attempts token refresh
  - Calls `/api/v1/auth/refresh` endpoint
  - Updates tokens in localStorage
  - Retries original request
- **Error Handling**: Handles 403, 404, 500, and network errors
- **Auto-Logout**: Redirects to login page on authentication failures

## Environment Variables

Create a `.env` file in the root directory (`sd-ui-talent-ai/.env`):

```env
# Backend API URL (uses nip.io to automatically resolve to localhost)
VITE_API_URL=http://127.0.0.1.nip.io:5010

# Alternative (will fallback to VITE_API_URL)
# VITE_API_BASE_URL=http://127.0.0.1.nip.io:5010
```

**Important**: After creating or modifying the `.env` file, restart your development server for changes to take effect.

**Example endpoints (nip.io hostname resolves automatically to 127.0.0.1):**

- Login: `http://127.0.0.1.nip.io:5010/api/v1/auth/login`
- Jobs: `http://127.0.0.1.nip.io:5010/jobs`
- Permissions: `http://127.0.0.1.nip.io:5010/api/permissions`

**Note**: All Vite environment variables must be prefixed with `VITE_`

## Usage

### Import the axios instance:

```typescript
import axiosInstance from '@/axios-setup/axios-instance';
```

### Making API Calls:

```typescript
// GET request
const response = await axiosInstance.get('/api/endpoint');

// POST request
const response = await axiosInstance.post('/api/endpoint', data);

// PUT request
const response = await axiosInstance.put('/api/endpoint', data);

// PATCH request
const response = await axiosInstance.patch('/api/endpoint', data);

// DELETE request
await axiosInstance.delete('/api/endpoint');

// With FormData (file uploads)
const formData = new FormData();
formData.append('file', file);
const response = await axiosInstance.post('/api/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

## Updated Services

All service files have been migrated to use the centralized axios instance:

1. ✅ **Resume Validation** (`src/store/service/resume/resumeValidation.tsx`)
2. ✅ **Job Service** (`src/store/job/service/jobService.tsx`)
3. ✅ **Permission Service** (`src/store/service/permission/permissionService.tsx`)
4. ✅ **Job Endpoints** (`src/store/job/endpoints/jobEndpoints.ts`)
5. ✅ **Authentication** (uses axios instance via `initializeHttpClient`)

## Backward Compatibility

The existing `initializeHttpClient()` function still works and returns the centralized axios instance:

```typescript
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';

const { httpClient } = initializeHttpClient();
// httpClient is the same axiosInstance
```

## Token Management

Tokens are automatically managed:

- **Storage**: Tokens stored in localStorage as `access_token` and `refresh_token`
- **Auto-attachment**: Bearer token automatically added to all requests
- **Refresh**: Automatic token refresh on 401 errors
- **Cleanup**: Tokens cleared on logout or authentication failure

## Base URL Configuration

The base URL is configured in priority order:

1. `import.meta.env.VITE_API_URL` (primary) - **Set this in `.env` file**
2. `import.meta.env.VITE_API_BASE_URL` (fallback)
3. `http://127.0.0.1.nip.io:5010` (default, only if `.env` not configured)

**Current Configuration**: `http://127.0.0.1.nip.io:5010` (set in `.env`)

All API endpoints are relative to the base URL:

- ❌ **Don't**: `await axios.get('http://localhost:5010/api/endpoint')`
- ✅ **Do**: `await axiosInstance.get('/api/endpoint')`

## Error Handling

The interceptor handles common errors:

- **401 Unauthorized**: Attempts token refresh, redirects to login if fails
- **403 Forbidden**: Logs error message
- **404 Not Found**: Logs error message
- **500 Server Error**: Logs error message
- **Network Errors**: Logs connection error

All errors are rejected with the error object for component-level handling.
