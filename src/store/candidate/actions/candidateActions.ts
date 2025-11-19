import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import * as candidateService from '../service/candidateService';
import type {
  CandidateCreateRequest,
  CandidateUpdateRequest,
  CandidateQueryParams,
} from '../types/candidateTypes';
import type { ParsedResumeData } from '../service/candidateService';

export const fetchCandidatesAsync = createAsyncThunk(
  'candidate/fetchAll',
  async (params: CandidateQueryParams | undefined, { rejectWithValue }) => {
    try {
      const payload = await candidateService.listCandidates(params ?? {});
      return payload;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to load candidates',
        );
      }
      return rejectWithValue('Failed to load candidates');
    }
  },
);

export const fetchCandidateByIdAsync = createAsyncThunk(
  'candidate/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await candidateService.getCandidateById(id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch candidate',
        );
      }
      return rejectWithValue('Failed to fetch candidate');
    }
  },
);

export const createCandidateAsync = createAsyncThunk(
  'candidate/create',
  async (payload: CandidateCreateRequest, { rejectWithValue }) => {
    try {
      return await candidateService.createCandidate(payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to create candidate',
        );
      }
      return rejectWithValue('Failed to create candidate');
    }
  },
);

export const updateCandidateAsync = createAsyncThunk(
  'candidate/update',
  async (
    payload: CandidateUpdateRequest & { id: number },
    { rejectWithValue },
  ) => {
    try {
      return await candidateService.updateCandidate(payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to update candidate',
        );
      }
      return rejectWithValue('Failed to update candidate');
    }
  },
);

export const deleteCandidateAsync = createAsyncThunk(
  'candidate/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await candidateService.deleteCandidate(id);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to delete candidate',
        );
      }
      return rejectWithValue('Failed to delete candidate');
    }
  },
);

export const parseResumeAsync = createAsyncThunk(
  'candidate/parseResume',
  async (file: File, { rejectWithValue }) => {
    try {
      return await candidateService.parseResume(file);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error?.[0] ||
          error.response?.data?.message ||
          error.response?.data?.detail ||
          'Failed to parse resume';
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('Failed to parse resume');
    }
  },
);
