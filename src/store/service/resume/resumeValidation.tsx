import {
  ResumeAnalysisResponse,
  SavedAnalysis,
  ShortlistedResume,
  JobRequirement,
} from '@/types';
import axiosInstance from '@/axios-setup/axios-instance';

export const analyzeResume = async (
  formData: FormData,
): Promise<ResumeAnalysisResponse> => {
  const response = await axiosInstance.post('/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getJobRequirements = async (): Promise<JobRequirement[]> => {
  const response = await axiosInstance.get('/job-requirements');
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
  const response = await axiosInstance.post('/save_analysis', data);
  return response.data;
};

export const listSavedAnalyses = async (): Promise<SavedAnalysis[]> => {
  const response = await axiosInstance.get('/list_saved_analyses');
  return response.data;
};

export const getSavedAnalysis = async (
  analysisId: number,
): Promise<SavedAnalysis> => {
  const response = await axiosInstance.get(`/get_saved_analysis/${analysisId}`);
  return response.data;
};

export const deleteSavedAnalysis = async (
  analysisId: number,
): Promise<void> => {
  await axiosInstance.delete(`/delete_saved_analysis/${analysisId}`);
};

export const shortlistResume = async (
  formData: FormData,
): Promise<{ status: string; id?: number }> => {
  const response = await axiosInstance.post('/shortlist_resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const listShortlistedResumes = async (): Promise<
  ShortlistedResume[]
> => {
  const response = await axiosInstance.get('/list_shortlisted');
  return response.data;
};

export const deleteShortlistedResume = async (
  resumeId: number,
): Promise<void> => {
  await axiosInstance.delete(`/delete_shortlisted/${resumeId}`);
};

export const downloadShortlistedResume = (resumeId: number): string => {
  const baseURL = axiosInstance.defaults.baseURL || '';
  return `${baseURL}/shortlist/${resumeId}`;
};
