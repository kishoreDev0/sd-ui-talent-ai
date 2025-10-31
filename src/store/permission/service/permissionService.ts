import axiosInstance from '@/axios-setup/axios-instance';
import { PERMISSIONS } from '@/store/endpoints';

export class PermissionAPI {
  syncPermissions = async () => axiosInstance.post(PERMISSIONS.SYNC);
}
