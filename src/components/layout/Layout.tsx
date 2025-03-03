import React from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';
import { Footer } from './Footer';
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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Header 
        user={user} 
        onLogout={onLogout}
        onTitleClick={handleTitleClick}
        onProjectsClick={() => navigate('/projects')}
      />
      <Box 
        component="main" 
        sx={{ 
          flex: '1 0 auto',
          width: '100%',
          position: 'relative',
          ...(isLandingPage ? {
            p: 0,
            mt: 0
          } : {
            p: 3,
            mt: '64px'
          })
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