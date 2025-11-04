import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginUser } from '../../action/authentication/login';
import { updateUserOnboarding } from '../../action/authentication/onboarding';
import { AuthState, AuthTokens } from '../../types/authentication/login';
import { User } from '@/types';

export const AUTH_STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  REMEMBER_ME: 'rememberMe',
  IS_AUTHENTICATED: 'isAuthenticated',
};

const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
const storedAccessToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
const isAuthenticated =
  localStorage.getItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED) === 'true' ||
  !!storedAccessToken;

const storedTokens: AuthTokens | null = storedAccessToken
  ? {
      access_token: storedAccessToken,
      refresh_token:
        localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN) || '',
      token_type: 'bearer',
    }
  : null;

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  tokens: storedTokens,
  isAuthenticated: !!isAuthenticated,
  isLoading: false,
  error: null,
  is_onboarding_required: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      state.is_onboarding_required = false;

      // Remove all auth-related items from localStorage
      Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      // Explicitly clear any legacy/bypass keys
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      const keysToAlwaysCheck = [
        'user',
        'token',
        'auth',
        'session',
        'access_token',
        'refresh_token',
        'role',
        'user_id',
      ];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const lowerKey = key.toLowerCase();
          if (keysToAlwaysCheck.some((authKey) => lowerKey.includes(authKey))) {
            localStorage.removeItem(key);
          }
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearOnboardingRequired: (state) => {
      state.is_onboarding_required = false;
      localStorage.removeItem('is_onboarding_required');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ user: User; tokens: AuthTokens; is_onboarding_required?: boolean }>) => {
          state.isLoading = false;

          // Map image_url to avatar for backward compatibility
          const user = {
            ...action.payload.user,
            avatar: action.payload.user.avatar || action.payload.user.image_url,
          };

          state.user = user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
          state.error = null;
          state.is_onboarding_required = action.payload.is_onboarding_required ?? false;

          // Store in localStorage
          localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
          // store user id for quick access
          try {
            const uid = user?.id;
            if (uid !== undefined && uid !== null) {
              localStorage.setItem('user_id', String(uid));
            }
          } catch (error) {
            // Silently fail if user id cannot be stored
            console.warn('Failed to store user_id:', error);
          }
          localStorage.setItem(
            AUTH_STORAGE_KEYS.ACCESS_TOKEN,
            action.payload.tokens.access_token,
          );
          localStorage.setItem(
            AUTH_STORAGE_KEYS.REFRESH_TOKEN,
            action.payload.tokens.refresh_token,
          );
          localStorage.setItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED, 'true');
          localStorage.setItem('is_onboarding_required', String(state.is_onboarding_required));
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserOnboarding.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update user data with onboarding information
        if (state.user && action.payload.user) {
          state.user = {
            ...state.user,
            ...action.payload.user,
            avatar: action.payload.user.image_url || state.user.avatar,
          };
          // Store updated user in localStorage
          localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(state.user));
        }
        state.is_onboarding_required = false;
        localStorage.removeItem('is_onboarding_required');
        state.error = null;
      })
      .addCase(updateUserOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, clearOnboardingRequired } = authSlice.actions;
export default authSlice.reducer;
