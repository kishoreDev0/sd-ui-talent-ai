import { InviteUserAPI } from '@/store/service/authentication/inviteUser';
import { InviteUserRequest } from '@/store/types/authentication/inviteUser';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';

export const inviteUser = createAsyncThunk(
  'auth/inviteUser',
  async (
    { payload, api }: { payload: InviteUserRequest; api: AxiosInstance },
    { rejectWithValue },
  ) => {
    try {
      const inviteUserAPI = new InviteUserAPI(api);
      const response = await inviteUserAPI.inviteUser(payload);

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
