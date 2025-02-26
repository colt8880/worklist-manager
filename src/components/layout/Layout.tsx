import React from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';
import { User } from '../../types/auth';
import { useLocation } from 'react-router-dom';
import { useProjects } from '../../contexts/useProjects';

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
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const { goToProjectsList } = useProjects();

  const handleTitleClick = () => {
    if (!isLandingPage) {
      goToProjectsList();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        user={user} 
        onLogout={onLogout}
        onTitleClick={handleTitleClick}
        onProjectsClick={goToProjectsList}
      />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          ...(isLandingPage ? {
            p: 0, // No padding for landing page
            mt: 0  // No margin for landing page
          } : {
            p: 3,
            mt: '64px' // Add margin-top equal to header height for other pages
          })
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 