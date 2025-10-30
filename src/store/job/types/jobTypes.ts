export interface Job {
  id: number;
  company: string;
  companyIcon?: string;
  title: string;
  paymentVerified?: boolean;
  location: string;
  applicants?: number;
  description: string;
  tags?: string[];
  hourlyRate?: string;
  proposals?: number;
  priority?: 'high' | 'medium' | 'low';
  creator?: string;
  organization?: string;
  majorSkills?: string[];
  skills?: string[];
  jobCategory?: string;
  employmentType?: string;
  experience?: string;
  minCompensation?: string;
  maxCompensation?: string;
  currency?: string;
  noticePeriod?: string;
  source?: string;
  attachments?: Array<{ name: string; url: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobState {
  jobs: Job[];
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
  filters: JobFilters;
}

export interface JobFilters {
  searchTerm?: string;
  location?: string;
  jobTitle?: string;
  majorSkills?: string;
  minCompensation?: string;
  maxCompensation?: string;
  organization?: string;
  priority?: ('high' | 'medium' | 'low')[];
  creator?: string;
  jobCategory?: string;
  employmentType?: string;
  experience?: string;
}

export interface CreateJobRequest {
  title: string;
  company: string;
  description: string;
  location: string;
  majorSkills?: string[];
  skills?: string[];
  jobCategory?: string;
  organization?: string;
  priority?: 'high' | 'medium' | 'low';
  employmentType?: string;
  experience?: string;
  minCompensation?: string;
  maxCompensation?: string;
  currency?: string;
  noticePeriod?: string;
  responsibilities?: string;
  qualifications?: string;
  attachments?: File[];
  [key: string]: unknown;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  id: number;
}

export interface ListJobsResponse {
  status: string;
  message?: string;
  data?: Job[];
  jobs?: Job[];
}

export interface GetJobByIdResponse {
  status: string;
  message?: string;
  data?: Job;
  job?: Job;
}

export interface CreateJobResponse {
  status: string;
  message?: string;
  data?: Job;
  job?: Job;
  id?: number;
}

export interface UpdateJobResponse {
  status: string;
  message?: string;
  data?: Job;
  job?: Job;
}

export interface DeleteJobResponse {
  status: string;
  message?: string;
}

export interface UploadJobsRequest {
  file: File;
}

export interface UploadJobsResponse {
  status: string;
  message?: string;
  data?: {
    created: number;
    failed: number;
    errors?: string[];
  };
}
