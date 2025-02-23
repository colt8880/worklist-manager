import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme/theme';
import { NotificationProvider } from '../contexts/NotificationContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders component wraps the application with necessary providers
 * This includes routing, theme management, and notifications
 * 
 * @param {AppProvidersProps} props - Component props
 * @returns {JSX.Element} The provider wrapper
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}; 