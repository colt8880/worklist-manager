import React from 'react';
import { Box, Container } from '@mui/material';
import { User } from '../../types/auth';
import { Header } from '../layout/Header';
import { Login } from './Login';

interface AuthLayoutProps {
  user: User | null;
  authError: string | null;
  isLoginOpen: boolean;
  onLoginClick: () => void;
  onLogin: (credentials: any) => Promise<void>;
  onLogout: () => void;
  onTitleClick: () => void;
  onProjectsClick: () => void;
  onLoginClose: () => void;
  children: React.ReactNode;
}

/**
 * AuthLayout component handles the layout for unauthenticated users
 * It includes the header, login dialog, and main content
 * 
 * @param {AuthLayoutProps} props - Component props
 * @returns {JSX.Element} The auth layout
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  user,
  authError,
  isLoginOpen,
  onLoginClick,
  onLogin,
  onLogout,
  onTitleClick,
  onProjectsClick,
  onLoginClose,
  children
}) => {
  return (
    <>
      <Header 
        user={user} 
        onLogout={onLogout} 
        onLoginClick={onLoginClick}
        onTitleClick={onTitleClick}
        onProjectsClick={onProjectsClick}
      />
      <Container maxWidth="lg">
        <Box sx={{ mt: 3 }}>
          {children}
        </Box>
      </Container>
      <Login 
        open={isLoginOpen}
        onClose={onLoginClose}
        onLogin={onLogin}
        error={authError}
      />
    </>
  );
}; 