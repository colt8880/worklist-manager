// src/App.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './components/auth/hooks/useAuth';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import { AuthLayout } from './components/auth/AuthLayout';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { LoginCredentials } from './types/auth';

/**
 * AppContent component handles the main application logic and layout
 * It manages authentication state and navigation
 * 
 * @returns {JSX.Element} The main application content
 */
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

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      setIsLoginOpen(false);
      navigate('/projects');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (!user) {
    return (
      <AuthLayout
        user={user}
        authError={authError}
        isLoginOpen={isLoginOpen}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogin={handleLogin}
        onLogout={logout}
        onTitleClick={handleTitleClick}
        onProjectsClick={handleProjectsClick}
        onLoginClose={() => setIsLoginOpen(false)}
      >
        <AppRoutes user={user} />
      </AuthLayout>
    );
  }

  return (
    <AuthenticatedLayout
      user={user}
      onLogout={logout}
      onTitleClick={handleTitleClick}
      onProjectsClick={handleProjectsClick}
    >
      <AppRoutes user={user} />
    </AuthenticatedLayout>
  );
};

/**
 * App component is the root component of the application
 * It provides necessary context providers and renders the main content
 * 
 * @returns {JSX.Element} The root application component
 */
const App: React.FC = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;