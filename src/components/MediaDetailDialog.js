import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { findByImdb, getWatchProviders } from '../lib/tmdb';

const OMDB_URL = 'https://www.omdbapi.com/';
const API_KEY = process.env.REACT_APP_OMDB_KEY || '4d2dd959';

export default function MediaDetailDialog({ open, imdbID, onClose }) {
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
        const url = `${OMDB_URL}?apikey=${API_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`;
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

  useEffect(() => {
    let active = true;
    async function loadProviders() {
      try {
        if (!data?.imdbID) return;
        const f = await findByImdb(data.imdbID);
        const movie = f.movie_results?.[0];
        const tv = f.tv_results?.[0];
        const type = movie ? 'movie' : tv ? 'tv' : null;
        const id = movie?.id || tv?.id;
        if (!type || !id) return;
        const wp = await getWatchProviders(type, id);
        const IN = wp.results?.IN || wp.results?.US || wp.results?.GB || null; // choose a fallback region
        const list = [ ...(IN?.flatrate||[]), ...(IN?.rent||[]), ...(IN?.buy||[]) ];
        if (active) setProviders(list);
      } catch (e) {
        // ignore
      }
    }
    loadProviders();
    return () => { active = false; };
  }, [data]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{data?.Title || 'Details'}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading...</Typography>
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : data ? (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {data.Poster && data.Poster !== 'N/A' && (
              <Box sx={{ width: 240, borderRadius: 2, overflow: 'hidden' }}>
                <img src={data.Poster} alt={data.Title} style={{ width: '100%', display: 'block' }} />
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Typography variant="subtitle1" color="text.secondary">
                {data.Type?.toUpperCase()} • {data.Year} • {data.Rated}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>{data.Plot}</Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {data.Genre?.split(', ').map((g) => <Chip key={g} label={g} size="small" />)}
              </Box>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Cast: {data.Actors}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Director: {data.Director}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Writer: {data.Writer}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                IMDB: {data.imdbRating} / 10
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Available on</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {providers.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No provider info</Typography>
                  ) : providers.map((p) => (
                    <Tooltip key={p.provider_id} title={p.provider_name}>
                      <Avatar variant="rounded" src={`https://image.tmdb.org/t/p/w45${p.logo_path}`} sx={{ width: 28, height: 28 }} />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
