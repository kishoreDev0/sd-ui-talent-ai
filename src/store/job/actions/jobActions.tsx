import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import * as jobService from '../service/jobService';
import type {
  CreateJobRequest,
  UpdateJobRequest,
  JobFilters,
} from '../types/jobTypes';

/**
 * Fetch all jobs
 */
export const getAllJobsAsync = createAsyncThunk(
  'job/getAllJobs',
  async (_, { rejectWithValue }) => {
    try {
      const jobs = await jobService.getAllJobs();
      return jobs;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          message: error.response?.data?.message || 'Failed to load jobs',
          status: error.response?.status,
          error: error.response?.data,
        });
      }
      return rejectWithValue('Failed to load jobs');
    }
  }
);

/**
 * Fetch job by ID
 */
export const getJobByIdAsync = createAsyncThunk(
  'job/getJobById',
  async (id: number, { rejectWithValue }) => {
    try {
      const job = await jobService.getJobById(id);
      return job;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          message: error.response?.data?.message || 'Failed to fetch job',
          status: error.response?.status,
          error: error.response?.data,
        });
      }
      return rejectWithValue('Failed to fetch job');
    }
  }
);

/**
 * Create a new job
 */
export const createJobAsync = createAsyncThunk(
  'job/createJob',
  async (jobData: CreateJobRequest, { rejectWithValue }) => {
    try {
      const response = await jobService.createJob(jobData);
      return response.data || response.job || response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          message: error.response?.data?.message || 'Failed to create job',
          status: error.response?.status,
          error: error.response?.data,
        });
      }
      return rejectWithValue('Failed to create job');
    }
  }
);

/**
 * Update an existing job
 */
export const updateJobAsync = createAsyncThunk(
  'job/updateJob',
  async (jobData: UpdateJobRequest, { rejectWithValue }) => {
    try {
      const response = await jobService.updateJob(jobData);
      return response.data || response.job || response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          message: error.response?.data?.message || 'Failed to update job',
          status: error.response?.status,
          error: error.response?.data,
        });
      }
      return rejectWithValue('Failed to update job');
    }
  }
);

/**
 * Delete a job
 */
export const deleteJobAsync = createAsyncThunk(
  'job/deleteJob',
  async (id: number, { rejectWithValue }) => {
    try {
      await jobService.deleteJob(id);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          message: error.response?.data?.message || 'Failed to delete job',
          status: error.response?.status,
          error: error.response?.data,
        });
      }
      return rejectWithValue('Failed to delete job');
    }
  }
);

/**
 * Upload jobs from file
 */
export const uploadJobsAsync = createAsyncThunk(
  'job/uploadJobs',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await jobService.uploadJobs(file);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          message: error.response?.data?.message || 'Failed to upload jobs',
          status: error.response?.status,
          error: error.response?.data,
        });
      }
      return rejectWithValue('Failed to upload jobs');
    }
  }
);

/**
 * Search/filter jobs
 */
export const searchJobsAsync = createAsyncThunk(
  'job/searchJobs',
  async (filters: JobFilters, { rejectWithValue }) => {
    try {
      const jobs = await jobService.searchJobs(filters);
      return jobs;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          message: error.response?.data?.message || 'Failed to search jobs',
          status: error.response?.status,
          error: error.response?.data,
        });
      }
      return rejectWithValue('Failed to search jobs');
    }
  }
);

