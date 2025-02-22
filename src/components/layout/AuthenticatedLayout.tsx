import React from 'react';
import { Layout } from './Layout';
import { ProjectsProvider } from '../../contexts/ProjectsContext';
import { User } from '../../types/auth';

interface AuthenticatedLayoutProps {
  user: User;
  onLogout: () => void;
  onTitleClick: () => void;
  onProjectsClick: () => void;
  children: React.ReactNode;
}

/**
 * AuthenticatedLayout component wraps the main Layout with necessary providers
 * for authenticated users
 * 
 * @param {AuthenticatedLayoutProps} props - Component props
 * @returns {JSX.Element} The authenticated layout
 */
export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  user,
  onLogout,
  onTitleClick,
  onProjectsClick,
  children
}) => {
  return (
    <ProjectsProvider username={user.username}>
      <Layout
        user={user}
        onLogout={onLogout}
        onTitleClick={onTitleClick}
        onProjectsClick={onProjectsClick}
      >
        {children}
      </Layout>
    </ProjectsProvider>
  );
}; 