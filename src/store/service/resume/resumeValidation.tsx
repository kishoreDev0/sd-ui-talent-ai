import {
  ResumeAnalysisResponse,
  SavedAnalysis,
  ShortlistedResume,
  JobRequirement,
} from '@/types';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';

export const analyzeResume = async (
  formData: FormData,
): Promise<ResumeAnalysisResponse> => {
  const response = await axios.post(`${API_BASE_URL}/process`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getJobRequirements = async (): Promise<JobRequirement[]> => {
  const response = await axios.get(`${API_BASE_URL}/job-requirements`);
  return response.data.files || [];
};

export const saveAnalysis = async (data: {
  resumeHTML?: string;
  audioHTML?: string;
  metaInfo?: string;
  technology?: string;
  audioFileName?: string;
  timestamp: string;
  rawData?: {
    resume?: unknown;
    technical?: unknown;
  };
}): Promise<{ status: string; id?: number; filename?: string }> => {
  const response = await axios.post(`${API_BASE_URL}/save_analysis`, data);
  return response.data;
};

export const listSavedAnalyses = async (): Promise<SavedAnalysis[]> => {
  const response = await axios.get(`${API_BASE_URL}/list_saved_analyses`);
  return response.data;
};

export const getSavedAnalysis = async (
  analysisId: number,
): Promise<SavedAnalysis> => {
  const response = await axios.get(
    `${API_BASE_URL}/get_saved_analysis/${analysisId}`,
  );
  return response.data;
};

export const deleteSavedAnalysis = async (
  analysisId: number,
): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/delete_saved_analysis/${analysisId}`);
};

export const shortlistResume = async (
  formData: FormData,
): Promise<{ status: string; id?: number }> => {
  const response = await axios.post(
    `${API_BASE_URL}/shortlist_resume`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

export const listShortlistedResumes = async (): Promise<
  ShortlistedResume[]
> => {
  const response = await axios.get(`${API_BASE_URL}/list_shortlisted`);
  return response.data;
};

export const deleteShortlistedResume = async (
  resumeId: number,
): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/delete_shortlisted/${resumeId}`);
};

export const downloadShortlistedResume = (resumeId: number): string => {
  return `${API_BASE_URL}/shortlist/${resumeId}`;
};
