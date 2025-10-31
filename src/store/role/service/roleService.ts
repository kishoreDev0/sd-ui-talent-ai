import axiosInstance from '@/axios-setup/axios-instance';
import { ROLES } from '@/store/endpoints';
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/store/types/role/roleTypes';

type ListParams = { page?: number; page_size?: number; active_only?: boolean };

export class RoleAPI {
  getAllRole = async (params?: ListParams) =>
    axiosInstance.get(ROLES.LIST, { params });
  getAllRoleWithPermissions = async (params?: ListParams) =>
    axiosInstance.get(ROLES.LIST_WITH_PERMISSIONS, { params });
  getRoleById = async (id: number) => axiosInstance.get(ROLES.GET_BY_ID(id));
  createRole = async (payload: CreateRoleRequest) =>
    axiosInstance.post(ROLES.CREATE, payload);
  updateRole = async (id: number, payload: Omit<UpdateRoleRequest, 'id'>) =>
    axiosInstance.put(ROLES.UPDATE(id), payload);
  deleteRole = async (id: number) => axiosInstance.delete(ROLES.DELETE(id));
}
