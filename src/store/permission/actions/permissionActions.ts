import { createAsyncThunk } from '@reduxjs/toolkit';
import { PermissionAPI } from '../service/permissionService';
import type { SyncPermissionsResponse } from '@/store/permission/types/permissionTypes';

const permissionAPI = new PermissionAPI();

export const syncPermissions = createAsyncThunk<
  SyncPermissionsResponse,
  void,
  { rejectValue: { message: string } }
>('permission/syncPermissions', async (_, { rejectWithValue }) => {
  try {
    const res = await permissionAPI.syncPermissions();
    return res.data as SyncPermissionsResponse;
  } catch {
    return rejectWithValue({ message: 'Failed to sync permissions' });
  }
});

