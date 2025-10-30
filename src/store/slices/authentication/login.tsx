import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthTokens } from '../../types/authentication/login';
import { User } from '@/types';
import { loginUser } from '@/store/action/authentication/login';

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
          state.error = null;

          // Store in localStorage
          localStorage.setItem(
            AUTH_STORAGE_KEYS.USER,
            JSON.stringify(action.payload.user),
          );
          // store user id for quick access
          try {
            const uid = (action.payload.user as any)?.id;
            if (uid !== undefined && uid !== null) {
              localStorage.setItem('user_id', String(uid));
            }
          } catch {}
          localStorage.setItem(
            AUTH_STORAGE_KEYS.ACCESS_TOKEN,
            action.payload.tokens.access_token,
          );
          localStorage.setItem(
            AUTH_STORAGE_KEYS.REFRESH_TOKEN,
            action.payload.tokens.refresh_token,
          );
          localStorage.setItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED, 'true');
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
