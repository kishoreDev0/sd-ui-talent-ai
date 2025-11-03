import { AxiosInstance, AxiosResponse } from 'axios';
import { AUTH } from '../../endpoints';

export interface InviteUserResponse {
  message: string;
}

export class InviteUserAPI {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  inviteUser = async (
    name: string,
    email: string,
    organization: string,
    role: string,
  ): Promise<AxiosResponse<InviteUserResponse>> => {
    try {
      const response = await this.api.post(AUTH.INVITE_USER, {
        name,
        email,
        organization,
        role,
      });

      return response;
    } catch (error) {
      console.error('Invite User error:', error);
      throw error;
    }
  };
}
