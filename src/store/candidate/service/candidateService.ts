import axiosInstance from '@/axios-setup/axios-instance';
import { CANDIDATES } from '@/store/endpoints';
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
  error?: string;
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
  });

  return response.data.data.result;
};
