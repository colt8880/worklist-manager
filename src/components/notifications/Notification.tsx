import React from 'react';
import { Alert, Snackbar, Button } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { hideNotification } from '../../store/slices/uiSlice';

/**
 * Global notification component that displays messages using Material-UI's Snackbar
 * Manages its state through Redux
 * 
 * @returns {JSX.Element} The notification component
 */
export const Notification: React.FC = () => {
  const dispatch = useAppDispatch();
  const { message, type, open, retryAction, retryLabel } = useAppSelector(state => state.ui.notification);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideNotification());
  };

  const handleRetry = () => {
    handleClose();
    retryAction?.();
  };

  return (
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
  );
}; 