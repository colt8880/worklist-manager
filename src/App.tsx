// src/App.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import { AuthLayout } from './components/auth/AuthLayout';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { useAppSelector, useAppDispatch } from './store/store';
import { login, logout } from './store/slices/authSlice';
import { setLoginDialogOpen } from './store/slices/uiSlice';
import { LoginCredentials } from './types/auth';

/**
 * AppContent component handles the main application logic and layout
 * It manages authentication state and navigation
 * 
 * @returns {JSX.Element} The main application content
 */
const AppContent: React.FC = () => {
  const { user, authError } = useAppSelector((state) => state.auth);
  const { isLoginOpen } = useAppSelector((state) => state.ui.dialog);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleTitleClick = () => {
    navigate('/');
  };

  const handleProjectsClick = () => {
    navigate('/projects');
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await dispatch(login(credentials)).unwrap();
      dispatch(setLoginDialogOpen(false));
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
        onLoginClick={() => dispatch(setLoginDialogOpen(true))}
        onLogin={handleLogin}
        onLogout={() => dispatch(logout())}
        onTitleClick={handleTitleClick}
        onProjectsClick={handleProjectsClick}
        onLoginClose={() => dispatch(setLoginDialogOpen(false))}
      >
        <AppRoutes />
      </AuthLayout>
    );
  }

  return (
    <AuthenticatedLayout
      user={user}
      onLogout={() => dispatch(logout())}
      onTitleClick={handleTitleClick}
      onProjectsClick={handleProjectsClick}
    >
      <AppRoutes />
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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppProviders>
          <AppContent />
        </AppProviders>
      </PersistGate>
    </Provider>
  );
};

export default App;