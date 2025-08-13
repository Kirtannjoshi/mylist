import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import MediaCard from './MediaCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RecommendIcon from '@mui/icons-material/Recommend';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { getPersonalizedRecommendations } from '../utils/recommendations';

export default function HomePage({ savedMedia, onOpenDetail, onAddToLibrary }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Load personalized recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        const recs = await getPersonalizedRecommendations(savedMedia, 8);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, [savedMedia]);

  const recentlyCompleted = savedMedia.filter(m => m.status === 'completed').slice(0, 4);
  const currentlyWatching = savedMedia.filter(m => m.status === 'in-progress').slice(0, 4);

  return (
    <Box>
      {/* Hero Section */}
      <Card sx={{ 
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
        border: '1px solid',
        borderColor: 'divider',
        mb: 4,
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Welcome to myLIST
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Your personal entertainment companion
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip label={`${savedMedia.length} titles tracked`} color="primary" />
            <Chip label={`${savedMedia.filter(m => m.status === 'completed').length} completed`} color="success" />
            <Chip label={`${savedMedia.filter(m => m.status === 'in-progress').length} watching`} color="info" />
          </Stack>
        </CardContent>
      </Card>

      {/* Currently Watching */}
      {currentlyWatching.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Continue Watching
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {currentlyWatching.map((movie) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={movie.imdbID || movie.title}>
                <MediaCard
                  poster={movie.poster}
                  title={movie.title}
                  subtitle={movie.subtitle}
                  rating={movie.rating}
                  onClick={() => onOpenDetail(movie.imdbID)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Recommendations */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <RecommendIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {savedMedia.length > 0 ? 'Recommended for You' : 'Popular Movies & Shows'}
          </Typography>
        </Box>
        {loadingRecommendations ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {recommendations.map((movie) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={movie.imdbID || movie.id}>
                <MediaCard
                  poster={movie.poster}
                  title={movie.title}
                  subtitle={movie.subtitle}
                  rating={movie.rating}
                  onAdd={() => onAddToLibrary(movie)}
                  onClick={() => onOpenDetail(movie.imdbID)}
                />
              </Grid>
            ))}
            {recommendations.length === 0 && !loadingRecommendations && (
              <Grid item xs={12}>
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No recommendations available at the moment.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Box>

      {/* Recently Completed */}
      {recentlyCompleted.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Recently Completed
          </Typography>
          <Grid container spacing={2}>
            {recentlyCompleted.map((movie) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={movie.imdbID || movie.title}>
                <MediaCard
                  poster={movie.poster}
                  title={movie.title}
                  subtitle={movie.subtitle}
                  rating={movie.rating}
                  onClick={() => onOpenDetail(movie.imdbID)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Collections Preview - Coming Soon */}
      <Card sx={{ 
        border: '2px dashed', 
        borderColor: 'divider', 
        bgcolor: 'action.hover',
        textAlign: 'center',
        p: 4
      }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          🎬 Collections Feature
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Coming Soon! Create custom collections like "Marvel Movies", "Christopher Nolan Films", etc.
        </Typography>
      </Card>
    </Box>
  );
}
