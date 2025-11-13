import axiosInstance from '@/axios-setup/axios-instance';
import { MAJOR_SKILLS } from '@/store/endpoints';
import type {
  CreateMajorSkillRequest,
  MajorSkill,
  MajorSkillResponse,
  ListMajorSkillsResponse,
  UpdateMajorSkillRequest,
} from '../types/majorSkillTypes';

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

export const normalizeMajorSkill = (input: unknown): MajorSkill => {
  const record = asRecord(input) ?? {};

  const idCandidate = pickFirstValue(record.id, record.major_skill_id);
  const nameCandidate = pickFirstValue(record.name, record.major_skill_name);
  const descriptionCandidate = pickFirstValue(
    record.description,
    record.summary,
    record.details,
  );

  const createdByCandidate = pickFirstValue(
    record.created_by,
    record.createdBy,
    record.author,
  );
  const updatedByCandidate = pickFirstValue(
    record.updated_by,
    record.updatedBy,
    record.modifier,
  );

  return {
    id: toNumberOrDefault(idCandidate, Date.now()),
    name: toOptionalString(nameCandidate) ?? 'Untitled Major Skill',
    description: toOptionalString(descriptionCandidate),
    is_active: toBooleanOrDefault(
      pickFirstValue(record.is_active, record.active, record.status),
      true,
    ),
    created_by: toOptionalString(createdByCandidate),
    updated_by: toOptionalString(updatedByCandidate),
    created_at: toOptionalString(
      pickFirstValue(record.created_at, record.createdAt),
    ),
    updated_at: toOptionalString(
      pickFirstValue(record.updated_at, record.updatedAt),
    ),
  };
};

const toArray = (value: unknown): MajorSkill[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.map((item) => normalizeMajorSkill(item));
};

const extractMajorSkillArray = (
  payload:
    | ListMajorSkillsResponse
    | MajorSkill[]
    | {
        data?: unknown;
        result?: unknown;
        items?: unknown;
        major_skills?: unknown;
        [key: string]: unknown;
      }
    | undefined,
): MajorSkill[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeMajorSkill(item));
  }

  const payloadRecord = asRecord(payload);
  if (!payloadRecord) {
    return [];
  }

  const candidates: Array<MajorSkill[] | null> = [];

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
          toArray(dataRecord.major_skills),
        );
      }
    }
  }

  candidates.push(
    toArray(payloadRecord.result),
    toArray(payloadRecord.results),
    toArray(payloadRecord.items),
    toArray(payloadRecord.major_skills),
  );

  const match = candidates.find((entry) => Array.isArray(entry));
  return match ?? [];
};

const extractMajorSkill = (
  payload: MajorSkillResponse | MajorSkill | undefined,
): MajorSkill | null => {
  if (!payload) {
    return null;
  }

  if (asRecord(payload)?.id !== undefined) {
    return normalizeMajorSkill(payload);
  }

  const recordPayload = asRecord(payload);
  if (!recordPayload) {
    return null;
  }

  const candidates = [
    recordPayload.data,
    recordPayload.major_skill,
    recordPayload.result,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    if (Array.isArray(candidate) && candidate.length > 0) {
      return normalizeMajorSkill(candidate[0]);
    }
    return normalizeMajorSkill(candidate);
  }

  return null;
};

export const listMajorSkills = async (): Promise<MajorSkill[]> => {
  try {
    const response = await axiosInstance.get<
      ListMajorSkillsResponse | MajorSkill[]
    >(MAJOR_SKILLS.LIST);
    return extractMajorSkillArray(response.data);
  } catch (error) {
    console.error('Error fetching major skills:', error);
    throw error;
  }
};

export const getMajorSkill = async (
  id: number | string,
): Promise<MajorSkill> => {
  try {
    const response = await axiosInstance.get<MajorSkillResponse | MajorSkill>(
      MAJOR_SKILLS.GET_BY_ID(id),
    );
    const majorSkill = extractMajorSkill(response.data);
    if (!majorSkill) {
      throw new Error('Invalid major skill response');
    }
    return majorSkill;
  } catch (error) {
    console.error('Error fetching major skill:', error);
    throw error;
  }
};

export const createMajorSkill = async (
  payload: CreateMajorSkillRequest,
): Promise<MajorSkill> => {
  try {
    const response = await axiosInstance.post<
      MajorSkillResponse | MajorSkill
    >(MAJOR_SKILLS.CREATE, payload);
    const majorSkill = extractMajorSkill(response.data);
    if (!majorSkill) {
      throw new Error('Invalid major skill response');
    }
    return majorSkill;
  } catch (error) {
    console.error('Error creating major skill:', error);
    throw error;
  }
};

export const updateMajorSkill = async (
  payload: UpdateMajorSkillRequest,
): Promise<MajorSkill> => {
  try {
    const { id, ...body } = payload;
    const response = await axiosInstance.patch<
      MajorSkillResponse | MajorSkill
    >(MAJOR_SKILLS.UPDATE(id), body);
    const majorSkill = extractMajorSkill(response.data);
    if (!majorSkill) {
      throw new Error('Invalid major skill response');
    }
    return majorSkill;
  } catch (error) {
    console.error('Error updating major skill:', error);
    throw error;
  }
};

export const deleteMajorSkill = async (
  id: number | string,
): Promise<number | string> => {
  try {
    await axiosInstance.delete(MAJOR_SKILLS.DELETE(id));
    return id;
  } catch (error) {
    console.error('Error deleting major skill:', error);
    throw error;
  }
};


