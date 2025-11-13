import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  createMajorSkill,
  deleteMajorSkill,
  getMajorSkill,
  listMajorSkills,
  updateMajorSkill,
} from '../service/majorSkillService';
import type {
  CreateMajorSkillRequest,
  UpdateMajorSkillRequest,
} from '../types/majorSkillTypes';

export const fetchMajorSkills = createAsyncThunk(
  'majorSkill/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await listMajorSkills();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch major skills',
        );
      }
      return rejectWithValue('Failed to fetch major skills');
    }
  },
);

export const fetchMajorSkillById = createAsyncThunk(
  'majorSkill/fetchById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      return await getMajorSkill(id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch major skill',
        );
      }
      return rejectWithValue('Failed to fetch major skill');
    }
  },
);

export const createMajorSkillAsync = createAsyncThunk(
  'majorSkill/create',
  async (payload: CreateMajorSkillRequest, { rejectWithValue }) => {
    try {
      return await createMajorSkill(payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to create major skill',
        );
      }
      return rejectWithValue('Failed to create major skill');
    }
  },
);

export const updateMajorSkillAsync = createAsyncThunk(
  'majorSkill/update',
  async (payload: UpdateMajorSkillRequest, { rejectWithValue }) => {
    try {
      return await updateMajorSkill(payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to update major skill',
        );
      }
      return rejectWithValue('Failed to update major skill');
    }
  },
);

export const deleteMajorSkillAsync = createAsyncThunk(
  'majorSkill/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await deleteMajorSkill(id);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to delete major skill',
        );
      }
      return rejectWithValue('Failed to delete major skill');
    }
  },
);
