import { createSlice } from '@reduxjs/toolkit';
import type { PermissionsState, PermissionItem } from '@/store/permission/types/permissionTypes';
import { syncPermissions } from '../actions/permissionActions';

const initialState: PermissionsState = {
  permissions: [],
  loading: false,
  error: null,
  lastSync: null,
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
};

const parsePermissions = (data: {
  created: string[];
  existing: string[];
  updated: string[];
  deleted: string[];
}): PermissionItem[] => {
  const allPerms: PermissionItem[] = [];

  // Process existing
  (data.existing || []).forEach((key: string) => {
    const [module, action] = key.split('.');
    allPerms.push({ key, module: module || '', action: action || '', status: 'existing' });
  });

  // Process created
  (data.created || []).forEach((key: string) => {
    const [module, action] = key.split('.');
    allPerms.push({ key, module: module || '', action: action || '', status: 'created' });
  });

  // Process updated
  (data.updated || []).forEach((key: string) => {
    const [module, action] = key.split('.');
    allPerms.push({ key, module: module || '', action: action || '', status: 'updated' });
  });

  // Process deleted
  (data.deleted || []).forEach((key: string) => {
    const [module, action] = key.split('.');
    allPerms.push({ key, module: module || '', action: action || '', status: 'deleted' });
  });

  return allPerms;
};

const permissionReducer = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    setPermissionPage: (state, action) => {
      state.page = action.payload;
    },
    setPermissionPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.totalPages = Math.ceil(state.total / action.payload);
      state.page = 1; // Reset to first page when page size changes
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncPermissions.fulfilled, (state, action) => {
        const data = action.payload?.data;
        if (data) {
          const allPerms = parsePermissions(data);
          state.permissions = allPerms;
          state.total = allPerms.length;
          state.totalPages = Math.ceil(allPerms.length / state.pageSize);
          state.lastSync = action.payload.timestamp;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(syncPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to sync permissions';
      });
  },
});

export const { setPermissionPage, setPermissionPageSize } = permissionReducer.actions;
export default permissionReducer.reducer;

