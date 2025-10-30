import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  RolesState,
  Role,
  ListRolesResponse,
  RoleResponse,
} from '@/store/types/role/roleTypes';
import {
  getAllRole,
  createRole,
  updateRole,
  deleteRole,
} from '../actions/roleActions';

const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
};

const roleReducer = createSlice({
  name: 'role',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAllRole.fulfilled,
        (state, action: PayloadAction<ListRolesResponse>) => {
          const list = action.payload?.data as Role[] | undefined;
          state.roles = Array.isArray(list) ? list : [];
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(getAllRole.rejected, (state, action) => {
        state.roles = [];
        state.loading = false;
        state.error = action.error.message || null;
      })
      // create
      .addCase(
        createRole.fulfilled,
        (state, action: PayloadAction<RoleResponse>) => {
          const created = action.payload?.data as Role | undefined;
          if (created) state.roles.push(created);
        },
      )
      // update
      .addCase(
        updateRole.fulfilled,
        (state, action: PayloadAction<RoleResponse>) => {
          const updated = action.payload?.data as Role | undefined;
          if (updated) {
            const idx = state.roles.findIndex((i) => i.id === updated.id);
            if (idx !== -1) state.roles[idx] = updated;
          }
        },
      )
      // delete
      .addCase(deleteRole.fulfilled, (state, action) => {
        const id = action.payload as number;
        state.roles = state.roles.filter((i) => i.id !== id);
      });
  },
});

export default roleReducer.reducer;
