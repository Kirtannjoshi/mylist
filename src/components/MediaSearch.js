import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import MediaCard from './MediaCard';

const OMDB_URL = 'https://www.omdbapi.com/';

export default function MediaSearch({ onAdd, onOpenDetail }) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const search = async () => {
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    setError('');
    try {
      const url = `${OMDB_URL}?apikey=${process.env.REACT_APP_OMDB_KEY}&s=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.Response === 'True') {
        setResults(data.Search);
      } else {
        setResults([]);
        setError(data.Error || 'No results');
      }
    } catch (e) {
      setError('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (imdbID) => {
    try {
      const url = `${OMDB_URL}?apikey=${process.env.REACT_APP_OMDB_KEY}&i=${encodeURIComponent(imdbID)}`;
      const res = await fetch(url);
      const item = await res.json();
      onAdd({
        imdbID: item.imdbID,
        title: item.Title,
        subtitle: `${item.Type?.toUpperCase() || ''} • ${item.Year}`,
        poster: item.Poster && item.Poster !== 'N/A' ? item.Poster : undefined,
        rating: item.imdbRating && item.imdbRating !== 'N/A' ? item.imdbRating : undefined,
      });
    } catch (_) {}
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search Entertainment (Movies / TV / Anime / Series)"
          variant="outlined"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          fullWidth
        />
        <Button variant="contained" startIcon={<SearchIcon />} onClick={search}>
          Search
        </Button>
      </Box>
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Searching...</Typography>
        </Box>
      )}
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>{error}</Typography>
      )}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {results.map((r) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={r.imdbID}>
            <MediaCard
              poster={r.Poster && r.Poster !== 'N/A' ? r.Poster : undefined}
              title={r.Title}
              subtitle={`${(r.Type||'').toUpperCase()} • ${r.Year}`}
              onClick={() => onOpenDetail?.(r.imdbID)}
              onAdd={() => addItem(r.imdbID)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
