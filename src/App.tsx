// src/App.tsx
import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import { Layout } from './components/layout/Layout';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { ProjectsView } from './components/projects/ProjectsView';
import { useAuth } from './components/auth/hooks/useAuth';
import { Login } from './components/auth/Login';
import { LandingPage } from './components/landing/LandingPage';
import { Header } from './components/layout/Header';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const AppContent: React.FC = () => {
  const { user, authError, login, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const handleTitleClick = () => {
    navigate('/');
  };

  const handleProjectsClick = () => {
    navigate('/projects');
  };

  const handleLogin = async (credentials: any) => {
    try {
      await login(credentials);
      setIsLoginOpen(false); // Close the login dialog
      navigate('/projects'); // Navigate to projects page
    } catch (error) {
      // Error handling is already managed by useAuth
      console.error('Login error:', error);
    }
  };

  if (!user) {
    return (
      <>
        <Header 
          user={user} 
          onLogout={logout} 
          onLoginClick={() => setIsLoginOpen(true)}
          onTitleClick={handleTitleClick}
          onProjectsClick={handleProjectsClick}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Login 
          open={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
          error={authError}
        />
      </>
    );
  }

  return (
    <ProjectsProvider username={user.username}>
      <Layout 
        user={user} 
        onLogout={logout}
        onTitleClick={handleTitleClick}
        onProjectsClick={handleProjectsClick}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsView />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </Layout>
    </ProjectsProvider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;