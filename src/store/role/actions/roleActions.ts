import { createAsyncThunk } from '@reduxjs/toolkit';
import { RoleAPI } from '../service/roleService';
import type {
  ListRolesResponse,
  GetRoleByIdResponse,
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/store/types/role/roleTypes';
const roleAPI = new RoleAPI();

export const getAllRole = createAsyncThunk<
  ListRolesResponse,
  { page?: number; page_size?: number; active_only?: boolean } | void,
  { rejectValue: { message: string } }
>('role/getAllRole', async (params, { rejectWithValue }) => {
  try {
    const res = await roleAPI.getAllRole(params as any);
    return res.data as ListRolesResponse;
  } catch {
    return rejectWithValue({ message: 'Failed to load roles' });
  }
});

export const getRoleById = createAsyncThunk<
  GetRoleByIdResponse,
  number,
  { rejectValue: { message: string } }
>('role/getRoleById', async (id, { rejectWithValue }) => {
  try {
    const res = await roleAPI.getRoleById(id);
    return res.data as GetRoleByIdResponse;
  } catch {
    return rejectWithValue({ message: 'Failed to fetch role' });
  }
});

export const createRole = createAsyncThunk<
  RoleResponse,
  { payload: CreateRoleRequest },
  { rejectValue: { message: string } }
>('role/createRole', async ({ payload }, { rejectWithValue }) => {
  try {
    const res = await roleAPI.createRole(payload);
    return res.data as RoleResponse;
  } catch {
    return rejectWithValue({ message: 'Failed to create role' });
  }
});

export const updateRole = createAsyncThunk<
  RoleResponse,
  { id: number; payload: Omit<UpdateRoleRequest, 'id'> },
  { rejectValue: { message: string } }
>('role/updateRole', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await roleAPI.updateRole(id, payload);
    return res.data as RoleResponse;
  } catch {
    return rejectWithValue({ message: 'Failed to update role' });
  }
});

export const deleteRole = createAsyncThunk<
  number,
  number,
  { rejectValue: { message: string } }
>('role/deleteRole', async (id, { rejectWithValue }) => {
  try {
    await roleAPI.deleteRole(id);
    return id;
  } catch {
    return rejectWithValue({ message: 'Failed to delete role' });
  }
});
