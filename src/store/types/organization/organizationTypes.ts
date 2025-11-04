export interface Organization {
  id: number;
  name: string;
  is_active: boolean;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  status?: string; // Keep for backward compatibility with API response
}

export interface ListOrganizationsResponse {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: string[] | null;
  data: {
    result: Organization[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface GetOrganizationByIdResponse {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: string[] | null;
  data: Organization;
}

export interface CreateOrganizationRequest {
  name: string;
  is_active: boolean;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

export interface UpdateOrganizationRequest {
  id: number;
  name?: string;
  is_active?: boolean;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

export interface OrganizationResponse {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: string[] | null;
  data: Organization;
}

export interface OrganizationsState {
  organizations: Organization[];
  loading: boolean;
  error: null | string | unknown;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}
