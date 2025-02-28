import React from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';
import { User } from '../../types/auth';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  const handleTitleClick = () => {
    if (!isLandingPage) {
      navigate('/projects');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        user={user} 
        onLogout={onLogout}
        onTitleClick={handleTitleClick}
        onProjectsClick={() => navigate('/projects')}
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