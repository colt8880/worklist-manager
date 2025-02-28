import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabase';
import { User, LoginCredentials, RegistrationData } from '../../types/auth';

interface AuthState {
  user: User | null;
  authError: string | null;
  isLoading: boolean;
  lastAction: string | null;
  pendingRequests: number;
  verificationMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  authError: null,
  isLoading: false,
  lastAction: null,
  pendingRequests: 0,
  verificationMessage: null,
};

// Create a signal to abort pending requests
let abortController = new AbortController();

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue, signal }) => {
    try {
      // Create a new abort controller for this request
      abortController = new AbortController();
      
      // Link the thunk's signal to our controller
      signal.addEventListener('abort', () => {
        abortController.abort();
      });
      
      console.log('[authSlice] Attempting login with:', credentials.username);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.username,
        password: credentials.password,
      });

      if (error) {
        console.error('[authSlice] Login error:', error.message);
        throw error;
      }

      console.log('[authSlice] Login successful');
      
      // Extract user metadata
      const userData = data.user?.user_metadata;
      
      return {
        id: data.user?.id || '',
        email: data.user?.email || '',
        username: data.user?.email || '',
        firstName: userData?.first_name,
        lastName: userData?.last_name,
        zipCode: userData?.zip_code,
      };
    } catch (error: any) {
      // Check if this is an abort error
      if (error.name === 'AbortError') {
        console.log('[authSlice] Login request was aborted');
        return rejectWithValue('Request was cancelled');
      }
      
      console.error('[authSlice] Login rejected with:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[authSlice] Attempting logout');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('[authSlice] Logout successful');
      return null;
    } catch (error: any) {
      console.error('[authSlice] Logout error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegistrationData, { rejectWithValue, signal }) => {
    try {
      // Create a new abort controller for this request
      abortController = new AbortController();
      
      // Link the thunk's signal to our controller
      signal.addEventListener('abort', () => {
        abortController.abort();
      });
      
      console.log('[authSlice] Attempting registration with:', data.username);
      // First, sign up the user with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.username,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            zip_code: data.zipCode,
          }
        }
      });

      if (error) {
        console.error('[authSlice] Registration error:', error.message);
        throw error;
      }

      // Check if the user already exists (Supabase returns user with empty identities array)
      if (!authData.user?.identities?.length) {
        const errorMsg = 'This email is already registered. Please try logging in instead.';
        console.error('[authSlice] Registration error:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[authSlice] Registration successful');
      
      // Check if email confirmation is required
      // Supabase by default requires email confirmation
      if (!authData.session) {
        console.log('[authSlice] Email verification required');
        return {
          id: authData.user?.id || '',
          email: authData.user?.email || '',
          username: authData.user?.email || '',
          firstName: data.firstName,
          lastName: data.lastName,
          zipCode: data.zipCode,
          requiresEmailVerification: true
        };
      }
      
      return {
        id: authData.user?.id || '',
        email: authData.user?.email || '',
        username: authData.user?.email || '',
        firstName: data.firstName,
        lastName: data.lastName,
        zipCode: data.zipCode,
        requiresEmailVerification: false
      };
    } catch (error: any) {
      // Check if this is an abort error
      if (error.name === 'AbortError') {
        console.log('[authSlice] Registration request was aborted');
        return rejectWithValue('Request was cancelled');
      }
      
      console.error('[authSlice] Registration rejected with:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Function to abort any pending requests
export const abortPendingRequests = () => {
  console.log('[authSlice] Aborting any pending requests');
  abortController.abort();
  abortController = new AbortController();
};

// Add a new thunk to get the current user session
export const getCurrentSession = createAsyncThunk(
  'auth/getCurrentSession',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[authSlice] Getting current session');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[authSlice] Get session error:', error.message);
        throw error;
      }
      
      if (!data.session) {
        console.log('[authSlice] No active session found');
        return null;
      }
      
      console.log('[authSlice] Session found, getting user data');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('[authSlice] Get user error:', userError.message);
        throw userError;
      }
      
      if (!userData.user) {
        console.log('[authSlice] No user found in session');
        return null;
      }
      
      const userMetadata = userData.user.user_metadata;
      
      console.log('[authSlice] User session retrieved successfully');
      return {
        id: userData.user.id,
        email: userData.user.email || '',
        username: userData.user.email || '',
        firstName: userMetadata?.first_name,
        lastName: userMetadata?.last_name,
        zipCode: userMetadata?.zip_code,
      };
    } catch (error: any) {
      console.error('[authSlice] Get session rejected with:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      console.log('[authSlice] Clearing auth error state');
      if (state.authError) {
        console.log('[authSlice] Auth error was:', state.authError);
      }
      state.authError = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.authError = null;
    },
    // Simple action to track page changes
    setCurrentPage: (state, action: PayloadAction<string>) => {
      console.log('[authSlice] Setting current page to:', action.payload);
      // Also clear any errors when changing pages
      if (state.authError) {
        console.log('[authSlice] Clearing error on page change from:', state.authError);
        state.authError = null;
      }
      
      // Abort any pending requests when changing pages
      abortPendingRequests();
      
      state.lastAction = action.payload;
    },
    // Action to abort pending requests
    abortRequests: (state) => {
      console.log('[authSlice] Aborting requests via reducer');
      abortPendingRequests();
      state.pendingRequests = 0;
    },
    // Add a new reducer to set the verification message
    setVerificationMessage: (state, action: PayloadAction<string | null>) => {
      state.verificationMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        console.log('[authSlice] Login pending');
        state.isLoading = true;
        state.authError = null;
        state.pendingRequests++;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('[authSlice] Login fulfilled');
        state.isLoading = false;
        state.user = action.payload;
        state.authError = null;
        state.pendingRequests = Math.max(0, state.pendingRequests - 1);
      })
      .addCase(login.rejected, (state, action) => {
        console.log('[authSlice] Login rejected with error:', action.payload);
        state.isLoading = false;
        
        // Only set error if it's not a cancellation
        if (action.payload !== 'Request was cancelled') {
          state.authError = action.payload as string;
        } else {
          console.log('[authSlice] Login request was cancelled, not setting error');
        }
        
        state.pendingRequests = Math.max(0, state.pendingRequests - 1);
      })
      // Logout
      .addCase(logout.pending, (state) => {
        console.log('[authSlice] Logout pending');
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        console.log('[authSlice] Logout fulfilled');
        state.isLoading = false;
        state.user = null;
        state.authError = null;
      })
      .addCase(logout.rejected, (state, action) => {
        console.log('[authSlice] Logout rejected with error:', action.payload);
        state.isLoading = false;
        state.authError = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        console.log('[authSlice] Register pending');
        state.isLoading = true;
        state.authError = null;
        state.verificationMessage = null;
        state.pendingRequests++;
      })
      .addCase(register.fulfilled, (state, action) => {
        console.log('[authSlice] Register fulfilled');
        state.isLoading = false;
        
        // Check if email verification is required
        if (action.payload.requiresEmailVerification) {
          console.log('[authSlice] Email verification required');
          state.verificationMessage = 'Please verify your email in order to login';
          state.user = null; // Don't set the user as logged in
        } else {
          state.user = action.payload;
          state.verificationMessage = null;
        }
        
        state.authError = null;
        state.pendingRequests = Math.max(0, state.pendingRequests - 1);
      })
      .addCase(register.rejected, (state, action) => {
        console.log('[authSlice] Register rejected with error:', action.payload);
        state.isLoading = false;
        
        // Only set error if it's not a cancellation
        if (action.payload !== 'Request was cancelled') {
          state.authError = action.payload as string;
          state.user = null;
        } else {
          console.log('[authSlice] Registration request was cancelled, not setting error');
        }
        
        state.pendingRequests = Math.max(0, state.pendingRequests - 1);
      })
      // Get current session
      .addCase(getCurrentSession.pending, (state) => {
        console.log('[authSlice] Get session pending');
        state.isLoading = true;
      })
      .addCase(getCurrentSession.fulfilled, (state, action) => {
        console.log('[authSlice] Get session fulfilled');
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentSession.rejected, (state, action) => {
        console.log('[authSlice] Get session rejected with error:', action.payload);
        state.isLoading = false;
        state.authError = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setUser,
  setCurrentPage,
  abortRequests,
  setVerificationMessage
} = authSlice.actions;
export default authSlice.reducer; 