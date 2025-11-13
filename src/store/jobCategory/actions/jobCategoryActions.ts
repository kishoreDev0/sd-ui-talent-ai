import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  createJobCategory,
  deleteJobCategory,
  getJobCategory,
  listJobCategories,
  updateJobCategory,
} from '../service/jobCategoryService';
import type {
  CreateJobCategoryRequest,
  UpdateJobCategoryRequest,
} from '../types/jobCategoryTypes';

export const fetchJobCategories = createAsyncThunk(
  'jobCategory/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await listJobCategories();
      return categories;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch job categories',
        );
      }
      return rejectWithValue('Failed to fetch job categories');
    }
  },
);

export const fetchJobCategoryById = createAsyncThunk(
  'jobCategory/fetchById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const category = await getJobCategory(id);
      return category;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch job category',
        );
      }
      return rejectWithValue('Failed to fetch job category');
    }
  },
);

export const createJobCategoryAsync = createAsyncThunk(
  'jobCategory/create',
  async (payload: CreateJobCategoryRequest, { rejectWithValue }) => {
    try {
      const category = await createJobCategory(payload);
      return category;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to create job category',
        );
      }
      return rejectWithValue('Failed to create job category');
    }
  },
);

export const updateJobCategoryAsync = createAsyncThunk(
  'jobCategory/update',
  async (payload: UpdateJobCategoryRequest, { rejectWithValue }) => {
    try {
      const category = await updateJobCategory(payload);
      return category;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to update job category',
        );
      }
      return rejectWithValue('Failed to update job category');
    }
  },
);

export const deleteJobCategoryAsync = createAsyncThunk(
  'jobCategory/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await deleteJobCategory(id);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to delete job category',
        );
      }
      return rejectWithValue('Failed to delete job category');
    }
  },
);
