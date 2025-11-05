export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_id?: number;
  is_active: boolean;
  last_login?: string;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  preferred_timezone?: string | null;
  mobile_country_code?: string | null;
  mobile_number?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
  role?: {
    id: number;
    name: string;
  };
  organizations?: Array<{
    id: number;
    name: string;
  }>;
}

export interface ListUsersResponse {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: string[] | null;
  data: {
    result: User[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface GetUserByIdResponse {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: string[] | null;
  data: {
    data: User;
  };
}

export interface UserResponse {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: string[] | null;
  data: User;
}

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
