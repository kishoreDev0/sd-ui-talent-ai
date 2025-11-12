import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateSelfProfile,
} from '../actions/userActions';
import type {
  UsersState,
  ListUsersResponse,
  GetUserByIdResponse,
  UserResponse,
} from '@/store/types/user/userTypes';

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllUsers.fulfilled,
        (state, action: PayloadAction<ListUsersResponse>) => {
          state.loading = false;
          if (action.payload.success && action.payload.data) {
            state.users = action.payload.data.result || [];
            state.total = action.payload.data.total || 0;
            state.page = action.payload.data.page || 1;
            state.pageSize = action.payload.data.page_size || 10;
            state.totalPages = action.payload.data.total_pages || 0;
          }
          state.error = null;
        },
      )
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load users';
      })
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getUserById.fulfilled,
        (state, action: PayloadAction<GetUserByIdResponse>) => {
          state.loading = false;
          if (action.payload.success && action.payload.data) {
            // Update user in the list if it exists
            const userIndex = state.users.findIndex(
              (u) => u.id === action.payload.data.data.id,
            );
            if (userIndex !== -1) {
              state.users[userIndex] = action.payload.data.data;
            }
          }
          state.error = null;
        },
      )
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch user';
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateUser.fulfilled,
        (state, action: PayloadAction<UserResponse>) => {
          state.loading = false;
          if (action.payload.success && action.payload.data) {
            // Update user in the list if it exists
            const userIndex = state.users.findIndex(
              (u) => u.id === action.payload.data.id,
            );
            if (userIndex !== -1) {
              state.users[userIndex] = action.payload.data;
            }
          }
          state.error = null;
        },
      )
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update user';
      })
      .addCase(updateSelfProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateSelfProfile.fulfilled,
        (state, action: PayloadAction<UserResponse>) => {
          state.loading = false;
          if (action.payload.success && action.payload.data) {
            const userIndex = state.users.findIndex(
              (u) => u.id === action.payload.data.id,
            );
            if (userIndex !== -1) {
              state.users[userIndex] = action.payload.data;
            }
          }
          state.error = null;
        },
      )
      .addCase(updateSelfProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
