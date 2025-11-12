/**
 * Centralized Axios Instance Configuration
 * Handles token management, base URL, and request/response interceptors
 */

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';

/**
 * Create axios instance with default configuration
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds authentication token to requests
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token =
      localStorage.getItem('access_token') || localStorage.getItem('token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handles token refresh, error responses, and common error scenarios
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired or invalid
    // const originalRequest = error.config as InternalAxiosRequestConfig & {
    //   _retry?: boolean;
    // };
    // if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
    //   originalRequest._retry = true;

    //   try {
    //     // Attempt to refresh token
    //     const refreshToken = localStorage.getItem('refresh_token');

    //     if (refreshToken) {
    //       // Call refresh token endpoint
    //       const response = await axios.post(
    //         `${API_BASE_URL}/api/v1/auth/refresh`,
    //         {
    //           refresh_token: refreshToken,
    //         },
    //       );

    //       const { access_token, refresh_token: newRefreshToken } =
    //         response.data.data || response.data;

    //       // Update tokens in localStorage
    //       localStorage.setItem('access_token', access_token);
    //       if (newRefreshToken) {
    //         localStorage.setItem('refresh_token', newRefreshToken);
    //       }

    //       // Update authorization header and retry original request
    //       if (originalRequest.headers) {
    //         originalRequest.headers.Authorization = `Bearer ${access_token}`;
    //       }

    //       return axiosInstance(originalRequest);
    //     } else {
    //       // No refresh token available, redirect to login
    //       localStorage.removeItem('access_token');
    //       localStorage.removeItem('refresh_token');
    //       localStorage.removeItem('user');
    //       localStorage.removeItem('isAuthenticated');
    //       window.location.href = '/login';
    //       return Promise.reject(error);
    //     }
    //   } catch (refreshError) {
    //     // Refresh failed, logout user
    //     localStorage.removeItem('access_token');
    //     localStorage.removeItem('refresh_token');
    //     localStorage.removeItem('user');
    //     localStorage.removeItem('isAuthenticated');
    //     window.location.href = '/login';
    //     return Promise.reject(refreshError);
    //   }
    // }

    // Handle other error status codes
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 403:
          console.error(
            'Forbidden: You do not have permission to access this resource',
          );
          break;
        case 404:
          console.error('Not Found: The requested resource was not found');
          break;
        case 500:
          console.error('Server Error: An internal server error occurred');
          break;
        default:
          console.error(`Error ${status}:`, data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: Unable to reach the server');
    } else {
      // Error in setting up the request
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
