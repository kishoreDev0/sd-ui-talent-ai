import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  createSkill,
  deleteSkill,
  getSkill,
  listSkills,
  updateSkill,
} from '../service/skillService';
import type {
  CreateSkillRequest,
  UpdateSkillRequest,
} from '../types/skillTypes';

export const fetchSkills = createAsyncThunk(
  'skill/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await listSkills();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch skills',
        );
      }
      return rejectWithValue('Failed to fetch skills');
    }
  },
);

export const fetchSkillById = createAsyncThunk(
  'skill/fetchById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      return await getSkill(id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch skill',
        );
      }
      return rejectWithValue('Failed to fetch skill');
    }
  },
);

export const createSkillAsync = createAsyncThunk(
  'skill/create',
  async (payload: CreateSkillRequest, { rejectWithValue }) => {
    try {
      return await createSkill(payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to create skill',
        );
      }
      return rejectWithValue('Failed to create skill');
    }
  },
);

export const updateSkillAsync = createAsyncThunk(
  'skill/update',
  async (payload: UpdateSkillRequest, { rejectWithValue }) => {
    try {
      return await updateSkill(payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to update skill',
        );
      }
      return rejectWithValue('Failed to update skill');
    }
  },
);

export const deleteSkillAsync = createAsyncThunk(
  'skill/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await deleteSkill(id);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to delete skill',
        );
      }
      return rejectWithValue('Failed to delete skill');
    }
  },
);


