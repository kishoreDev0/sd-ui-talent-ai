import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';
import { AuthAPI } from '../../service/authentication/login';
import { AuthTokens } from '../../types/authentication/login';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    {
      email,
      password,
      api,
    }: {
      email: string;
      password: string;
      api: AxiosInstance;
    },
    { rejectWithValue },
  ) => {
    try {
      const authAPI = new AuthAPI(api);
      const response = await authAPI.login(email, password);

      // Handle new response format
      if (response.data.success && response.data.data) {
        const { user, access_token, refresh_token, token_type } =
          response.data.data;

        const tokens: AuthTokens = {
          access_token,
          refresh_token,
          token_type,
        };

        // Return the structure expected by the slice
        return {
          user,
          tokens,
        };
      } else {
        return rejectWithValue(response.data.error || 'Login failed');
      }
    } catch (error: unknown) {
      const errorMessage =
        (
          error as {
            response?: { data?: { error?: string; message?: string } };
          }
        )?.response?.data?.error ||
        (
          error as {
            response?: { data?: { error?: string; message?: string } };
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'An error occurred during login';
      return rejectWithValue(errorMessage);
    }
  },
);
