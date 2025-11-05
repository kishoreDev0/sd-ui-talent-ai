import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserAPI } from '@/store/service/user/userService';
import type {
  ListUsersResponse,
  GetUserByIdResponse,
  UserResponse,
} from '@/store/types/user/userTypes';

const userAPI = new UserAPI();

export const getAllUsers = createAsyncThunk<
  ListUsersResponse,
  {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
    role_id?: number;
    is_active?: boolean;
  } | void,
  { rejectValue: { message: string } }
>('user/getAllUsers', async (params, { rejectWithValue }) => {
  try {
    const res = await userAPI.getAllUsers(
      params as {
        page?: number;
        page_size?: number;
        status?: string;
        search?: string;
        role_id?: number;
        is_active?: boolean;
      },
    );
    return res.data as ListUsersResponse;
  } catch {
    return rejectWithValue({ message: 'Failed to load users' });
  }
});

export const getUserById = createAsyncThunk<
  GetUserByIdResponse,
  number,
  { rejectValue: { message: string } }
>('user/getUserById', async (id, { rejectWithValue }) => {
  try {
    const res = await userAPI.getUserById(id);
    return res.data as GetUserByIdResponse;
  } catch {
    return rejectWithValue({ message: 'Failed to fetch user' });
  }
});

export const updateUser = createAsyncThunk<
  UserResponse,
  { id: number; payload: any },
  { rejectValue: { message: string } }
>('user/updateUser', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await userAPI.updateUser(id, payload);
    return res.data as UserResponse;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error ||
      (Array.isArray(error?.response?.data?.error)
        ? error.response.data.error.join(', ')
        : error?.response?.data?.error) ||
      error?.message ||
      'Failed to update user';
    return rejectWithValue({ message: errorMessage });
  }
});
