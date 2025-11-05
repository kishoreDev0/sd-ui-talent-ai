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
        const {
          result,
          access_token,
          refresh_token,
          token_type,
          is_onboarding_required,
        } = response.data.data;

        const tokens: AuthTokens = {
          access_token,
          refresh_token,
          token_type,
        };

        // Return the structure expected by the slice
        return {
          user: result,
          tokens,
          is_onboarding_required: is_onboarding_required ?? false,
        };
      } else {
        // Handle error array or string from response
        const errorData = response.data.error;
        let errorMessage = 'Login failed';

        if (Array.isArray(errorData) && errorData.length > 0) {
          errorMessage = errorData.join(', ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }

        return rejectWithValue(errorMessage);
      }
    } catch (error: unknown) {
      // Extract error from axios response
      const axiosError = error as {
        response?: {
          data?: {
            error?: string | string[];
            message?: string;
          };
        };
        message?: string;
      };

      let errorMessage = 'An error occurred during login';

      if (axiosError?.response?.data) {
        const errorData = axiosError.response.data.error;

        if (Array.isArray(errorData) && errorData.length > 0) {
          errorMessage = errorData.join(', ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (axiosError.response.data.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (axiosError?.message) {
        errorMessage = axiosError.message;
      }

      return rejectWithValue(errorMessage);
    }
  },
);
