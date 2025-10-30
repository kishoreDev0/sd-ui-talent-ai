// Import axios instance to get base URL dynamically
import axiosInstance from '@/axios-setup/axios-instance';

const API_BASE_URL = axiosInstance.defaults.baseURL || 'http://localhost:5010';

export const JOB_ENDPOINTS = {
  // List all jobs
  list: `${API_BASE_URL}/jobs`,
  // Get job by ID
  getById: (id: number) => `${API_BASE_URL}/jobs/${id}`,
  // Create new job
  create: `${API_BASE_URL}/jobs`,
  // Update job
  update: (id: number) => `${API_BASE_URL}/jobs/${id}`,
  // Delete job
  delete: (id: number) => `${API_BASE_URL}/jobs/${id}`,
  // Upload jobs from file
  upload: `${API_BASE_URL}/jobs/upload`,
  // Search/filter jobs
  search: `${API_BASE_URL}/jobs/search`,
};
