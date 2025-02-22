/**
 * Represents a user in the application
 */
export interface User {
  id: string;
  username: string;
  email: string;
}

/**
 * Represents login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Represents the authentication state
 */
export interface AuthState {
  user: User | null;
  authError: string | null;
}

/**
 * Represents the authentication context
 */
export interface AuthContext extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: LoginCredentials) => Promise<void>;
} 