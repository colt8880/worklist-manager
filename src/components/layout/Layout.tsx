import React from 'react';
import { Container, Paper } from '@mui/material';
import { Header } from './Header';
import { User } from '../../types/auth';
import { useProjects } from '../../contexts/useProjects';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const { setCurrentProject } = useProjects();

  const handleTitleClick = () => {
    setCurrentProject(null);
  };

  return (
    <>
      <Header 
        user={user} 
        onLogout={onLogout}
        onTitleClick={handleTitleClick}
      />
      <Container 
        maxWidth={false} 
        sx={{ 
          pt: '88px', // 64px header height + 24px spacing
          pb: 4,
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: '2560px',
          mx: 'auto',
          minHeight: '100vh',
          '& .MuiPaper-root': {
            p: 4,
            background: 'linear-gradient(to right bottom, #ffffff, #f8fafb)',
          }
        }}
      >
        <Paper sx={{ p: 4 }}>
          {children}
        </Paper>
      </Container>
    </>
  );
}; 