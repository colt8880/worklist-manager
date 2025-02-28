import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Container, 
  Paper, 
  Link,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { register, clearError, setVerificationMessage } from '../../store/slices/authSlice';
import AuthErrorHandler from './AuthErrorHandler';

/**
 * RegisterPage component provides a full page registration experience
 * 
 * @returns {JSX.Element} The registration page
 */
const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { authError, isLoading, verificationMessage } = useAppSelector((state) => state.auth);
  const isMounted = useRef(true);

  // Set up the mounted ref
  useEffect(() => {
    isMounted.current = true;
    
    // Clear any verification message when component mounts
    dispatch(setVerificationMessage(null));
    
    return () => {
      isMounted.current = false;
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName || !zipCode) return;
    
    try {
      console.log('[RegisterPage] Attempting registration');
      const resultAction = await dispatch(register({ 
        username: email, 
        password,
        firstName,
        lastName,
        zipCode
      })).unwrap();
      
      // Only navigate if the component is still mounted and email verification is not required
      if (isMounted.current && !resultAction.requiresEmailVerification) {
        navigate('/projects');
      }
    } catch (err) {
      console.error('[RegisterPage] Registration error:', err);
      // Only process the error if the component is still mounted
      if (!isMounted.current) {
        // If component unmounted, clear the error
        dispatch(clearError());
      }
    }
  };

  const handleBackToHome = () => {
    console.log('[RegisterPage] Navigating back to home');
    dispatch(clearError());
    dispatch(setVerificationMessage(null));
    navigate('/');
  };

  const handleGoToLogin = () => {
    console.log('[RegisterPage] Navigating to login');
    dispatch(clearError());
    dispatch(setVerificationMessage(null));
    navigate('/login');
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
        overflowY: 'auto',
        py: 4
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
            Create Your Account
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
            
            {verificationMessage && (
              <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
                {verificationMessage}
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  margin="normal"
                  required
                />
              </Grid>
            </Grid>
            
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
            />
            
            <TextField
              fullWidth
              label="Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || !!verificationMessage}
            >
              {isLoading ? 'Creating Account...' : verificationMessage ? 'Check Your Email' : 'Create Account'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={handleGoToLogin}
                  sx={{ fontWeight: 'bold' }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage; 