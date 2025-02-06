// src/App.tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import { Layout } from './components/layout/Layout';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { ProjectsView } from './components/projects/ProjectsView';
import { useAuth } from './components/auth/hooks/useAuth';
import { Login } from './components/auth/Login';

const App: React.FC = () => {
  const { user, authError, login, logout } = useAuth();

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <Login onLogin={login} error={authError} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <ProjectsProvider username={user.username}>
        <Layout user={user} onLogout={logout}>
          <ProjectsView />
        </Layout>
      </ProjectsProvider>
    </ThemeProvider>
  );
};

export default App;