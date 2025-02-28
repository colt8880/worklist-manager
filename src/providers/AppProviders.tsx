import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme/theme';
import { Notification } from '../components/notifications/Notification';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders component wraps the application with necessary providers
 * This includes routing, theme management, and global UI components
 * 
 * @param {AppProvidersProps} props - Component props
 * @returns {JSX.Element} The provider wrapper
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
        <Notification />
      </ThemeProvider>
    </BrowserRouter>
  );
}; 