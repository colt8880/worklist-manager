/**
 * Represents a user in the application
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  zipCode?: string;
  requiresEmailVerification?: boolean;
}

/**
 * Represents login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Represents registration data with additional user information
 */
export interface RegistrationData extends LoginCredentials {
  firstName: string;
  lastName: string;
  zipCode: string;
}

/**
 * Represents the authentication state
 */
export interface AuthState {
  user: User | null;
  authError: string | null;
  verificationMessage?: string | null;
}

/**
 * Represents the authentication context
 */
export interface AuthContext extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
} 