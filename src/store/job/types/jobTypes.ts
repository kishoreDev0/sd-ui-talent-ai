export interface JobMajorSkill {
  id: number;
  name: string;
}

export interface JobSkill {
  id: number;
  name: string;
  major_skill_id: number;
}

export interface Job {
  id: number;
  job_title: string;
  organization: string;
  job_category: string;
  employment_type?: string | null;
  priority?: string | null;
  level?: string | null;
  experience_years: number;
  currency?: string | null;
  compensation_from?: number | null;
  compensation_to?: number | null;
  no_of_vacancy: number;
  job_description: string;
  job_responsibilities?: string | null;
  major_skills: JobMajorSkill[];
  skills: JobSkill[];
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface JobFilters {
  search?: string;
  organization?: string;
  job_category?: string;
  level?: string;
  employment_type?: string;
  page?: number;
  page_size?: number;
}

export interface JobCategoryBucket {
  name: string;
  count: number;
}

export interface JobTypeBucket {
  name: string;
  count: number;
}

export interface JobState {
  items: Job[];
  current: Job | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  filters: JobFilters;
  categories: JobCategoryBucket[];
  jobTypes: JobTypeBucket[];
}

export interface CreateJobRequest {
  job_title: string;
  organization: string;
  job_category: string;
  employment_type?: string | null;
  priority?: string | null;
  level?: string | null;
  experience_years: number;
  currency?: string | null;
  compensation_from?: number | null;
  compensation_to?: number | null;
  no_of_vacancy: number;
  major_skills: string[];
  skills: string[];
  job_description: string;
  job_responsibilities?: string | null;
}

export interface UpdateJobRequest extends CreateJobRequest {
  id: number;
}

export interface JobListPayload {
  result: Job[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  categories: JobCategoryBucket[];
  job_types: JobTypeBucket[];
}

export interface CommonJobResponse<T> {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: string | null;
  data: T;
}

export type ListJobsResponse = CommonJobResponse<JobListPayload>;
export type JobItemResponse = CommonJobResponse<{ result: Job }>;
export interface JobBulkUploadSummary {
  processed: number;
  created: number;
  failed: number;
  failures: Array<{ row: number; error: string }>;
}
export type JobBulkUploadResponse = CommonJobResponse<{
  result: JobBulkUploadSummary;
}>;
