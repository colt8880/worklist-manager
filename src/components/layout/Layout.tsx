import React from 'react';
import { Box, Container } from '@mui/material';
import { Header } from './Header';
import { Footer } from './Footer';
import { User } from '../../types/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../navigation/Breadcrumbs';

export interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  authError?: string | null;
  onLogout: () => void;
  onLoginClick?: () => void;
  onTitleClick: () => void;
  onProjectsClick: () => void;
}

/**
 * Layout component that handles both authenticated and unauthenticated layouts
 * Provides consistent header, footer, and content area styling
 * Footer only shows on unauthenticated pages
 * 
 * @param {LayoutProps} props Component props
 * @returns {JSX.Element} The layout component
 */
export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  authError,
  onLogout,
  onLoginClick,
  onTitleClick,
  onProjectsClick
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAuthenticated = !!user;

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
      ...(isAuthenticated && !isLandingPage ? {
        height: '100vh',
        overflow: 'hidden'
      } : {
        height: 'auto',
        overflow: 'visible'
      })
    }}>
      <Header 
        user={user} 
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        onTitleClick={handleTitleClick}
        onProjectsClick={() => navigate('/projects')}
      />
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          width: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          ...(isAuthenticated && !isLandingPage ? {
            overflow: 'auto',
            mt: '64px',
            mb: 0
          } : {
            overflow: 'visible',
            p: 0,
            mt: 0
          })
        }}
      >
        {isAuthenticated && !isLandingPage && !isAuthPage ? (
          <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              mt: 3, 
              mb: 3,
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Breadcrumbs />
              {children}
            </Box>
          </Container>
        ) : (
          children
        )}
      </Box>
      {!isAuthenticated && (
        <Box 
          sx={{ 
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            flexShrink: 0,
            backgroundColor: (theme) => theme.palette.primary.main
          }}
        >
          <Footer />
        </Box>
      )}
    </Box>
  );
}; 