import axiosInstance from '@/axios-setup/axios-instance';
import { GOOGLE_OAUTH } from '@/store/endpoints';

export const googleOAuthService = {
  getStatus: () => axiosInstance.get(GOOGLE_OAUTH.STATUS),
  getConnectionStatus: () => axiosInstance.get(GOOGLE_OAUTH.STATUS),
  getConnectUrl: () => axiosInstance.get(GOOGLE_OAUTH.CONNECT_URL),
  exchangeCode: (payload: { code: string; redirect_uri: string }) =>
    axiosInstance.post(GOOGLE_OAUTH.EXCHANGE, payload),
  disconnect: () => axiosInstance.delete(GOOGLE_OAUTH.DISCONNECT),
};
