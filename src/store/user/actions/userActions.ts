import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserAPI } from '@/store/service/user/userService';
import type {
  ListUsersResponse,
  GetUserByIdResponse,
  UserResponse,
} from '@/store/types/user/userTypes';

const userAPI = new UserAPI();

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const direct = record.error;
    const message = record.message;
    const responseData = (record.response as Record<string, unknown>)?.data as
      | Record<string, unknown>
      | undefined;

    if (typeof direct === 'string') {
      return direct;
    }

    if (Array.isArray(direct) && direct.length > 0) {
      return direct
        .filter((item): item is string => typeof item === 'string')
        .join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }

    if (responseData) {
      const responseError = responseData.error;
      const responseMessage = responseData.message;

      if (typeof responseError === 'string') {
        return responseError;
      }

      if (Array.isArray(responseError) && responseError.length > 0) {
        return responseError
          .filter((item): item is string => typeof item === 'string')
          .join(', ');
      }

      if (typeof responseMessage === 'string') {
        return responseMessage;
      }
    }
  }

  return fallback;
};

type UpdateUserPayload = Record<string, unknown>;

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
  { id: number; payload: UpdateUserPayload },
  { rejectValue: { message: string } }
>('user/updateUser', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await userAPI.updateUser(id, payload);
    return res.data as UserResponse;
  } catch (error) {
    const errorMessage = toErrorMessage(error, 'Failed to update user');
    return rejectWithValue({ message: errorMessage });
  }
});

export const updateSelfProfile = createAsyncThunk<
  UserResponse,
  FormData,
  { rejectValue: { message: string } }
>('user/updateSelfProfile', async (payload, { rejectWithValue }) => {
  try {
    const res = await userAPI.updateProfile(payload);
    return res.data as UserResponse;
  } catch (error) {
    const errorMessage = toErrorMessage(error, 'Failed to update profile');
    return rejectWithValue({ message: errorMessage });
  }
});
