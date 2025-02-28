import React from 'react';
import { Box, Container } from '@mui/material';
import { User } from '../../types/auth';
import { Header } from '../layout/Header';
import { RegistrationData } from '../../types/auth';

interface AuthLayoutProps {
  user: User | null;
  authError: string | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onTitleClick: () => void;
  onProjectsClick: () => void;
  children: React.ReactNode;
}

/**
 * AuthLayout component handles the layout for unauthenticated users
 * It includes the header and main content
 * 
 * @param {AuthLayoutProps} props - Component props
 * @returns {JSX.Element} The auth layout
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  user,
  authError,
  onLoginClick,
  onLogout,
  onTitleClick,
  onProjectsClick,
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
    </>
  );
}; 