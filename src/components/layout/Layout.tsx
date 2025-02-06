import React from 'react';
import { Container, Paper } from '@mui/material';
import { Header } from './Header';
import { User } from '../../types/auth';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => (
  <Container maxWidth="lg" sx={{ 
    mt: 4, 
    mb: 4,
    '& .MuiPaper-root': {
      p: 4,
      background: 'linear-gradient(to right bottom, #ffffff, #f8fafb)',
    }
  }}>
    <Paper sx={{ p: 4 }}>
      <Header user={user} onLogout={onLogout} />
      {children}
    </Paper>
  </Container>
); 