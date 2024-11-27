import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onModeChange: React.Dispatch<React.SetStateAction<'login' | 'signup'>>;
}

export function AuthModal({ open, onClose, initialMode = 'login', onModeChange }: AuthModalProps) {
  const [error, setError] = useState('');
  const { login, signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  useEffect(() => {
    onModeChange(initialMode);
  }, [initialMode, onModeChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (initialMode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await signup(formData);
        onModeChange('login');
        return;
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        color: 'black',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 1,
      }}>
        <Typography variant="h6" component="h2" mb={2} gutterBottom>
          {initialMode === 'login' ? 'Sign In' : 'Sign Up'}
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {initialMode === 'signup' && (
              <>
                <TextField
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <TextField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
                <TextField
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </>
            )}
            
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Button type="submit" variant="contained">
              {initialMode === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>

            <Button
              variant="text"
              onClick={() => onModeChange(initialMode === 'login' ? 'signup' : 'login')}
            >
              {initialMode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}