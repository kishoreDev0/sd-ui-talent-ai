import axiosInstance from '@/axios-setup/axios-instance';
import { USERS } from '@/store/endpoints';

type ListParams = {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
  role_id?: number;
  is_active?: boolean;
};

export class UserAPI {
  getAllUsers = async (params?: ListParams) =>
    axiosInstance.get(USERS.LIST, { params });

  getUserById = async (id: number) => axiosInstance.get(USERS.GET_BY_ID(id));

  createUser = async (payload: any) =>
    axiosInstance.post(USERS.CREATE, payload);

  updateUser = async (id: number, payload: any) =>
    axiosInstance.patch(USERS.UPDATE(id), payload);

  deleteUser = async (id: number) => axiosInstance.delete(USERS.DELETE(id));
}
