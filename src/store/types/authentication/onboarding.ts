export interface UpdateOnboardingRequest {
  city: string;
  state: string;
  zip_code: string;
  country: string;
  preferred_timezone: string;
  mobile_country_code: string;
  mobile_number: string;
  image_url?: string;
}

export interface UpdateOnboardingResponse {
  success: boolean;
  status_code: number;
  timestamp: string;
  error: string[] | null;
  data: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    preferred_timezone: string;
    mobile_country_code: string;
    mobile_number: string;
    image_url: string | null;
    [key: string]: unknown;
  };
}

