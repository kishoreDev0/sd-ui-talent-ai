export interface MajorSkill {
  id: number;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_by?: string | number | null;
  updated_by?: string | number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ListMajorSkillsResponse {
  data?:
    | {
        result?: MajorSkill[];
        items?: MajorSkill[];
        data?: MajorSkill[];
        major_skills?: MajorSkill[];
        [key: string]: unknown;
      }
    | MajorSkill[];
  result?: MajorSkill[];
  results?: MajorSkill[];
  items?: MajorSkill[];
  major_skills?: MajorSkill[];
  [key: string]: unknown;
}

export interface MajorSkillResponse {
  data?: MajorSkill;
  result?: MajorSkill;
  major_skill?: MajorSkill;
  [key: string]: unknown;
}

export interface CreateMajorSkillRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateMajorSkillRequest extends CreateMajorSkillRequest {
  id: number;
}

export interface MajorSkillState {
  items: MajorSkill[];
  isLoading: boolean;
  error: string | null;
  selectedMajorSkill: MajorSkill | null;
}


