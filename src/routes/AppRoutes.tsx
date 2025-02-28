import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useRouteGuard } from '../hooks/useRouteGuard';

// Lazy load components
const LandingPage = React.lazy(() => import('../components/landing/LandingPage'));
const ProjectsView = React.lazy(() => import('../components/projects/ProjectsView'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
  </Box>
);

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

  return (
    <Suspense fallback={<LoadingFallback />}>
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
    </Suspense>
  );
}; 