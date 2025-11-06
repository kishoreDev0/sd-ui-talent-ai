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

  inviteUser = async (payload: {
    email: string;
    first_name: string;
    last_name: string;
    role_id: number;
    organization_ids: number[];
    country?: string;
    mobile_number?: string;
    mobile_country_code?: string;
    preferred_timezone?: string;
  }): Promise<AxiosResponse<InviteUserResponse>> => {
    try {
      const response = await this.api.post(AUTH.INVITE_USER, payload);

      return response;
    } catch (error) {
      console.error('Invite User error:', error);
      throw error;
    }
  };
}
