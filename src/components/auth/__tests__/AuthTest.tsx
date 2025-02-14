import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Alert, TextField } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../../config/supabase';

export const AuthTest: React.FC = () => {
  const { user, login, register, logout } = useAuth();
  const [status, setStatus] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testAccount, setTestAccount] = useState<{email: string, password: string} | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const clearStatus = () => {
    setStatus([]);
    setError(null);
  };

  // Test registration
  const testRegistration = async () => {
    try {
      if (!testEmail) {
        setError('Please enter a test email address');
        return;
      }

      const testPassword = 'Test123!@#';
      addStatus(`Attempting to register with ${testEmail}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            username: testEmail,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setTestAccount({ email: testEmail, password: testPassword });
        addStatus('Registration successful');
        addStatus(`User ID: ${data.user.id}`);
        addStatus(`Email confirmed: ${data.user.confirmed_at ? 'Yes' : 'No'}`);
        addStatus(`Email verification status: ${data.user.email_confirmed_at ? 'Confirmed' : 'Pending'}`);
        
        if (!data.user.email_confirmed_at) {
          addStatus('⚠️ Please check your email and verify your account before logging in');
        }
        
        addStatus(`Full user data: ${JSON.stringify(data.user, null, 2)}`);
        addStatus('✅ Test account created and stored for login test');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      addStatus(`Registration error: ${errorMessage}`);
    }
  };

  // Test login
  const testLogin = async () => {
    try {
      if (!testAccount) {
        addStatus('⚠️ No test account available. Please register first.');
        return;
      }

      addStatus(`Attempting to login with ${testAccount.email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testAccount.email,
        password: testAccount.password
      });

      if (error) throw error;

      if (data.user) {
        addStatus('Login successful');
        addStatus(`User ID: ${data.user.id}`);
        addStatus(`Email confirmed: ${data.user.confirmed_at ? 'Yes' : 'No'}`);
        addStatus(`Full user data: ${JSON.stringify(data.user, null, 2)}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      addStatus(`Login error: ${errorMessage}`);
    }
  };

  // Test logout
  const testLogout = async () => {
    try {
      addStatus('Attempting to logout');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      addStatus('Logout successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      addStatus(`Logout error: ${errorMessage}`);
    }
  };

  // Test session persistence
  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      addStatus(`Current session: ${session ? 'Active' : 'None'}`);
      if (session) {
        addStatus(`Session user ID: ${session.user.id}`);
        addStatus(`Email confirmed: ${session.user.email_confirmed_at ? 'Yes' : 'No'}`);
        addStatus(`Full session data: ${JSON.stringify(session, null, 2)}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Session check failed';
      setError(errorMessage);
      addStatus(`Session check error: ${errorMessage}`);
    }
  };

  // Delete test user
  const deleteTestUser = async () => {
    try {
      if (!testAccount) {
        addStatus('⚠️ No test account available to delete');
        return;
      }

      // First sign in as the user to delete (if not already signed in)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testAccount.email,
        password: testAccount.password
      });

      if (signInError) throw signInError;

      // Delete the user
      const { error: deleteError } = await supabase.rpc('delete_user');
      
      if (deleteError) throw deleteError;

      addStatus('User deleted successfully');
      setTestAccount(null);
      setTestEmail('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      addStatus(`Delete user error: ${errorMessage}`);
    }
  };

  useEffect(() => {
    // Check initial session on mount
    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addStatus(`Auth state changed: ${event}`);
      if (session) {
        addStatus('Session updated');
        addStatus(`User ID: ${session.user.id}`);
        addStatus(`Email confirmed: ${session.user.email_confirmed_at ? 'Yes' : 'No'}`);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Auth Flow Test
      </Typography>

      {testAccount && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Test Account: {testAccount.email}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Test Email"
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Enter a valid email for testing"
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          onClick={testRegistration} 
          sx={{ mr: 1 }}
          disabled={!testEmail}
        >
          Test Registration
        </Button>
        <Button 
          variant="contained" 
          onClick={testLogin} 
          sx={{ mr: 1 }}
          disabled={!testAccount}
        >
          Test Login
        </Button>
        <Button 
          variant="contained" 
          onClick={testLogout} 
          sx={{ mr: 1 }}
        >
          Test Logout
        </Button>
        <Button 
          variant="contained" 
          onClick={checkSession} 
          sx={{ mr: 1 }}
        >
          Check Session
        </Button>
        <Button 
          variant="contained" 
          onClick={deleteTestUser}
          sx={{ mr: 1 }}
          color="error"
          disabled={!testAccount}
        >
          Delete User
        </Button>
        <Button 
          variant="outlined" 
          onClick={clearStatus} 
          color="secondary"
        >
          Clear Log
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Test Log
        </Typography>
        {status.map((message, index) => (
          <Typography 
            key={index} 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              mb: 1
            }}
          >
            {message}
          </Typography>
        ))}
      </Paper>
    </Box>
  );
}; 