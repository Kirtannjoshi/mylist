import React from 'react';
import Box from '@mui/material/Box';
import MovieIcon from '@mui/icons-material/Movie';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';

// A small composite icon that layers a film icon with a ticket to evoke "popcorn + movie" vibes
export default function PopcornMovieIcon(props) {
  return (
    <Box sx={{ position: 'relative', width: 24, height: 24, color: 'inherit' }} {...props}>
      <MovieIcon sx={{ position: 'absolute', left: 0, top: 4, fontSize: 22, opacity: 0.95 }} />
      <LocalActivityIcon sx={{ position: 'absolute', right: -2, bottom: -2, fontSize: 16, opacity: 0.9 }} />
    </Box>
  );
}
