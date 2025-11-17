import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  CandidateState,
  Candidate,
  CandidateFilters,
} from '../types/candidateTypes';
import {
  fetchCandidatesAsync,
  fetchCandidateByIdAsync,
  createCandidateAsync,
  updateCandidateAsync,
  deleteCandidateAsync,
} from '../actions/candidateActions';

const initialState: CandidateState = {
  items: [],
  current: null,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  filters: {},
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    clearCurrentCandidate: (state) => {
      state.current = null;
    },
    clearCandidateError: (state) => {
      state.error = null;
    },
    setCandidateFilters: (state, action: PayloadAction<CandidateFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetCandidateState: (state) => {
      state.items = [];
      state.current = null;
      state.isLoading = false;
      state.error = null;
      state.page = 1;
      state.pageSize = 10;
      state.total = 0;
      state.totalPages = 0;
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidatesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCandidatesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.items = payload.result;
        state.total = payload.total;
        state.page = payload.page;
        state.pageSize = payload.page_size;
        state.totalPages = payload.total_pages;
        state.error = null;
      })
      .addCase(fetchCandidatesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to load candidates';
      })
      .addCase(fetchCandidateByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCandidateByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.current = action.payload as Candidate;
      })
      .addCase(fetchCandidateByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch candidate';
      })
      .addCase(createCandidateAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCandidateAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const candidate = action.payload as Candidate;
        state.items = [candidate, ...state.items];
        state.total += 1;
        state.current = candidate;
      })
      .addCase(createCandidateAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to create candidate';
      })
      .addCase(updateCandidateAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCandidateAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCandidate = action.payload as Candidate;
        const index = state.items.findIndex(
          (c) => c.id === updatedCandidate.id,
        );
        if (index !== -1) {
          state.items[index] = updatedCandidate;
        }
        if (state.current?.id === updatedCandidate.id) {
          state.current = updatedCandidate;
        }
      })
      .addCase(updateCandidateAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to update candidate';
      })
      .addCase(deleteCandidateAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCandidateAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload as number;
        state.items = state.items.filter(
          (candidate) => candidate.id !== deletedId,
        );
        if (state.current?.id === deletedId) {
          state.current = null;
        }
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteCandidateAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to delete candidate';
      });
  },
});

export const {
  clearCandidateError,
  clearCurrentCandidate,
  setCandidateFilters,
  resetCandidateState,
} = candidateSlice.actions;

export default candidateSlice.reducer;
