export interface RolePermission {
  permission_id: number;
  role_permission_id: number | null;
  has_permission: boolean;
}

export interface RoleResource {
  resource: string;
  actions: {
    [action: string]: RolePermission;
  };
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
  active?: boolean;
  resources?: RoleResource[];
}

export interface ListRolesResponse {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: null | string;
  data: {
    result: Role[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface GetRoleByIdResponse {
  status_code: number;
  data: Role;
  message?: string;
  timestamp: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateRoleRequest {
  id: number;
  name?: string;
  description?: string;
  active?: boolean;
}

export interface RoleResponse {
  status_code: number;
  data: Role;
  message?: string;
  timestamp: string;
}

export interface DeleteRoleResponse {
  status_code: number;
  message?: string;
}

export interface RolesState {
  roles: Role[];
  loading: boolean;
  error: null | string | unknown;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}
