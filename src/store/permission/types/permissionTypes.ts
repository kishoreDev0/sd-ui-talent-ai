export interface PermissionItem {
  key: string;
  module: string;
  action: string;
  status: 'existing' | 'created' | 'updated' | 'deleted';
}

export interface SyncPermissionsResponse {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: null | string;
  data: {
    result: {
      message: string;
      created: string[];
      existing: string[];
      updated: string[];
      deleted: string[];
      errors: string[];
    };
  };
}

export interface PermissionsState {
  permissions: PermissionItem[];
  loading: boolean;
  error: null | string | unknown;
  lastSync: string | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
