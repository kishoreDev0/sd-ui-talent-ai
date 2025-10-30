import axiosInstance from '@/axios-setup/axios-instance';
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/store/types/role/roleTypes';

type ListParams = { page?: number; page_size?: number; active_only?: boolean };

export class RoleAPI {
  getAllRole = async (params?: ListParams) =>
    axiosInstance.get(`/api/v1/roles`, { params });
  getRoleById = async (id: number) => axiosInstance.get(`/api/v1/roles/${id}`);
  createRole = async (payload: CreateRoleRequest) =>
    axiosInstance.post(`/api/v1/roles`, payload);
  updateRole = async (id: number, payload: Omit<UpdateRoleRequest, 'id'>) =>
    axiosInstance.put(`/api/v1/roles/${id}`, payload);
  deleteRole = async (id: number) =>
    axiosInstance.delete(`/api/v1/roles/${id}`);
}
