import axiosInstance from '@/axios-setup/axios-instance';
import { ORGANIZATIONS } from '@/store/endpoints';
import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '@/store/types/organization/organizationTypes';

type ListParams = {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
};

export class OrganizationAPI {
  getAllOrganizations = async (params?: ListParams) =>
    axiosInstance.get(ORGANIZATIONS.LIST, { params });

  getOrganizationById = async (id: number) =>
    axiosInstance.get(ORGANIZATIONS.GET_BY_ID(id));

  createOrganization = async (payload: CreateOrganizationRequest) =>
    axiosInstance.post(ORGANIZATIONS.CREATE, payload);

  updateOrganization = async (
    id: number,
    payload: Omit<UpdateOrganizationRequest, 'id'>,
  ) => axiosInstance.put(ORGANIZATIONS.UPDATE(id), payload);

  deleteOrganization = async (id: number) =>
    axiosInstance.delete(ORGANIZATIONS.DELETE(id));

  getOrganizationUsers = async (id: number) =>
    axiosInstance.get(ORGANIZATIONS.GET_USERS(id));

  assignUsersToOrganization = async (id: number, userIds: number[]) =>
    axiosInstance.patch(ORGANIZATIONS.ASSIGN_USERS(id), {
      user_ids: userIds,
    });
}
