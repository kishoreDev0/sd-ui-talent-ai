export interface CandidateOrganization {
  id: number;
  name: string;
}

export interface CandidateMajorSkill {
  id: number;
  name: string;
}

export interface CandidateSkill {
  id: number;
  name: string;
  major_skill_id?: number;
}

export interface Candidate {
  id: number;
  resume_title: string;
  first_name: string;
  last_name: string;
  email: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country: string;
  preferred_time_zone: string;
  mobile?: string | null;
  currency?: string | null;
  education_details?: string | null;
  current_company?: string | null;
  direct_interview: boolean;
  domain_expertise?: string | null;
  reason_for_change?: string | null;
  skype_id?: string | null;
  experience_years?: number | null;
  source?: string | null;
  passport_number?: string | null;
  current_ctc?: number | null;
  expected_ctc?: number | null;
  notice_period?: string | null;
  resume_link?: string | null;
  organizations: CandidateOrganization[];
  major_skills: CandidateMajorSkill[];
  skills: CandidateSkill[];
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CandidateFilters {
  search?: string;
  organizationId?: number;
  city?: string;
  country?: string;
}

export interface CandidateListPayload {
  result: Candidate[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CommonCandidateResponse<T> {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: string | null;
  data: T;
}

export type ListCandidatesResponse =
  CommonCandidateResponse<CandidateListPayload>;
export type CandidateItemResponse = CommonCandidateResponse<{
  result: Candidate;
}>;

export interface CandidateState {
  items: Candidate[];
  current: Candidate | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filters: CandidateFilters;
}

export interface CandidateQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  organizationId?: number;
  city?: string;
  country?: string;
}

export type CandidateCreateRequest = Omit<
  Candidate,
  | 'id'
  | 'organizations'
  | 'major_skills'
  | 'skills'
  | 'rating'
  | 'created_at'
  | 'updated_at'
> & {
  organization_ids: number[];
  major_skills: string[];
  skills: string[];
};

export type CandidateUpdateRequest = Partial<CandidateCreateRequest>;
