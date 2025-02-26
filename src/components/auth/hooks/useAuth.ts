import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { User, LoginCredentials, AuthState } from '../../../types/auth';

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to get a user-friendly error message
const getAuthErrorMessage = (error: any): string => {
  console.log('Raw error:', error); // Debug log

  // Handle specific Supabase error messages
  if (error?.message?.includes('User already registered')) {
    return 'This email is already registered. Please try logging in instead.';
  }
  if (error?.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (error?.message?.includes('Email not confirmed')) {
    return 'Please verify your email address before logging in.';
  }
  // Return the original error message if no specific case matches
  return error?.message || 'An unexpected error occurred';
};

/**
 * Custom hook for handling authentication
 * Provides login, logout, and auth state management
 * 
 * @returns {Object} Authentication methods and state
 */
export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    authError: null
  });

  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user, authError: null }));
  }, []);

  const setAuthError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, authError: error }));
  }, []);

  // Add session restoration on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          username: session.user.email || '',
          email: session.user.email || ''
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          username: session.user.email || '',
          email: session.user.email || ''
        });
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.username,
        password: credentials.password
      });

      if (error) throw error;

      // Set session expiry to 24 hours after successful login
      await supabase.auth.setSession({
        access_token: data.session?.access_token || '',
        refresh_token: data.session?.refresh_token || ''
      });

      if (data.user) {
        setUser({
          id: data.user.id,
          username: data.user.email || '',
          email: data.user.email || ''
        });
      }
    } catch (error) {
      setAuthError('Invalid email or password. Please try again.');
      throw error;
    }
  }, [setUser, setAuthError]);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError('An error occurred during logout');
      }
      throw error;
    }
  }, [setUser, setAuthError]);

  const register = useCallback(async (credentials: LoginCredentials) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.username,
        password: credentials.password
      });

      if (error) throw error;

      if (data.user?.identities?.length === 0) {
        throw new Error('This email is already registered. Please try logging in instead.');
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          username: data.user.email || '',
          email: data.user.email || ''
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError('An error occurred during registration');
      }
      throw error;
    }
  }, [setUser, setAuthError]);

  return {
    ...state,
    login,
    logout,
    register,
    setUser
  };
}; 