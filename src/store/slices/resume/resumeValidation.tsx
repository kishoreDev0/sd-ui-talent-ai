import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  ResumeAnalysisResponse,
  SavedAnalysis,
  ShortlistedResume,
  JobRequirement,
} from '@/types';
import * as resumeService from '@/store/service/resume/resumeValidation';

interface ResumeValidationState {
  analysisResult: ResumeAnalysisResponse | null;
  jobRequirements: JobRequirement[];
  savedAnalyses: SavedAnalysis[];
  shortlistedResumes: ShortlistedResume[];
  loading: boolean;
  error: string | null;
}

const initialState: ResumeValidationState = {
  analysisResult: null,
  jobRequirements: [],
  savedAnalyses: [],
  shortlistedResumes: [],
  loading: false,
  error: null,
};

export const analyzeResumeAsync = createAsyncThunk(
  'resume/analyze',
  async (formData: FormData) => {
    return await resumeService.analyzeResume(formData);
  },
);

export const getJobRequirementsAsync = createAsyncThunk(
  'resume/getJobRequirements',
  async () => {
    return await resumeService.getJobRequirements();
  },
);

export const saveAnalysisAsync = createAsyncThunk(
  'resume/saveAnalysis',
  async (data: unknown) => {
    return await resumeService.saveAnalysis(data);
  },
);

export const listSavedAnalysesAsync = createAsyncThunk(
  'resume/listSavedAnalyses',
  async () => {
    return await resumeService.listSavedAnalyses();
  },
);

export const deleteSavedAnalysisAsync = createAsyncThunk(
  'resume/deleteSavedAnalysis',
  async (analysisId: number) => {
    await resumeService.deleteSavedAnalysis(analysisId);
    return analysisId;
  },
);

export const shortlistResumeAsync = createAsyncThunk(
  'resume/shortlist',
  async (formData: FormData) => {
    return await resumeService.shortlistResume(formData);
  },
);

export const listShortlistedResumesAsync = createAsyncThunk(
  'resume/listShortlisted',
  async () => {
    return await resumeService.listShortlistedResumes();
  },
);

export const deleteShortlistedResumeAsync = createAsyncThunk(
  'resume/deleteShortlisted',
  async (resumeId: number) => {
    await resumeService.deleteShortlistedResume(resumeId);
    return resumeId;
  },
);

const resumeValidationSlice = createSlice({
  name: 'resumeValidation',
  initialState,
  reducers: {
    clearAnalysisResult: (state) => {
      state.analysisResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Analyze resume
      .addCase(analyzeResumeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeResumeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.analysisResult = action.payload;
      })
      .addCase(analyzeResumeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to analyze resume';
      })
      // Get job requirements
      .addCase(getJobRequirementsAsync.fulfilled, (state, action) => {
        state.jobRequirements = action.payload;
      })
      // Save analysis
      .addCase(saveAnalysisAsync.fulfilled, () => {
        // Reload saved analyses
        // This will be handled by listSavedAnalysesAsync
      })
      // List saved analyses
      .addCase(listSavedAnalysesAsync.fulfilled, (state, action) => {
        state.savedAnalyses = action.payload;
      })
      // Delete saved analysis
      .addCase(deleteSavedAnalysisAsync.fulfilled, (state, action) => {
        state.savedAnalyses = state.savedAnalyses.filter(
          (a) => a.id !== action.payload,
        );
      })
      // Shortlist resume
      .addCase(shortlistResumeAsync.fulfilled, () => {
        // Reload shortlisted resumes
        // This will be handled by listShortlistedResumesAsync
      })
      // List shortlisted resumes
      .addCase(listShortlistedResumesAsync.fulfilled, (state, action) => {
        state.shortlistedResumes = action.payload;
      })
      // Delete shortlisted resume
      .addCase(deleteShortlistedResumeAsync.fulfilled, (state, action) => {
        state.shortlistedResumes = state.shortlistedResumes.filter(
          (r) => r.id !== action.payload,
        );
      });
  },
});

export const { clearAnalysisResult } = resumeValidationSlice.actions;
export default resumeValidationSlice.reducer;
