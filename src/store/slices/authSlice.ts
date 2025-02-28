import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabase';
import { User, LoginCredentials } from '../../types/auth';

interface AuthState {
  user: User | null;
  authError: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  authError: null,
  isLoading: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.username,
        password: credentials.password,
      });

      if (error) throw error;

      return {
        id: data.user?.id || '',
        email: data.user?.email || '',
        username: data.user?.email || '',
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.username,
        password: credentials.password,
      });

      if (error) throw error;

      // Check if the user already exists (Supabase returns user with empty identities array)
      if (!data.user?.identities?.length) {
        throw new Error('This email is already registered. Please try logging in instead.');
      }

      return {
        id: data.user?.id || '',
        email: data.user?.email || '',
        username: data.user?.email || '',
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.authError = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.authError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.authError = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.authError = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.authError = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.authError = action.payload as string;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer; 