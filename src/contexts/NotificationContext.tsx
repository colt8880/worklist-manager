import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, Snackbar, Button } from '@mui/material';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextType {
  showNotification: (
    message: string, 
    type: NotificationType,
    retryAction?: () => void,
    retryLabel?: string
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');
  const [retryAction, setRetryAction] = useState<(() => void) | undefined>();
  const [retryLabel, setRetryLabel] = useState<string | undefined>();

  const showNotification = useCallback((
    message: string, 
    type: NotificationType,
    retryAction?: () => void,
    retryLabel?: string
  ) => {
    setMessage(message);
    setType(type);
    setRetryAction(retryAction);
    setRetryLabel(retryLabel);
    setOpen(true);
  }, []);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleRetry = () => {
    handleClose();
    retryAction?.();
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={type} 
          sx={{ width: '100%' }}
          action={
            retryAction && (
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRetry}
              >
                {retryLabel || 'Retry'}
              </Button>
            )
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}; 