import React from 'react';
import { Box, Container } from '@mui/material';
import { Layout } from './Layout';
import { User } from '../../types/auth';
import { Breadcrumbs } from '../navigation/Breadcrumbs';

export interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onTitleClick: () => void;
  onProjectsClick: () => void;
}

/**
 * AuthenticatedLayout component handles the layout for authenticated users
 * It includes the header, breadcrumbs, and main content
 * 
 * @param {AuthenticatedLayoutProps} props - Component props
 * @returns {JSX.Element} The authenticated layout
 */
export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  user,
  onLogout,
  onTitleClick,
  onProjectsClick,
}) => {
  return (
    <Layout
      user={user}
      onLogout={onLogout}
      onTitleClick={onTitleClick}
      onProjectsClick={onProjectsClick}
    >
      <Container maxWidth="lg">
        <Box sx={{ mt: 3 }}>
          <Breadcrumbs />
          {children}
        </Box>
      </Container>
    </Layout>
  );
}; 