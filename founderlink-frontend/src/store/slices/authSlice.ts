import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenService } from '../../core/services/tokenService';

interface User {
  userId: number;
  role: string;
  email: string;
  name?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: TokenService.getToken(),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!TokenService.getToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken?: string; userId: string | number; role: string; email: string; name?: string }>
    ) => {
      const { token, refreshToken, userId, role, email, name } = action.payload;
      const normalizedUserId = Number(userId);
      state.token = token;
      state.user = { userId: normalizedUserId, role, email, name };
      state.isAuthenticated = true;
      
      TokenService.setToken(token);
      if (refreshToken) {
        TokenService.setRefreshToken(refreshToken);
      }
      localStorage.setItem('user', JSON.stringify({ userId: normalizedUserId, role, email, name }));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      TokenService.clearAll();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export default authSlice.reducer;
