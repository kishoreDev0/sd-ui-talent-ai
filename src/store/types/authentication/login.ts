import { User } from '@/types';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  is_onboarding_required: boolean;
}

export interface LoginResponse {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: string[] | null;
  data: {
    result: User;
    access_token: string;
    refresh_token: string;
    token_type: string;
    is_onboarding_required?: boolean;
  };
}
