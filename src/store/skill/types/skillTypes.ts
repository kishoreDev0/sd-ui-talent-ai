import type { MajorSkill } from '@/store/majorSkill/types/majorSkillTypes';

export interface Skill {
  id: number;
  name: string;
  description?: string | null;
  major_skill_id: number;
  is_active?: boolean;
  created_by?: string | number | null;
  updated_by?: string | number | null;
  created_at?: string;
  updated_at?: string;
  major_skill?: Partial<MajorSkill>;
}

export interface ListSkillsResponse {
  data?:
    | {
        result?: Skill[];
        items?: Skill[];
        data?: Skill[];
        skills?: Skill[];
        [key: string]: unknown;
      }
    | Skill[];
  result?: Skill[];
  results?: Skill[];
  items?: Skill[];
  skills?: Skill[];
  [key: string]: unknown;
}

export interface SkillResponse {
  data?: Skill;
  result?: Skill;
  skill?: Skill;
  [key: string]: unknown;
}

export interface CreateSkillRequest {
  name: string;
  description?: string;
  major_skill_id: number;
  is_active?: boolean;
}

export interface UpdateSkillRequest extends CreateSkillRequest {
  id: number;
}

export interface SkillState {
  items: Skill[];
  isLoading: boolean;
  error: string | null;
  selectedSkill: Skill | null;
}


