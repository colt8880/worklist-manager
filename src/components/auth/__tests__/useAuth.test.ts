import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { supabase } from '../../../config/supabase';
import authReducer, { login, register, logout } from '../../../store/slices/authSlice';
import React from 'react';

// Mock Supabase client
jest.mock('../../../config/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

// Create a test store wrapper
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};

// Remove wrapper as it's not needed for these tests
describe('Auth Redux Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully log in a user with email', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const store = createTestStore();
      
      await store.dispatch(login({
        username: 'test@example.com',
        password: 'password123',
      }));

      const state = store.getState();
      expect(state.auth.user).toEqual({
        username: 'test@example.com',
        email: mockUser.email,
        id: mockUser.id,
      });
      expect(state.auth.authError).toBeNull();
    });

    it('should handle login error', async () => {
      const mockError = new Error('Invalid login credentials');
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: mockError,
      });

      const store = createTestStore();

      await store.dispatch(login({
        username: 'test@example.com',
        password: 'wrong-password',
      }));

      const state = store.getState();
      expect(state.auth.user).toBeNull();
      expect(state.auth.authError).toBe(mockError.message);
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '123',
        email: 'new@example.com',
        identities: [{ id: '1' }],
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const store = createTestStore();

      
      const state = store.getState();
      expect(state.auth.user).toEqual({
        username: 'new@example.com',
        email: mockUser.email,
        id: mockUser.id,
      });
      expect(state.auth.authError).toBeNull();
    });

    it('should handle registration error for existing user', async () => {
      const mockUser = {
        id: '123',
        email: 'existing@example.com',
        identities: [],
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const store = createTestStore();


      const state = store.getState();
      expect(state.auth.user).toBeNull();
      expect(state.auth.authError).toBe('This email is already registered. Please try logging in instead.');
    });
  });

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      const store = createTestStore({
        auth: {
          user: {
            username: 'test@example.com',
            email: 'test@example.com',
            id: '123',
          },
          authError: null,
          isLoading: false,
        },
      });

      await store.dispatch(logout());

      const state = store.getState();
      expect(state.auth.user).toBeNull();
      expect(state.auth.authError).toBeNull();
    });

    it('should handle logout error', async () => {
      const mockError = new Error('Network error');
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: mockError,
      });

      const store = createTestStore({
        auth: {
          user: {
            username: 'test@example.com',
            email: 'test@example.com',
            id: '123',
          },
          authError: null,
          isLoading: false,
        },
      });

      await store.dispatch(logout());

      const state = store.getState();
      expect(state.auth.authError).toBe(mockError.message);
    });
  });
}); 