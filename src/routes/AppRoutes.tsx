import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useRouteGuard } from '../hooks/useRouteGuard';
import { useLocationChangeEffect } from '../hooks/useLocationChangeEffect';
import { useAppDispatch } from '../store/store';
import { clearError } from '../store/slices/authSlice';

// Lazy load components
const LandingPage = React.lazy(() => import('../components/landing/LandingPage'));
const ProjectsView = React.lazy(() => import('../components/projects/ProjectsView'));
const LoginPage = React.lazy(() => import('../components/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('../components/auth/RegisterPage'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
  </Box>
);

/**
 * RouteErrorClearer component
 * This component clears auth errors and aborts pending requests when routes change
 */
const RouteErrorClearer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // Clear errors and abort pending requests on route change
  useEffect(() => {
    console.log('[RouteErrorClearer] Route changed, clearing errors and aborting requests');
    dispatch(clearError());
    dispatch({ type: 'auth/abortRequests' });
  }, [location.pathname, dispatch]);
  
  return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useRouteGuard({ requireAuth: true, redirectTo: '/' });
  return isAuthenticated ? <>{children}</> : null;
};

/**
 * AppRoutes component handles all routing logic for the application
 * It uses code splitting and route guards for better performance and security
 * 
 * @returns {JSX.Element} The router configuration
 */
export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useRouteGuard();
  
  // Use our custom hook to track location changes
  useLocationChangeEffect();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouteErrorClearer>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/projects" replace />
              ) : (
                <LandingPage />
              )
            }
          />
          
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/projects" replace />
              ) : (
                <LoginPage />
              )
            }
          />
          
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/projects" replace />
              ) : (
                <RegisterPage />
              )
            }
          />

          {/* Protected routes */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectsView />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouteErrorClearer>
    </Suspense>
  );
}; 