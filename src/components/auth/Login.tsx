import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Dialog } from '@mui/material';
import { LoginCredentials } from '../../types/auth';

interface LoginProps {
  open: boolean;
  onClose: () => void;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  error?: string | null;
}

export const Login: React.FC<LoginProps> = ({ open, onClose, onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin({ username: email, password });
    // Only clear form if login fails (error handling is managed by parent)
    if (error) {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h2" sx={{ mb: 4, textAlign: 'center' }}>
          Welcome Back
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
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
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
        >
          Login
        </Button>
      </Box>
    </Dialog>
  );
}; 