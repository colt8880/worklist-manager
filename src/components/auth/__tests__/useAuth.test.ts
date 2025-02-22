import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../../config/supabase';

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

describe('useAuth', () => {
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

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({
          username: 'test@example.com',
          password: 'password123',
        });
      });

      expect(result.current.user).toEqual({
        username: 'test@example.com',
        email: mockUser.email,
        id: mockUser.id,
      });
      expect(result.current.authError).toBeNull();
    });

    it('should handle login error', async () => {
      const mockError = new Error('Invalid login credentials');
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.login({
            username: 'test@example.com',
            password: 'wrong-password',
          });
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.authError).toBe('Invalid email or password. Please try again.');
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

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({
          username: 'new@example.com',
          password: 'password123',
        });
      });

      expect(result.current.user).toEqual({
        username: 'new@example.com',
        email: mockUser.email,
        id: mockUser.id,
      });
      expect(result.current.authError).toBeNull();
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

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.register({
            username: 'existing@example.com',
            password: 'password123',
          });
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.authError).toBe('This email is already registered. Please try logging in instead.');
    });
  });

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      // First set a user
      act(() => {
        result.current.setUser({
          username: 'test@example.com',
          email: 'test@example.com',
          id: '123',
        });
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.authError).toBeNull();
    });

    it('should handle logout error', async () => {
      const mockError = new Error('Network error');
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.logout();
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.authError).toBe('Network error');
    });
  });
}); 