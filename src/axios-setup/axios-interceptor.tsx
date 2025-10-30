import { axiosInstance } from './axios-instance';

export interface HttpClientInstance {
  httpClient: typeof axiosInstance;
}

/**
 * Initialize HTTP Client using the centralized axios instance
 * This maintains backward compatibility with existing code
 */
export const initializeHttpClient = (): HttpClientInstance => {
  return { httpClient: axiosInstance };
};
