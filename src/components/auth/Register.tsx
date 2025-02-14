import React, { useState, ReactNode } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from './hooks/useAuth';

interface RegisterProps {
  open: boolean;
  onClose: () => void;
  onLoginClick?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ 
  open, 
  onClose,
  onLoginClick 
}) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<ReactNode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsSubmitting(false);
      return;
    }

    try {
      await register({ username: email, password });
      // Only close and clear if registration was successful
      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      
      // If the error indicates the user already exists, show the login link
      if (errorMessage.includes('already registered')) {
        setError(
          <Box>
            <Typography component="span">
              {errorMessage}{' '}
            </Typography>
            <Button
              color="primary"
              size="small"
              onClick={() => {
                handleClose();
                onLoginClick?.();
              }}
              sx={{ ml: 1 }}
            >
              Login Instead
            </Button>
          </Box>
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clear everything when closing
    setError(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Create Account</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                error.toString().includes('already registered') && (
                  <Button 
                    color="primary"
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      handleClose();
                      onLoginClick?.();
                    }}
                  >
                    Switch to Login
                  </Button>
                )
              }
            >
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            disabled={isSubmitting}
            error={!!error && error.toString().includes('email')}
          />
          
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            error={!!error && error.toString().includes('password')}
          />
          
          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
            error={!!error && error.toString().includes('password')}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 