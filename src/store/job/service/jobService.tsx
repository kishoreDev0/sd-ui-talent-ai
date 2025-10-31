import axiosInstance from '@/axios-setup/axios-instance';
import { JOBS } from '@/store/endpoints';
import type {
  Job,
  ListJobsResponse,
  GetJobByIdResponse,
  CreateJobRequest,
  CreateJobResponse,
  UpdateJobRequest,
  UpdateJobResponse,
  DeleteJobResponse,
  UploadJobsResponse,
} from '../types/jobTypes';

/**
 * Get all jobs
 */
export const getAllJobs = async (): Promise<Job[]> => {
  try {
    const response = await axiosInstance.get<ListJobsResponse>(
      JOBS.LIST,
    );
    // Handle different response formats
    return (
      response.data.data ||
      response.data.jobs ||
      (response.data as unknown as Job[]) ||
      []
    );
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

/**
 * Get job by ID
 */
export const getJobById = async (id: number): Promise<Job> => {
  try {
    const response = await axiosInstance.get<GetJobByIdResponse>(
      JOBS.GET_BY_ID(id),
    );
    return (
      response.data.data ||
      response.data.job ||
      (response.data as unknown as Job)
    );
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
};

/**
 * Create a new job
 */
export const createJob = async (
  jobData: CreateJobRequest,
): Promise<CreateJobResponse> => {
  try {
    // Check if there are files to upload
    const hasFiles = jobData.attachments && jobData.attachments.length > 0;

    if (hasFiles) {
      // If there are attachments, use FormData
      const formData = new FormData();

      // Add all non-file fields
      Object.keys(jobData).forEach((key) => {
        if (key !== 'attachments') {
          const value = jobData[key];
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item) => formData.append(key, String(item)));
            } else if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        }
      });

      // Add attachment files
      if (jobData.attachments) {
        jobData.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await axiosInstance.post<CreateJobResponse>(
        JOBS.CREATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    } else {
      // No files, use JSON
      const response = await axiosInstance.post<CreateJobResponse>(
        JOBS.CREATE,
        jobData,
      );
      return response.data;
    }
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

/**
 * Update a job
 */
export const updateJob = async (
  jobData: UpdateJobRequest,
): Promise<UpdateJobResponse> => {
  try {
    const { id, ...updateData } = jobData;
    const hasFiles =
      updateData.attachments && updateData.attachments.length > 0;

    if (hasFiles) {
      // If there are attachments, use FormData
      const formData = new FormData();

      Object.keys(updateData).forEach((key) => {
        if (key !== 'attachments') {
          const value = updateData[key];
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item) => formData.append(key, String(item)));
            } else if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        }
      });

      if (updateData.attachments) {
        updateData.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await axiosInstance.patch<UpdateJobResponse>(
        JOBS.UPDATE(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    } else {
      const response = await axiosInstance.patch<UpdateJobResponse>(
        JOBS.UPDATE(id),
        updateData,
      );
      return response.data;
    }
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

/**
 * Delete a job
 */
export const deleteJob = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete<DeleteJobResponse>(JOBS.DELETE(id));
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

/**
 * Upload jobs from file (CSV/Excel)
 */
export const uploadJobs = async (file: File): Promise<UploadJobsResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<UploadJobsResponse>(
      JOBS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading jobs:', error);
    throw error;
  }
};

/**
 * Search/filter jobs
 */
export const searchJobs = async (
  filters: Record<string, unknown>,
): Promise<Job[]> => {
  try {
    const response = await axiosInstance.post<ListJobsResponse>(
      JOBS.SEARCH,
      filters,
    );
    return (
      response.data.data ||
      response.data.jobs ||
      (response.data as unknown as Job[]) ||
      []
    );
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
};
