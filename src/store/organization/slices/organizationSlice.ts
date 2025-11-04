import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  OrganizationsState,
  Organization,
  ListOrganizationsResponse,
  OrganizationResponse,
} from '@/store/types/organization/organizationTypes';
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationById,
} from '../actions/organizationActions';

const initialState: OrganizationsState = {
  organizations: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get all organizations
      .addCase(getAllOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllOrganizations.fulfilled,
        (state, action: PayloadAction<ListOrganizationsResponse>) => {
          const response = action.payload;
          if (response?.data) {
            state.organizations = Array.isArray(response.data.result)
              ? response.data.result
              : [];
            state.total = response.data.total ?? 0;
            state.page = response.data.page ?? 1;
            state.pageSize = response.data.page_size ?? state.pageSize;
            state.totalPages = response.data.total_pages ?? 0;
          }
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(getAllOrganizations.rejected, (state, action) => {
        state.organizations = [];
        state.loading = false;
        state.error = action.error.message || 'Failed to load organizations';
      })
      // Get organization by id
      .addCase(getOrganizationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getOrganizationById.fulfilled,
        (state, action: PayloadAction<{ data?: Organization }>) => {
          const organization = action.payload?.data;
          if (organization) {
            const index = state.organizations.findIndex(
              (org) => org.id === organization.id,
            );
            if (index !== -1) {
              state.organizations[index] = organization;
            } else {
              state.organizations.push(organization);
            }
          }
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(getOrganizationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch organization';
      })
      // Create organization
      .addCase(
        createOrganization.fulfilled,
        (state, action: PayloadAction<OrganizationResponse>) => {
          const created = action.payload?.data as Organization | undefined;
          if (created) {
            state.organizations.push(created);
            state.total = (state.total || 0) + 1;
          }
        },
      )
      // Update organization
      .addCase(
        updateOrganization.fulfilled,
        (state, action: PayloadAction<OrganizationResponse>) => {
          const updated = action.payload?.data as Organization | undefined;
          if (updated) {
            const idx = state.organizations.findIndex(
              (org) => org.id === updated.id,
            );
            if (idx !== -1) {
              state.organizations[idx] = updated;
            }
          }
        },
      )
      // Delete organization
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        const id = action.payload as number;
        state.organizations = state.organizations.filter(
          (org) => org.id !== id,
        );
        state.total = Math.max((state.total || 1) - 1, 0);
      });
  },
});

export default organizationSlice.reducer;
