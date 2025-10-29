export interface ResumeMatch {
  filename: string;
  match_percentage?: number;
  explanation?: string;
  skills_matched?: number;
  total_skills?: number;
  experience_match?: number;
  education_match?: number;
  certifications_match?: number;
  role_match?: number;
  error?: string;
}

export interface JobRequirement {
  id: number;
  filename: string;
  job_title: string;
  upload_date: string;
  size: number;
}

export interface SavedAnalysis {
  id: number;
  timestamp: string;
  user_id: number;
  data: {
    resumeHTML?: string;
    audioHTML?: string;
    metaInfo?: string;
    technology?: string;
    audioFileName?: string;
    timestamp?: string;
    rawData?: {
      resume?: unknown;
      technical?: unknown;
    };
  };
}

export interface ShortlistedResume {
  id: number;
  timestamp: string;
  original_filename: string;
  user_id: number;
  match_percentage?: number;
}

export interface ResumeAnalysisResponse {
  resumes?: ResumeMatch[];
  job_requirement_analysis?: Record<string, unknown>;
}
