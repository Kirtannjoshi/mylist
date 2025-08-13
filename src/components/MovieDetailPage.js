import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import RecommendIcon from '@mui/icons-material/Recommend';
import MediaCard from './MediaCard';
import { getSimilarRecommendations } from '../utils/recommendations';

const OMDB_URL = 'https://www.omdbapi.com/';
const API_KEY = process.env.REACT_APP_OMDB_KEY || '4d2dd959';

// Mock streaming data - would be replaced with real scraping/API
const getStreamingAvailability = (title) => {
  const mockData = {
    subscription: ['Netflix', 'Disney+', 'Hulu'],
    rent: ['Amazon Prime Video', 'Apple TV', 'Google Play'],
    buy: ['iTunes', 'Vudu', 'Microsoft Store']
  };
  
  // Return random subset for demo
  return {
    subscription: mockData.subscription.slice(0, Math.floor(Math.random() * 3) + 1),
    rent: mockData.rent.slice(0, Math.floor(Math.random() * 3) + 1),
    buy: mockData.buy.slice(0, Math.floor(Math.random() * 3) + 1)
  };
};

const statusOptions = [
  { key: 'thinking-to-watch', label: 'Plan to Watch', color: 'secondary' },
  { key: 'in-progress', label: 'Watching', color: 'primary' },
  { key: 'on-hold', label: 'On Hold', color: 'warning' },
  { key: 'completed', label: 'Completed', color: 'success' },
  { key: 'dropped', label: 'Dropped', color: 'error' }
];

export default function MovieDetailPage({ savedMedia, onAddToLibrary, onUpdateStatus }) {
  const { imdbID } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (!data) return;
    setLoadingSimilar(true);
    getSimilarRecommendations(data, savedMedia, 8)
      .then(setSimilar)
      .catch(() => setSimilar([]))
      .finally(() => setLoadingSimilar(false));
  }, [data, savedMedia]);
  
  // Check if movie is already in library
  const savedMovie = savedMedia.find(m => m.imdbID === imdbID);

  useEffect(() => {
    async function loadMovieData() {
      if (!imdbID) return;
      
      try {
        setLoading(true);
        const url = `${OMDB_URL}?apikey=${API_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`;
        const response = await fetch(url);
        const movieData = await response.json();
        
        if (movieData.Response === 'True') {
          setData(movieData);
          setStreaming(getStreamingAvailability(movieData.Title));
        }
      } catch (error) {
        console.error('Failed to load movie data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMovieData();
  }, [imdbID]);

  const handleAddToLibrary = () => {
    if (data) {
      const movieItem = {
        imdbID: data.imdbID,
        title: data.Title,
        subtitle: `${data.Type?.toUpperCase() || ''} • ${data.Year}`,
        poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : undefined,
        rating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : undefined,
        status: 'thinking-to-watch'
      };
      onAddToLibrary(movieItem);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6">Movie not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Back to Entertainment</Typography>
      </Box>

      {/* Hero Section */}
      <Card sx={{ 
        mb: 4, 
        overflow: 'hidden',
        background: data.Poster && data.Poster !== 'N/A' 
          ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${data.Poster})`
          : 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        minHeight: 400
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 4, alignItems: 'flex-start' }}>
            {/* Poster */}
            {data.Poster && data.Poster !== 'N/A' && (
              <Box sx={{ 
                width: { xs: 200, md: 300 }, 
                aspectRatio: '2/3',
                borderRadius: 2,
                overflow: 'hidden',
                mb: { xs: 3, md: 0 },
                mx: { xs: 'auto', md: 0 }
              }}>
                <img 
                  src={data.Poster} 
                  alt={data.Title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}

            {/* Details */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                {data.Title}
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
                <Chip label={data.Type?.toUpperCase()} color="primary" />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarTodayIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body1">{data.Year}</Typography>
                </Box>
                {data.Runtime && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body1">{data.Runtime}</Typography>
                  </Box>
                )}
                {data.Language && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LanguageIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body1">{data.Language}</Typography>
                  </Box>
                )}
              </Stack>

              {data.imdbRating && data.imdbRating !== 'N/A' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Rating 
                    value={parseFloat(data.imdbRating) / 2} 
                    readOnly 
                    precision={0.1}
                    icon={<StarIcon sx={{ color: '#ffb400' }} />}
                    emptyIcon={<StarIcon sx={{ color: 'rgba(255,180,0,0.3)' }} />}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {data.imdbRating}/10 IMDb
                  </Typography>
                </Box>
              )}

              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {data.Plot}
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {!savedMovie ? (
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleAddToLibrary}
                    size="large"
                  >
                    Add to Library
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {statusOptions.map((status) => (
                      <Chip
                        key={status.key}
                        label={status.label}
                        color={savedMovie.status === status.key ? status.color : 'default'}
                        variant={savedMovie.status === status.key ? 'filled' : 'outlined'}
                        onClick={() => onUpdateStatus(imdbID, status.key)}
                        clickable
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Box sx={{ display: { xs: 'block', lg: 'flex' }, gap: 4 }}>
        {/* Left Column */}
        <Box sx={{ flex: 2 }}>
          {/* Cast & Crew */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Cast & Crew
              </Typography>
              
              {data.Actors && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Cast</Typography>
                  <Typography variant="body2" color="text.secondary">{data.Actors}</Typography>
                </Box>
              )}
              
              {data.Director && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Director</Typography>
                  <Typography variant="body2" color="text.secondary">{data.Director}</Typography>
                </Box>
              )}
              
              {data.Writer && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Writer</Typography>
                  <Typography variant="body2" color="text.secondary">{data.Writer}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Genres */}
          {data.Genre && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Genres
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {data.Genre.split(', ').map((genre) => (
                    <Chip 
                      key={genre} 
                      label={genre} 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Right Column - Streaming */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Where to Watch
              </Typography>
              
              {streaming && (
                <Box>
                  {streaming.subscription.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                        Included with Subscription
                      </Typography>
                      <Stack spacing={1}>
                        {streaming.subscription.map((service) => (
                          <Chip key={service} label={service} variant="outlined" color="success" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {streaming.rent.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}>
                        Rent
                      </Typography>
                      <Stack spacing={1}>
                        {streaming.rent.map((service) => (
                          <Chip key={service} label={service} variant="outlined" color="warning" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  
                  {streaming.buy.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
                        Buy
                      </Typography>
                      <Stack spacing={1}>
                        {streaming.buy.map((service) => (
                          <Chip key={service} label={service} variant="outlined" color="info" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
      {/* Similar Recommendations */}
      <Box sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <RecommendIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            You Might Also Like
          </Typography>
        </Box>
        {loadingSimilar ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {similar.map((movie) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={movie.imdbID || movie.id}>
                <MediaCard
                  poster={movie.poster}
                  title={movie.title}
                  subtitle={movie.subtitle}
                  rating={movie.rating}
                  onAdd={() => onAddToLibrary(movie)}
                  onClick={() => navigate(`/movie/${movie.imdbID}`)}
                />
              </Grid>
            ))}
            {similar.length === 0 && !loadingSimilar && (
              <Grid item xs={12}>
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No similar recommendations found.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
