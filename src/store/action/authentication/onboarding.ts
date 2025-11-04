import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';
import { OnboardingAPI } from '../../service/authentication/onboarding';
import { UpdateOnboardingRequest } from '../../types/authentication/onboarding';

export const updateUserOnboarding = createAsyncThunk(
  'auth/updateOnboarding',
  async (
    {
      userId,
      payload,
      api,
    }: {
      userId: number;
      payload: UpdateOnboardingRequest;
      api: AxiosInstance;
    },
    { rejectWithValue },
  ) => {
    try {
      const onboardingAPI = new OnboardingAPI(api);
      const response = await onboardingAPI.updateOnboarding(userId, payload);

      if (response.data.success && response.data.data) {
        return {
          user: response.data.data,
        };
      } else {
        const errorMessage = Array.isArray(response.data.error)
          ? response.data.error.join(', ')
          : response.data.error || 'Onboarding update failed';
        return rejectWithValue(errorMessage);
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
        'An error occurred during onboarding update';
      return rejectWithValue(errorMessage);
    }
  },
);

