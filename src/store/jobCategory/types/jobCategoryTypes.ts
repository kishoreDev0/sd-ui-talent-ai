export interface JobCategory {
  id: number;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ListJobCategoriesResponse {
  data?:
    | JobCategory[]
    | {
        result?: JobCategory[];
        items?: JobCategory[];
        data?: JobCategory[];
        categories?: JobCategory[];
        [key: string]: unknown;
      };
  results?: JobCategory[];
  job_categories?: JobCategory[];
  categories?: JobCategory[];
  [key: string]: unknown;
}

export interface JobCategoryResponse {
  data?: JobCategory;
  job_category?: JobCategory;
  category?: JobCategory;
  result?: JobCategory;
  [key: string]: unknown;
}

export interface CreateJobCategoryRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateJobCategoryRequest extends CreateJobCategoryRequest {
  id: number;
}

export interface JobCategoryState {
  items: JobCategory[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: JobCategory | null;
}
