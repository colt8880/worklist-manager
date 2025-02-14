import { useState } from 'react';
import { User, LoginCredentials } from '../../../types/auth';
import { supabase } from '../../../config/supabase';

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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    try {
      const email = isValidEmail(credentials.username) ? credentials.username : `${credentials.username}@example.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.user) {
        setUser({ 
          username: credentials.username,
          email: data.user.email || '',
          id: data.user.id 
        });
        setAuthError(null);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      throw error; // Throw the original error
    }
  };

  const register = async (credentials: LoginCredentials) => {
    try {
      console.log('Starting registration for:', credentials.username);
      const email = isValidEmail(credentials.username) ? credentials.username : `${credentials.username}@example.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      // Check if user already exists (Supabase returns a user object with no identities array for existing users)
      if (data.user && !data.user.identities?.length) {
        const error = new Error('This email is already registered. Please try logging in instead.');
        error.name = 'UserExistsError';
        throw error;
      }

      if (data.user) {
        console.log('User created successfully:', data.user);
        setUser({ 
          username: credentials.username,
          email: data.user.email || '',
          id: data.user.id 
        });
        setAuthError(null);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setAuthError(null);
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      throw error; // Throw the original error
    }
  };

  return {
    user,
    authError,
    login,
    register,
    logout,
  };
}; 