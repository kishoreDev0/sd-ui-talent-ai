import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import * as jobService from '../service/jobService';
import type {
  CreateJobRequest,
  UpdateJobRequest,
  JobFilters,
} from '../types/jobTypes';

/**
 * Fetch all jobs with optional filters
 */
export const fetchJobsAsync = createAsyncThunk(
  'job/fetchAll',
  async (filters: JobFilters | undefined, { rejectWithValue }) => {
    try {
      const payload = await jobService.getAllJobs(filters ?? {});
      return payload;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to load jobs',
        );
      }
      return rejectWithValue('Failed to load jobs');
    }
  },
);

/**
 * Fetch job by ID
 */
export const fetchJobByIdAsync = createAsyncThunk(
  'job/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await jobService.getJobById(id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch job',
        );
      }
      return rejectWithValue('Failed to fetch job');
    }
  },
);

/**
 * Create a new job
 */
export const createJobAsync = createAsyncThunk(
  'job/create',
  async (payload: CreateJobRequest, { rejectWithValue }) => {
    try {
      return await jobService.createJob(payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to create job',
        );
      }
      return rejectWithValue('Failed to create job');
    }
  },
);

/**
 * Update an existing job
 */
export const updateJobAsync = createAsyncThunk(
  'job/update',
  async (payload: UpdateJobRequest, { rejectWithValue }) => {
    try {
      return await jobService.updateJob(payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to update job',
        );
      }
      return rejectWithValue('Failed to update job');
    }
  },
);

/**
 * Delete a job
 */
export const deleteJobAsync = createAsyncThunk(
  'job/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await jobService.deleteJob(id);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to delete job',
        );
      }
      return rejectWithValue('Failed to delete job');
    }
  },
);
