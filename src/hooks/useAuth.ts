import { useState } from 'react';
import { User, LoginCredentials } from '../types/auth';

const mockAuth = (credentials: LoginCredentials): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'password') {
        resolve({ username: credentials.username, isAuthenticated: true });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthError(null);
      const authenticatedUser = await mockAuth(credentials);
      setUser(authenticatedUser);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return { user, authError, login, logout };
}; 