import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProjectsView } from '../components/projects/ProjectsView';
import { LandingPage } from '../components/landing/LandingPage';
import { User } from '../types/auth';

interface AppRoutesProps {
  user: User | null;
}

/**
 * AppRoutes component handles all routing logic for the application
 * It renders different routes based on authentication status
 * 
 * @param {AppRoutesProps} props - Component props
 * @returns {JSX.Element} The router configuration
 */
export const AppRoutes: React.FC<AppRoutesProps> = ({ user }) => {
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="/projects" element={<ProjectsView />} />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}; 