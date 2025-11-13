import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { JobCategory, JobCategoryState } from '../types/jobCategoryTypes';
import {
  createJobCategoryAsync,
  deleteJobCategoryAsync,
  fetchJobCategories,
  fetchJobCategoryById,
  updateJobCategoryAsync,
} from '../actions/jobCategoryActions';

const initialState: JobCategoryState = {
  items: [],
  isLoading: false,
  error: null,
  selectedCategory: null,
};

const jobCategorySlice = createSlice({
  name: 'jobCategory',
  initialState,
  reducers: {
    clearJobCategoryError(state) {
      state.error = null;
    },
    setSelectedJobCategory(state, action: PayloadAction<JobCategory | null>) {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchJobCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(fetchJobCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCategory = action.payload;
        const exists = state.items.some(
          (item) => item.id === action.payload.id,
        );
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchJobCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(createJobCategoryAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJobCategoryAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createJobCategoryAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(updateJobCategoryAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateJobCategoryAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
        if (
          state.selectedCategory &&
          state.selectedCategory.id === action.payload.id
        ) {
          state.selectedCategory = action.payload;
        }
      })
      .addCase(updateJobCategoryAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(deleteJobCategoryAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteJobCategoryAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (
          state.selectedCategory &&
          state.selectedCategory.id === action.payload
        ) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteJobCategoryAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      });
  },
});

export const { clearJobCategoryError, setSelectedJobCategory } =
  jobCategorySlice.actions;

export default jobCategorySlice.reducer;
