import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { JobState, Job, JobFilters } from '../types/jobTypes';
import {
  fetchJobsAsync,
  fetchJobByIdAsync,
  createJobAsync,
  updateJobAsync,
  deleteJobAsync,
} from '../actions/jobActions';

const initialState: JobState = {
  items: [],
  current: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 10,
  filters: {},
  categories: [],
  jobTypes: [],
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    clearCurrentJob: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<JobFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    resetJobState: (state) => {
      state.items = [];
      state.current = null;
      state.isLoading = false;
      state.error = null;
      state.filters = {};
      state.total = 0;
      state.page = 1;
      state.pageSize = 10;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all jobs
      .addCase(fetchJobsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.items = payload.result;
        state.total = payload.total;
        state.page = payload.page;
        state.pageSize = payload.page_size;
        state.categories = payload.categories ?? [];
        state.jobTypes = payload.job_types ?? [];
        state.error = null;
      })
      .addCase(fetchJobsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to load jobs';
      })
      // Get job by ID
      .addCase(fetchJobByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.current = action.payload as Job;
      })
      .addCase(fetchJobByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch job';
      })
      // Create job
      .addCase(createJobAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJobAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const newJob = action.payload as Job;
        state.items = [newJob, ...state.items];
        state.current = newJob;
        state.error = null;
      })
      .addCase(createJobAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to create job';
      })
      // Update job
      .addCase(updateJobAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateJobAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedJob = action.payload as Job;
        const index = state.items.findIndex((j) => j.id === updatedJob.id);
        if (index !== -1) {
          state.items[index] = updatedJob;
        }
        if (state.current?.id === updatedJob.id) {
          state.current = updatedJob;
        }
        state.error = null;
      })
      .addCase(updateJobAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to update job';
      })
      // Delete job
      .addCase(deleteJobAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteJobAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload as number;
        state.items = state.items.filter((j) => j.id !== deletedId);
        if (state.current?.id === deletedId) {
          state.current = null;
        }
        state.error = null;
      })
      .addCase(deleteJobAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to delete job';
      });
  },
});

export const {
  clearCurrentJob,
  clearError,
  setFilters,
  clearFilters,
  resetJobState,
} = jobSlice.actions;

export default jobSlice.reducer;
