import axiosInstance from '@/axios-setup/axios-instance';
import { CANDIDATES, RESUME_MATCH } from '@/store/endpoints';
import type {
  Candidate,
  CandidateCreateRequest,
  CandidateUpdateRequest,
  CandidateListPayload,
  CandidateItemResponse,
  CandidateQueryParams,
  ListCandidatesResponse,
} from '../types/candidateTypes';

const toCandidateListPayload = (
  response: ListCandidatesResponse,
): CandidateListPayload => {
  const fallback: CandidateListPayload = {
    result: [],
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  };

  return response?.data ?? fallback;
};

const unwrapCandidate = (response: CandidateItemResponse): Candidate => {
  const candidate = response?.data?.result;
  if (!candidate) {
    throw new Error('Invalid candidate response payload');
  }
  return candidate;
};

export const listCandidates = async (
  params: CandidateQueryParams = {},
): Promise<CandidateListPayload> => {
  const queryParams: Record<string, unknown> = {
    page: params.page ?? 1,
    page_size: params.pageSize ?? 10,
  };

  if (params.search) queryParams.search = params.search;
  if (params.organizationId)
    queryParams.organization_id = params.organizationId;
  if (params.city) queryParams.city = params.city;
  if (params.country) queryParams.country = params.country;

  const response = await axiosInstance.get<ListCandidatesResponse>(
    CANDIDATES.LIST,
    {
      params: queryParams,
    },
  );

  return toCandidateListPayload(response.data);
};

export const getCandidateById = async (id: number): Promise<Candidate> => {
  const response = await axiosInstance.get<CandidateItemResponse>(
    CANDIDATES.GET_BY_ID(id),
  );
  return unwrapCandidate(response.data);
};

export const createCandidate = async (
  payload: CandidateCreateRequest,
): Promise<Candidate> => {
  const response = await axiosInstance.post<CandidateItemResponse>(
    CANDIDATES.CREATE,
    payload,
  );
  return unwrapCandidate(response.data);
};

export const updateCandidate = async (
  payload: CandidateUpdateRequest & { id: number },
): Promise<Candidate> => {
  const { id, ...body } = payload;
  const response = await axiosInstance.patch<CandidateItemResponse>(
    CANDIDATES.UPDATE(id),
    body,
  );
  return unwrapCandidate(response.data);
};

export const deleteCandidate = async (id: number): Promise<number> => {
  await axiosInstance.delete(CANDIDATES.DELETE(id));
  return id;
};

export const getCandidateResumeLink = async (id: number): Promise<string> => {
  const response = await axiosInstance.get<{
    data: { result: { resume_url: string } };
  }>(CANDIDATES.RESUME_LINK(id));

  const resumeUrl = response.data?.data?.result?.resume_url;
  if (!resumeUrl) {
    throw new Error('Resume link unavailable');
  }
  return resumeUrl;
};

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  duration: string;
  role: string;
  achievements?: string | null;
}

export interface ParsedResumeData {
  resume_link?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  resume_title?: string | null;
  total_experience?: number | null;
  skills?: string[];
  major_skills?: string[];
  matched_skill_ids?: number[]; // Matched skill IDs from database
  matched_major_skill_ids?: number[]; // Matched major skill IDs from database
  education?: string | null;
  current_company?: string | null;
  current_ctc?: string | null;
  expected_ctc?: string | null;
  notice_period?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  address1?: string | null;
  zip_code?: string | null;
  preferred_time_zone?: string | null;
  skype_id?: string | null;
  passport_number?: string | null;
  reason_for_change?: string | null;
  domain_expertise?: string | null;
  education_details?: string | null;
  source?: string | null;
  projects?: Project[];
}

export const parseResume = async (file: File): Promise<ParsedResumeData> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post<{
    data: { result: ParsedResumeData };
  }>(CANDIDATES.PARSE_RESUME, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.result;
};

export interface SkillTreeItem {
  skill_name: string;
  efficiency: number;
  match_status: 'exact' | 'partial' | 'missing';
  used_in_projects: number;
  years_of_experience: number;
  relevance_to_job: number;
}

export interface TechnicalAnalysisGrade {
  question: string;
  answer: string;
  score: number;
  explanation: string;
}

export interface TechnicalAnalysisReport {
  technical_score: number;
  technical_explanation: string;
  depth_score: number;
  depth_explanation: string;
  relevance_score: number;
  relevance_explanation: string;
  communication_score: number;
  communication_explanation: string;
  clarity_score: number;
  clarity_explanation: string;
  confidence_score: number;
  confidence_explanation: string;
  problem_solving_score: number;
  problem_solving_explanation: string;
  question_grades: TechnicalAnalysisGrade[];
}

export interface ResumeMatchResult {
  match_percentage: number;
  explanation: string;
  skills_matched: number;
  total_skills: number;
  skill_coverage?: number;
  experience_match: number;
  education_match: number;
  certifications_match: number;
  role_match: number;
  skill_tree?: SkillTreeItem[];
  error?: string;
  detailed_analysis?: TechnicalAnalysisReport;
}

export interface JobRequirementAnalysis {
  filename?: string;
  match_percentage?: number;
  explanation?: string;
  error?: string;
  skills_matched?: number;
  total_skills?: number;
  experience_match?: number;
  education_match?: number;
  certifications_match?: number;
  role_match?: number;
  skill_tree?: SkillTreeItem[];
}

export const matchResumeWithJob = async (
  jobId: number,
  file: File,
): Promise<ResumeMatchResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post<{
    data: { result: ResumeMatchResult };
  }>(CANDIDATES.MATCH_RESUME(jobId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000,
  });

  return response.data.data.result;
};

export interface ResumeMatchResumeResult {
  filename: string;
  match_percentage?: number;
  explanation?: string;
  skills_matched?: number;
  total_skills?: number;
  experience_match?: number;
  education_match?: number;
  certifications_match?: number;
  role_match?: number;
  skill_tree?: SkillTreeItem[];
  error?: string;
  detailed_analysis?: TechnicalAnalysisReport;
}

export interface ResumeMatchAnalysisResponse {
  job_summary?: {
    source: string;
    reference?: string;
    preview?: string;
  };
  job_requirement_analysis?: JobRequirementAnalysis;
  resumes: ResumeMatchResumeResult[];
}

export const analyzeResumeMatch = async (
  payload: FormData,
): Promise<ResumeMatchAnalysisResponse> => {
  const response = await axiosInstance.post<{
    data: { result: ResumeMatchAnalysisResponse };
  }>(RESUME_MATCH.ANALYZE, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000,
  });

  return response.data.data.result;
};
