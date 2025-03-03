// src/App.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import { Layout } from './components/layout/Layout';
import { useAppSelector, useAppDispatch } from './store/store';
import { logout, getCurrentSession } from './store/slices/authSlice';
import { useLocationChangeEffect } from './hooks/useLocationChangeEffect';

/**
 * AppContent component handles the main application logic and layout
 * It manages authentication state and navigation
 * 
 * @returns {JSX.Element} The main application content
 */
const AppContent: React.FC = () => {
  const { user, authError } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Use our custom hook to track location changes
  useLocationChangeEffect();
  
  // Get the current user session when the app loads
  useEffect(() => {
    console.log('[AppContent] Checking for existing session');
    dispatch(getCurrentSession());
  }, [dispatch]);

  const handleTitleClick = () => {
    navigate('/');
  };

  const handleProjectsClick = () => {
    navigate('/projects');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Layout
      user={user}
      authError={authError}
      onLoginClick={handleLoginClick}
      onLogout={() => dispatch(logout())}
      onTitleClick={handleTitleClick}
      onProjectsClick={handleProjectsClick}
    >
      <AppRoutes />
    </Layout>
  );
};

/**
 * App component is the root component of the application
 * It provides the Redux store and other providers
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