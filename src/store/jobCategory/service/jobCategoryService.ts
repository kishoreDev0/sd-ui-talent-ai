import axiosInstance from '@/axios-setup/axios-instance';
import { JOB_CATEGORIES } from '@/store/endpoints';
import type {
  CreateJobCategoryRequest,
  JobCategory,
  JobCategoryResponse,
  ListJobCategoriesResponse,
  UpdateJobCategoryRequest,
} from '../types/jobCategoryTypes';

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

const normalizeCategory = (input: unknown): JobCategory => {
  const category = asRecord(input) ?? {};

  const idCandidate = pickFirstValue(category.id, category.category_id);
  const nameCandidate = pickFirstValue(category.name, category.title);
  const descriptionCandidate = pickFirstValue(
    category.description,
    category.details,
    category.summary,
  );
  const createdByCandidate = pickFirstValue(
    category.created_by,
    category.author,
  );
  const createdAtCandidate = pickFirstValue(
    category.created_at,
    category.createdAt,
  );
  const updatedAtCandidate = pickFirstValue(
    category.updated_at,
    category.updatedAt,
  );

  return {
    id: toNumberOrDefault(idCandidate, Date.now()),
    name: toOptionalString(nameCandidate) ?? 'Untitled Category',
    description: toOptionalString(descriptionCandidate),
    is_active: toBooleanOrDefault(
      pickFirstValue(category.is_active, category.status),
      true,
    ),
    created_by: toOptionalString(createdByCandidate),
    created_at: toOptionalString(createdAtCandidate),
    updated_at: toOptionalString(updatedAtCandidate),
  };
};

const toArray = (value: unknown): JobCategory[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.map((item) => normalizeCategory(item));
};

const extractCategoryArray = (
  payload:
    | ListJobCategoriesResponse
    | JobCategory[]
    | {
        data?: unknown;
        result?: unknown;
        items?: unknown;
        categories?: unknown;
        job_categories?: unknown;
      }
    | undefined,
): JobCategory[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeCategory(item));
  }

  const candidates: Array<JobCategory[] | null> = [];
  const payloadRecord = asRecord(payload);

  if (payloadRecord?.data !== undefined) {
    const dataField = payloadRecord.data;
    if (Array.isArray(dataField)) {
      candidates.push(toArray(dataField));
    } else {
      const dataRecord = asRecord(dataField);
      if (dataRecord) {
        candidates.push(
          toArray(dataRecord.result),
          toArray(dataRecord.items),
          toArray(dataRecord.data),
          toArray(dataRecord.categories),
          toArray(dataRecord.job_categories),
        );
      }
    }
  }

  candidates.push(
    toArray(payloadRecord?.result),
    toArray(payloadRecord?.results),
    toArray(payloadRecord?.items),
    toArray(payloadRecord?.categories),
    toArray(payloadRecord?.job_categories),
  );

  const match = candidates.find((entry) => Array.isArray(entry));
  return match ?? [];
};

const extractCategory = (
  payload: JobCategoryResponse | JobCategory | undefined,
): JobCategory | null => {
  if (!payload) {
    return null;
  }

  if (asRecord(payload)?.id !== undefined) {
    return normalizeCategory(payload);
  }

  const recordPayload = asRecord(payload);
  if (!recordPayload) {
    return null;
  }

  const candidates = [
    recordPayload.data,
    recordPayload.job_category,
    recordPayload.category,
    recordPayload.result,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    if (Array.isArray(candidate) && candidate.length > 0) {
      return normalizeCategory(candidate[0]);
    }
    return normalizeCategory(candidate);
  }

  return null;
};

export const listJobCategories = async (): Promise<JobCategory[]> => {
  try {
    const response = await axiosInstance.get<
      ListJobCategoriesResponse | JobCategory[]
    >(JOB_CATEGORIES.LIST);
    return extractCategoryArray(response.data);
  } catch (error) {
    console.error('Error fetching job categories:', error);
    throw error;
  }
};

export const getJobCategory = async (
  id: number | string,
): Promise<JobCategory> => {
  try {
    const response = await axiosInstance.get<JobCategoryResponse | JobCategory>(
      JOB_CATEGORIES.GET_BY_ID(id),
    );
    const category = extractCategory(response.data);
    if (!category) {
      throw new Error('Invalid job category response');
    }
    return category;
  } catch (error) {
    console.error('Error fetching job category:', error);
    throw error;
  }
};

export const createJobCategory = async (
  payload: CreateJobCategoryRequest,
): Promise<JobCategory> => {
  try {
    const response = await axiosInstance.post<
      JobCategoryResponse | JobCategory
    >(JOB_CATEGORIES.CREATE, payload);
    const category = extractCategory(response.data);
    if (!category) {
      throw new Error('Invalid job category response');
    }
    return category;
  } catch (error) {
    console.error('Error creating job category:', error);
    throw error;
  }
};

export const updateJobCategory = async (
  payload: UpdateJobCategoryRequest,
): Promise<JobCategory> => {
  try {
    const { id, ...body } = payload;
    const response = await axiosInstance.patch<
      JobCategoryResponse | JobCategory
    >(JOB_CATEGORIES.UPDATE(id), body);
    const category = extractCategory(response.data);
    if (!category) {
      throw new Error('Invalid job category response');
    }
    return category;
  } catch (error) {
    console.error('Error updating job category:', error);
    throw error;
  }
};

export const deleteJobCategory = async (
  id: number | string,
): Promise<number | string> => {
  try {
    await axiosInstance.delete(JOB_CATEGORIES.DELETE(id));
    return id;
  } catch (error) {
    console.error('Error deleting job category:', error);
    throw error;
  }
};
