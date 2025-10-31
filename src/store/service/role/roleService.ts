import axiosInstance from '@/axios-setup/axios-instance';
import { ROLES } from '@/store/endpoints';

export const getAllRoles = async (
  page = 1,
  page_size = 10,
  active_only = false,
) => {
  const res = await axiosInstance.get(ROLES.LIST, {
    params: { page, page_size, active_only },
  });
  return res.data;
};

export const createRole = async (payload) => {
  const res = await axiosInstance.post(ROLES.CREATE, payload);
  return res.data;
};

export const updateRole = async (id, payload) => {
  const res = await axiosInstance.put(ROLES.UPDATE(id), payload);
  return res.data;
};

export const deleteRole = async (id) => {
  const res = await axiosInstance.delete(ROLES.DELETE(id));
  return res.data;
};
