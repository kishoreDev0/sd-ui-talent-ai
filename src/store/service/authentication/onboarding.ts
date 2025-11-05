import { AxiosInstance, AxiosResponse } from 'axios';
import { USERS } from '../../endpoints';
import {
  UpdateOnboardingRequest,
  UpdateOnboardingResponse,
} from '../../types/authentication/onboarding';

export class OnboardingAPI {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  updateOnboarding = async (
    userId: number,
    payload: UpdateOnboardingRequest,
  ): Promise<AxiosResponse<UpdateOnboardingResponse>> => {
    try {
      const response = await this.api.patch(
        USERS.UPDATE_ONBOARDING(userId),
        payload,
      );
      return response;
    } catch (error) {
      console.error('Update onboarding error:', error);
      throw error;
    }
  };
}
