import React from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';
import { User } from '../../types/auth';

export interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onTitleClick: () => void;
  onProjectsClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout,
  onTitleClick,
  onProjectsClick 
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        user={user} 
        onLogout={onLogout}
        onTitleClick={onTitleClick}
        onProjectsClick={onProjectsClick}
      />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          mt: '64px' // Add margin-top equal to header height
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 