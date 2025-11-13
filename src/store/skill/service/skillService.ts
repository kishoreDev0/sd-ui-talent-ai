import axiosInstance from '@/axios-setup/axios-instance';
import { SKILLS } from '@/store/endpoints';
import type {
  CreateSkillRequest,
  ListSkillsResponse,
  Skill,
  SkillResponse,
  UpdateSkillRequest,
} from '../types/skillTypes';
import { normalizeMajorSkill } from '@/store/majorSkill/service/majorSkillService';

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
  value && typeof value === 'object' ? (value as UnknownRecord) : null;

const pickFirstValue = (...values: unknown[]): unknown =>
  values.find((value) => value !== undefined && value !== null);

const toNumberOrDefault = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toOptionalString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
};

const toBooleanOrDefault = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value !== 0;
  }
  return fallback;
};

export const normalizeSkill = (input: unknown): Skill => {
  const record = asRecord(input) ?? {};

  const idCandidate = pickFirstValue(record.id, record.skill_id);
  const nameCandidate = pickFirstValue(record.name, record.skill_name);
  const descriptionCandidate = pickFirstValue(
    record.description,
    record.summary,
    record.details,
  );
  const majorSkillIdCandidate = pickFirstValue(
    record.major_skill_id,
    record.majorSkillId,
    record.major_skill?.id,
  );

  const majorSkillCandidate = asRecord(record.major_skill);

  return {
    id: toNumberOrDefault(idCandidate, Date.now()),
    name: toOptionalString(nameCandidate) ?? 'Untitled Skill',
    description: toOptionalString(descriptionCandidate),
    major_skill_id: toNumberOrDefault(majorSkillIdCandidate, 0),
    is_active: toBooleanOrDefault(
      pickFirstValue(record.is_active, record.active, record.status),
      true,
    ),
    created_by: toOptionalString(
      pickFirstValue(record.created_by, record.createdBy, record.author),
    ),
    updated_by: toOptionalString(
      pickFirstValue(record.updated_by, record.updatedBy, record.modifier),
    ),
    created_at: toOptionalString(
      pickFirstValue(record.created_at, record.createdAt),
    ),
    updated_at: toOptionalString(
      pickFirstValue(record.updated_at, record.updatedAt),
    ),
    major_skill: majorSkillCandidate
      ? normalizeMajorSkill(majorSkillCandidate)
      : undefined,
  };
};

const toArray = (value: unknown): Skill[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.map((item) => normalizeSkill(item));
};

const extractSkillArray = (
  payload:
    | ListSkillsResponse
    | Skill[]
    | {
        data?: unknown;
        result?: unknown;
        items?: unknown;
        skills?: unknown;
        [key: string]: unknown;
      }
    | undefined,
): Skill[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeSkill(item));
  }

  const payloadRecord = asRecord(payload);
  if (!payloadRecord) {
    return [];
  }

  const candidates: Array<Skill[] | null> = [];

  if (payloadRecord.data !== undefined) {
    if (Array.isArray(payloadRecord.data)) {
      candidates.push(toArray(payloadRecord.data));
    } else {
      const dataRecord = asRecord(payloadRecord.data);
      if (dataRecord) {
        candidates.push(
          toArray(dataRecord.result),
          toArray(dataRecord.items),
          toArray(dataRecord.data),
          toArray(dataRecord.skills),
        );
      }
    }
  }

  candidates.push(
    toArray(payloadRecord.result),
    toArray(payloadRecord.results),
    toArray(payloadRecord.items),
    toArray(payloadRecord.skills),
  );

  const match = candidates.find((entry) => Array.isArray(entry));
  return match ?? [];
};

const extractSkill = (payload: SkillResponse | Skill | undefined): Skill | null => {
  if (!payload) {
    return null;
  }

  if (asRecord(payload)?.id !== undefined) {
    return normalizeSkill(payload);
  }

  const recordPayload = asRecord(payload);
  if (!recordPayload) {
    return null;
  }

  const candidates = [recordPayload.data, recordPayload.skill, recordPayload.result];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    if (Array.isArray(candidate) && candidate.length > 0) {
      return normalizeSkill(candidate[0]);
    }
    return normalizeSkill(candidate);
  }

  return null;
};

export const listSkills = async (): Promise<Skill[]> => {
  try {
    const response = await axiosInstance.get<ListSkillsResponse | Skill[]>(
      SKILLS.LIST,
    );
    return extractSkillArray(response.data);
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }
};

export const getSkill = async (id: number | string): Promise<Skill> => {
  try {
    const response = await axiosInstance.get<SkillResponse | Skill>(
      SKILLS.GET_BY_ID(id),
    );
    const skill = extractSkill(response.data);
    if (!skill) {
      throw new Error('Invalid skill response');
    }
    return skill;
  } catch (error) {
    console.error('Error fetching skill:', error);
    throw error;
  }
};

export const createSkill = async (
  payload: CreateSkillRequest,
): Promise<Skill> => {
  try {
    const response = await axiosInstance.post<SkillResponse | Skill>(
      SKILLS.CREATE,
      payload,
    );
    const skill = extractSkill(response.data);
    if (!skill) {
      throw new Error('Invalid skill response');
    }
    return skill;
  } catch (error) {
    console.error('Error creating skill:', error);
    throw error;
  }
};

export const updateSkill = async (
  payload: UpdateSkillRequest,
): Promise<Skill> => {
  try {
    const { id, ...body } = payload;
    const response = await axiosInstance.patch<SkillResponse | Skill>(
      SKILLS.UPDATE(id),
      body,
    );
    const skill = extractSkill(response.data);
    if (!skill) {
      throw new Error('Invalid skill response');
    }
    return skill;
  } catch (error) {
    console.error('Error updating skill:', error);
    throw error;
  }
};

export const deleteSkill = async (
  id: number | string,
): Promise<number | string> => {
  try {
    await axiosInstance.delete(SKILLS.DELETE(id));
    return id;
  } catch (error) {
    console.error('Error deleting skill:', error);
    throw error;
  }
};


