import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setLoading(true);
    
    try {
      if (needsRegistration) {
        const result = await register(username.trim());
        setMessage(result.message);
        setTimeout(() => navigate('/'), 1500);
      } else {
        const result = await login(username.trim());
        if (result.success) {
          setMessage(result.message);
          setTimeout(() => navigate('/'), 1500);
        } else if (result.needsRegistration) {
          setNeedsRegistration(true);
          setMessage(`Username "${username.trim()}" not found. Create a new account?`);
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setNeedsRegistration(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setError('');
    setMessage('');
    setNeedsRegistration(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Card sx={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: 3,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)'
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <AccountCircleIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                myLIST
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {needsRegistration ? 'Create Your Account' : 'Welcome Back'}
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
                sx={{ mb: 3 }}
                helperText="Enter your unique username (3+ characters)"
                inputProps={{ 
                  maxLength: 20,
                  pattern: "[a-zA-Z0-9_-]+",
                  title: "Only letters, numbers, underscore and dash allowed"
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {message && (
                <Alert severity={needsRegistration ? "info" : "success"} sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !username.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : 
                  needsRegistration ? <PersonAddIcon /> : <LoginIcon />}
                sx={{ mb: 2, py: 1.5 }}
              >
                {loading ? 'Please wait...' : 
                 needsRegistration ? 'Create Account' : 'Continue'}
              </Button>

              {needsRegistration && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={resetForm}
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  Back to Login
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Info */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Simple username-only authentication
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🔒 Your data syncs across all your devices
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
