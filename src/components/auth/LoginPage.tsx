import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, Container, Paper, Link } from '@mui/material';
import { LoginCredentials } from '../../types/auth';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { login, clearError } from '../../store/slices/authSlice';
import AuthErrorHandler from './AuthErrorHandler';

/**
 * LoginPage component provides a full page login experience
 * 
 * @returns {JSX.Element} The login page
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { authError, isLoading } = useAppSelector((state) => state.auth);
  const isMounted = useRef(true);

  // Set up the mounted ref
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    try {
      console.log('[LoginPage] Attempting login');
      const resultAction = await dispatch(login({ username: email, password })).unwrap();
      
      // Only navigate if the component is still mounted
      if (isMounted.current) {
        navigate('/projects');
      }
    } catch (err) {
      console.error('[LoginPage] Login error:', err);
      // Only process the error if the component is still mounted
      if (!isMounted.current) {
        // If component unmounted, clear the error
        dispatch(clearError());
      }
    }
  };

  const handleBackToHome = () => {
    console.log('[LoginPage] Navigating back to home');
    dispatch(clearError()); // Explicitly clear errors before navigation
    navigate('/');
  };

  const handleGoToRegister = () => {
    console.log('[LoginPage] Navigating to register');
    dispatch(clearError()); // Explicitly clear errors before navigation
    navigate('/register');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(5px)',
      }}
    >
      <AuthErrorHandler />
      
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToHome}
            sx={{ position: 'absolute', top: 16, left: 16 }}
          >
            Back
          </Button>
          
          <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center', mt: 2 }}>
            Welcome Back
          </Typography>
          
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {authError && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {authError}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              inputProps={{ 'data-testid': 'password-input' }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={handleGoToRegister}
                  sx={{ fontWeight: 'bold' }}
                >
                  Create an Account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage; 