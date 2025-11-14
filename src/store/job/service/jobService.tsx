import axiosInstance from '@/axios-setup/axios-instance';
import { JOBS } from '@/store/endpoints';
import type {
  Job,
  JobItemResponse,
  ListJobsResponse,
  CreateJobRequest,
  UpdateJobRequest,
  JobListPayload,
  JobFilters,
  JobCategoryBucket,
  JobTypeBucket,
  JobBulkUploadResponse,
  JobBulkUploadSummary,
} from '../types/jobTypes';

const toJobListPayload = (response: ListJobsResponse): JobListPayload => {
  const payload = response?.data ?? {
    result: [],
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    categories: [],
    job_types: [],
  };
  return {
    ...payload,
    categories: payload.categories ?? [],
    job_types: payload.job_types ?? [],
  };
};

const unwrapJob = (response: JobItemResponse): Job =>
  response?.data?.result as Job;

export const getAllJobs = async (
  filters: JobFilters = {},
): Promise<JobListPayload> => {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 10,
  };

  if (filters.search) params.search = filters.search;
  if (filters.organization) params.organization = filters.organization;
  if (filters.job_category) params.job_category = filters.job_category;
  if (filters.level) params.level = filters.level;
  if (filters.employment_type) params.employment_type = filters.employment_type;

  const response = await axiosInstance.get<ListJobsResponse>(JOBS.LIST, {
    params,
  });
  return toJobListPayload(response.data);
};

export const getJobById = async (id: number): Promise<Job> => {
  const response = await axiosInstance.get<JobItemResponse>(JOBS.GET_BY_ID(id));
  return unwrapJob(response.data);
};

export const createJob = async (payload: CreateJobRequest): Promise<Job> => {
  const response = await axiosInstance.post<JobItemResponse>(
    JOBS.CREATE,
    payload,
  );
  return unwrapJob(response.data);
};

export const updateJob = async (payload: UpdateJobRequest): Promise<Job> => {
  const { id, ...body } = payload;
  const response = await axiosInstance.patch<JobItemResponse>(
    JOBS.UPDATE(id),
    body,
  );
  return unwrapJob(response.data);
};

export const deleteJob = async (id: number): Promise<void> => {
  await axiosInstance.delete(JOBS.DELETE(id));
};

export const bulkUploadJobs = async (
  file: File,
): Promise<JobBulkUploadSummary> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post<JobBulkUploadResponse>(
    JOBS.BULK_UPLOAD,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return (
    response.data?.data?.result ?? {
      processed: 0,
      created: 0,
      failed: 0,
      failures: [],
    }
  );
};
