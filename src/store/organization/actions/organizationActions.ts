import { createAsyncThunk } from '@reduxjs/toolkit';
import { OrganizationAPI } from '@/store/service/organization/organizationService';
import type {
  ListOrganizationsResponse,
  GetOrganizationByIdResponse,
  OrganizationResponse,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '@/store/types/organization/organizationTypes';

const organizationAPI = new OrganizationAPI();

export const getAllOrganizations = createAsyncThunk<
  ListOrganizationsResponse,
  {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  } | void,
  { rejectValue: { message: string } }
>('organization/getAllOrganizations', async (params, { rejectWithValue }) => {
  try {
    const res = await organizationAPI.getAllOrganizations(
      params as {
        page?: number;
        page_size?: number;
        status?: string;
        search?: string;
      },
    );
    // API returns: { success, status_code, timestamp, error, data: { result, total, page, page_size, total_pages } }
    return res.data as ListOrganizationsResponse;
  } catch {
    return rejectWithValue({ message: 'Failed to load organizations' });
  }
});

export const getOrganizationById = createAsyncThunk<
  GetOrganizationByIdResponse,
  number,
  { rejectValue: { message: string } }
>('organization/getOrganizationById', async (id, { rejectWithValue }) => {
  try {
    const res = await organizationAPI.getOrganizationById(id);
    return res.data as GetOrganizationByIdResponse;
  } catch {
    return rejectWithValue({ message: 'Failed to fetch organization' });
  }
});

export const createOrganization = createAsyncThunk<
  OrganizationResponse,
  { payload: CreateOrganizationRequest },
  { rejectValue: { message: string } }
>(
  'organization/createOrganization',
  async ({ payload }, { rejectWithValue }) => {
    try {
      const res = await organizationAPI.createOrganization(payload);
      return res.data as OrganizationResponse;
    } catch {
      return rejectWithValue({ message: 'Failed to create organization' });
    }
  },
);

export const updateOrganization = createAsyncThunk<
  OrganizationResponse,
  { id: number; payload: Omit<UpdateOrganizationRequest, 'id'> },
  { rejectValue: { message: string } }
>(
  'organization/updateOrganization',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await organizationAPI.updateOrganization(id, payload);
      return res.data as OrganizationResponse;
    } catch {
      return rejectWithValue({ message: 'Failed to update organization' });
    }
  },
);

export const deleteOrganization = createAsyncThunk<
  number,
  number,
  { rejectValue: { message: string } }
>('organization/deleteOrganization', async (id, { rejectWithValue }) => {
  try {
    await organizationAPI.deleteOrganization(id);
    return id;
  } catch {
    return rejectWithValue({ message: 'Failed to delete organization' });
  }
});

export const getOrganizationUsers = createAsyncThunk<
  unknown,
  number,
  { rejectValue: { message: string } }
>('organization/getOrganizationUsers', async (id, { rejectWithValue }) => {
  try {
    const res = await organizationAPI.getOrganizationUsers(id);
    return res.data;
  } catch {
    return rejectWithValue({
      message: 'Failed to fetch organization users',
    });
  }
});

export const assignUsersToOrganization = createAsyncThunk<
  { id: number; userIds: number[] },
  { id: number; userIds: number[] },
  { rejectValue: { message: string } }
>(
  'organization/assignUsersToOrganization',
  async ({ id, userIds }, { rejectWithValue }) => {
    try {
      await organizationAPI.assignUsersToOrganization(id, userIds);
      return { id, userIds };
    } catch {
      return rejectWithValue({
        message: 'Failed to assign users to organization',
      });
    }
  },
);
