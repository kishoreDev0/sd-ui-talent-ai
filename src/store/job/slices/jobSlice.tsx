import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { JobState, Job, JobFilters } from '../types/jobTypes';
import {
  getAllJobsAsync,
  getJobByIdAsync,
  createJobAsync,
  updateJobAsync,
  deleteJobAsync,
  uploadJobsAsync,
  searchJobsAsync,
} from '../actions/jobActions';

const initialState: JobState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  filters: {},
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    clearCurrentJob: (state) => {
      state.currentJob = null;
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
      state.jobs = [];
      state.currentJob = null;
      state.loading = false;
      state.error = null;
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all jobs
      .addCase(getAllJobsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllJobsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload as Job[];
        state.error = null;
      })
      .addCase(getAllJobsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string })?.message || 'Failed to load jobs';
      })
      // Get job by ID
      .addCase(getJobByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJobByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload as Job;
        state.error = null;
      })
      .addCase(getJobByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string })?.message || 'Failed to fetch job';
      })
      // Create job
      .addCase(createJobAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJobAsync.fulfilled, (state, action) => {
        state.loading = false;
        const newJob = action.payload as Job;
        state.jobs.unshift(newJob);
        state.currentJob = newJob;
        state.error = null;
      })
      .addCase(createJobAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string })?.message || 'Failed to create job';
      })
      // Update job
      .addCase(updateJobAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedJob = action.payload as Job;
        const index = state.jobs.findIndex((j) => j.id === updatedJob.id);
        if (index !== -1) {
          state.jobs[index] = updatedJob;
        }
        if (state.currentJob?.id === updatedJob.id) {
          state.currentJob = updatedJob;
        }
        state.error = null;
      })
      .addCase(updateJobAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string })?.message || 'Failed to update job';
      })
      // Delete job
      .addCase(deleteJobAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJobAsync.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload as number;
        state.jobs = state.jobs.filter((j) => j.id !== deletedId);
        if (state.currentJob?.id === deletedId) {
          state.currentJob = null;
        }
        state.error = null;
      })
      .addCase(deleteJobAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string })?.message || 'Failed to delete job';
      })
      // Upload jobs
      .addCase(uploadJobsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadJobsAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Reload all jobs after upload
      })
      .addCase(uploadJobsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string })?.message || 'Failed to upload jobs';
      })
      // Search jobs
      .addCase(searchJobsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchJobsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload as Job[];
        state.error = null;
      })
      .addCase(searchJobsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.payload as { message?: string })?.message || 'Failed to search jobs';
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

