import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { LoginCredentials } from '../../types/auth';

interface LoginProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  error?: string | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ username, password });
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
          Worklist Manager
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
    </Box>
  );
}; 