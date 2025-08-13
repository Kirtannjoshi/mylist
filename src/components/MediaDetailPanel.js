import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ProviderEditor from './ProviderEditor';

const OMDB_URL = 'https://www.omdbapi.com/';

export default function MediaDetailPanel({ imdbID }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!imdbID) return;
      setLoading(true);
      setError('');
      try {
        const url = `${OMDB_URL}?apikey=${process.env.REACT_APP_OMDB_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`;
        const res = await fetch(url);
        const json = await res.json();
        if (active) setData(json);
      } catch (e) {
        if (active) setError('Failed to load details');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [imdbID]);

  return (
    <Box sx={{
      width: { xs: '100%', md: 400, lg: 440 },
      flex: { xs: '1 1 auto', md: '0 0 auto' },
      display: { xs: imdbID ? 'block' : 'none', md: 'block' },
      position: { xs: 'fixed', md: 'sticky' },
      top: { xs: 0, md: 80 },
      left: { xs: 0, md: 'auto' },
      right: { xs: 0, md: 'auto' },
      bottom: { xs: 0, md: 'auto' },
      zIndex: { xs: 1300, md: 'auto' },
      bgcolor: { xs: 'background.default', md: 'transparent' },
      maxHeight: { xs: '100vh', md: 'calc(100vh - 80px)' },
      overflowY: 'auto',
      p: { xs: 2, md: 0 },
      pl: { md: 3 }
    }}>
      {!imdbID ? (
        <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Select a title to see details
          </Typography>
        </Card>
      ) : loading ? (
        <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2">Loading details...</Typography>
          </Stack>
        </Card>
      ) : error ? (
        <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Card>
      ) : data ? (
        <Card sx={{ 
          bgcolor: 'background.paper', 
          border: '1px solid', 
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          {data.Poster && data.Poster !== 'N/A' && (
            <Box sx={{ 
              position: 'relative',
              height: { xs: 300, md: 350 },
              backgroundImage: `url(${data.Poster})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)'
              }
            }}>
              <Box sx={{ 
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                zIndex: 1
              }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                  {data.Title}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'white', opacity: 0.9 }}>
                  <Chip 
                    label={data.Type?.toUpperCase()} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{data.Year}</Typography>
                  </Box>
                  {data.Runtime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">{data.Runtime}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>
          )}
          
          <CardContent sx={{ p: 3 }}>
            {data.imdbRating && data.imdbRating !== 'N/A' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Rating 
                  value={parseFloat(data.imdbRating) / 2} 
                  readOnly 
                  precision={0.1}
                  icon={<StarIcon sx={{ color: '#ffb400' }} />}
                  emptyIcon={<StarIcon sx={{ color: 'rgba(255,180,0,0.3)' }} />}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {data.imdbRating}/10 IMDb
                </Typography>
              </Box>
            )}

            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              {data.Plot}
            </Typography>

            {data.Genre && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Genres</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {data.Genre.split(', ').map((genre) => (
                    <Chip 
                      key={genre} 
                      label={genre} 
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              {data.Actors && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Cast</Typography>
                  <Typography variant="body2" color="text.secondary">{data.Actors}</Typography>
                </Box>
              )}
              {data.Director && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Director</Typography>
                  <Typography variant="body2" color="text.secondary">{data.Director}</Typography>
                </Box>
              )}
              {data.Writer && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Writer</Typography>
                  <Typography variant="body2" color="text.secondary">{data.Writer}</Typography>
                </Box>
              )}
            </Stack>

            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Available On</Typography>
              <ProviderEditor value={providers} onChange={setProviders} />
            </Box>
          </CardContent>
        </Card>
      ) : null}
    </Box>
  );
}
