import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/domain';
import { loginAction, restoreSessionAction, signOutAction } from '../../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const STORAGE_KEY = 'kib_sfa_session';

function loadSession(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw) as { user: User; token: string };
    return { user: parsed.user, token: parsed.token };
  } catch {
    return { user: null, token: null };
  }
}

const persisted = loadSession();

const initialState: AuthState = {
  user: persisted.user,
  token: persisted.token,
  status: persisted.user ? 'succeeded' : 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => loginAction(credentials)
);

/** Reconcile the persisted session with Supabase + /api/auth/me on boot. */
export const restoreSession = createAsyncThunk('auth/restore', async () => restoreSessionAction());

/** Sign out of Supabase and clear local auth state. */
export const logout = createAsyncThunk('auth/logout', async () => {
  await signOutAction();
});

function persist(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, token: state.token }));
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        persist(state);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Sign in failed. Please try again.';
      })
      .addCase(restoreSession.fulfilled, (state, action: PayloadAction<{ user: User | null; token: string | null }>) => {
        if (action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.status = 'succeeded';
          state.error = null;
          persist(state);
        }
      })
      .addCase(logout.pending, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = null;
        localStorage.removeItem(STORAGE_KEY);
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
