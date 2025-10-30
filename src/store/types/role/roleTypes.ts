export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  created_by?: string;
  updated_by?: string;
  active?: boolean;
}

export interface ListRolesResponse {
  status_code: number;
  data: Role[];
  message?: string;
  timestamp: string;
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
}
