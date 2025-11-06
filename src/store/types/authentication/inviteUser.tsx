export interface InviteUserState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export interface InviteUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  organization_ids: number[];
  country?: string;
  mobile_number?: string;
  mobile_country_code?: string;
  preferred_timezone?: string;
}
