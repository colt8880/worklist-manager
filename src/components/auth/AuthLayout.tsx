import React from 'react';
import { Box, Container } from '@mui/material';
import { User } from '../../types/auth';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
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
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Header 
        user={user} 
        onLogout={onLogout} 
        onLoginClick={onLoginClick}
        onTitleClick={onTitleClick}
        onProjectsClick={onProjectsClick}
      />
      <Box 
        component="main"
        sx={{ 
          flex: '1 0 auto',
          width: '100%',
          position: 'relative'
        }}
      >
        {children}
      </Box>
      <Box 
        sx={{ 
          flex: '0 0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 10
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
}; 