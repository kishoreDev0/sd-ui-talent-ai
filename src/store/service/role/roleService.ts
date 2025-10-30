import axiosInstance from '@/axios-setup/axios-instance';

export const getAllRoles = async (
  page = 1,
  page_size = 10,
  active_only = false,
) => {
  const res = await axiosInstance.get('/api/v1/roles', {
    params: { page, page_size, active_only },
  });
  return res.data;
};

export const createRole = async (payload) => {
  const res = await axiosInstance.post('/api/v1/roles', payload);
  return res.data;
};

export const updateRole = async (id, payload) => {
  const res = await axiosInstance.put(`/api/v1/roles/${id}`, payload);
  return res.data;
};

export const deleteRole = async (id) => {
  const res = await axiosInstance.delete(`/api/v1/roles/${id}`);
  return res.data;
};
