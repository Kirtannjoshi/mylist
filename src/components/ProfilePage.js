import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SyncIcon from '@mui/icons-material/Sync';
import MovieIcon from '@mui/icons-material/Movie';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import FlightIcon from '@mui/icons-material/Flight';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import DoneIcon from '@mui/icons-material/Done';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage({ userData, onSyncData }) {
  const { user, logout, getUserStats, syncing, loadUserData } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);
  const navigate = useNavigate();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const userStats = await getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, [getUserStats]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, loadStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSync = async () => {
    try {
      await onSyncData(userData);
      setSynced(true);
      setTimeout(() => setSynced(false), 2000);
      await loadStats(); // Refresh stats after sync
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await loadUserData();
      await loadStats();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Profile
        </Typography>
      </Box>

      {/* Profile Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              <AccountCircleIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {user.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Member since {stats ? new Date(stats.createdAt).toLocaleDateString() : '...'}
              </Typography>
              {stats && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Last active: {new Date(stats.lastActive).toLocaleString()}
                </Typography>
              )}
            </Box>
            <IconButton 
              color="error" 
              onClick={handleLogout}
              sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>

          {/* Sync Controls */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={syncing ? <CircularProgress size={16} /> : <SyncIcon />}
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? 'Syncing...' : 'Sync Data'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </Button>
              {synced && (
                <Alert severity="success" sx={{ py: 0.5 }}>
                  <Typography variant="body2">Data synced successfully!</Typography>
                </Alert>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MovieIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats?.totalMedia || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Movies & Shows
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats?.totalTodos || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To-Do Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats?.totalBucket || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bucket List
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <FlightIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats?.totalTravel || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Travel Plans
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Entertainment Stats */}
      {stats && stats.totalMedia > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Entertainment Progress
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <DoneIcon color="success" sx={{ fontSize: 24, mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.completed || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <PlayCircleIcon color="primary" sx={{ fontSize: 24, mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.watching || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Currently Watching
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
