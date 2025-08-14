import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
  Slide
} from '@mui/material';
import {
  Search as SearchIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  Bookmark as BookmarkIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// OMDB API configuration
const API_KEY = '4d2dd959';
const OMDB_URL = 'https://www.omdbapi.com/';

export default function UniversalSearchBar({ 
  onAdd, 
  onOpenDetail, 
  placeholder = "Search movies, TV shows, todos, bucket list...",
  compact = false,
  sx = {}
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const searchTimeoutRef = useRef(null);
  const resultsCache = useRef({});

  // Close search results when route changes
  useEffect(() => {
    setShowResults(false);
    setQuery('');
    setResults([]);
  }, [location.pathname]);

  // Optimized debounced search with caching
  const debouncedSearch = useCallback((searchQuery) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        // Check cache first
        if (resultsCache.current[searchQuery]) {
          setResults(resultsCache.current[searchQuery]);
          setShowResults(true);
          setLoading(false);
          return;
        }
        
        searchMedia(searchQuery.trim());
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 150);
  }, []);

  // Enhanced search with better performance
  const searchMedia = async (searchQuery) => {
    setLoading(true);
    setError('');
    
    try {
      // Parallel API calls for better performance
      const [movieResponse, seriesResponse] = await Promise.all([
        fetch(`${OMDB_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchQuery)}&type=movie`),
        fetch(`${OMDB_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchQuery)}&type=series`)
      ]);
      
      const [omdbData, tvData] = await Promise.all([
        movieResponse.json(),
        seriesResponse.json()
      ]);
      
      let searchResults = [];
      
      // Process movie results
      if (omdbData.Response === 'True') {
        searchResults = omdbData.Search.map(item => ({
          id: item.imdbID,
          imdbID: item.imdbID,
          title: item.Title,
          subtitle: `${item.Type?.toUpperCase()} • ${item.Year}`,
          poster: item.Poster !== 'N/A' ? item.Poster : null,
          type: item.Type,
          year: item.Year,
          source: 'omdb'
        }));
      }

      // Process TV series results
      if (tvData.Response === 'True') {
        const tvResults = tvData.Search.map(item => ({
          id: item.imdbID,
          imdbID: item.imdbID,
          title: item.Title,
          subtitle: `${item.Type?.toUpperCase()} • ${item.Year}`,
          poster: item.Poster !== 'N/A' ? item.Poster : null,
          type: item.Type,
          year: item.Year,
          source: 'omdb'
        }));
        searchResults = [...searchResults, ...tvResults];
      }

      // Remove duplicates and limit results for performance
      const uniqueResults = searchResults
        .filter((item, index, self) => index === self.findIndex(t => t.imdbID === item.imdbID))
        .slice(0, 6);
      
      // Cache results
      resultsCache.current[searchQuery] = uniqueResults;
      
      setResults(uniqueResults);
      setShowResults(uniqueResults.length > 0);
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      // Navigate to search results page with query
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleViewAllResults = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleResultClick = async (item) => {
    try {
      // Navigate to movie details page directly
      if (item.imdbID) {
        navigate(`/movie/${item.imdbID}`);
        setQuery('');
        setResults([]);
        setShowResults(false);
        return;
      }
    } catch (err) {
      console.error('Error navigating to movie details:', err);
    }
  };

  const handleAddClick = (e, item) => {
    e.stopPropagation();
    if (onAdd) {
      onAdd(item);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'movie': return <MovieIcon sx={{ color: '#f5c518' }} />;
      case 'series': return <TvIcon sx={{ color: '#00d4ff' }} />;
      default: return <BookmarkIcon sx={{ color: '#8e24aa' }} />;
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError('');
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', ...sx }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        size={compact ? "small" : "medium"}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading && (
                <Fade in={loading}>
                  <CircularProgress size={20} sx={{ color: '#f5c518' }} />
                </Fade>
              )}
              {query && !loading && (
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ 
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: compact ? '12px' : '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: compact ? '40px' : '48px',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.12)',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(245, 197, 24, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f5c518',
              boxShadow: '0 0 0 2px rgba(245, 197, 24, 0.1)',
            },
          },
          '& .MuiInputBase-input': {
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: compact ? '14px' : '16px',
            padding: compact ? '8px 12px' : '12px 16px',
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.5)',
            },
          },
        }}
      />

      <Slide direction="down" in={showResults} mountOnEnter unmountOnExit>
        <Paper
          elevation={24}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            maxHeight: { xs: '60vh', sm: '400px' }, // More space on mobile
            overflow: 'auto',
            zIndex: 1000,
            borderRadius: compact ? '12px' : '16px',
            backgroundColor: 'rgba(18, 18, 18, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
            },
          }}
        >
          {error ? (
            <Box p={2}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {results.map((item, index) => (
                <Fade in={true} key={`${item.source}-${item.id}`} timeout={300 + index * 100}>
                  <ListItem
                    button
                    onClick={() => handleResultClick(item)}
                    sx={{
                      borderBottom: index < results.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: { xs: '80px', sm: '72px' }, // Taller touch targets on mobile
                      py: { xs: 2, sm: 1 }, // More padding on mobile
                      '&:hover': {
                        backgroundColor: 'rgba(245, 197, 24, 0.08)',
                        transform: 'translateX(4px)',
                      },
                      '&:active': {
                        transform: 'translateX(2px)',
                        backgroundColor: 'rgba(245, 197, 24, 0.12)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={item.poster}
                        variant="rounded"
                        sx={{
                          width: { xs: 40, sm: 48 }, // Smaller on mobile for more text space
                          height: { xs: 60, sm: 72 },
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        {getIcon(item.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant={compact ? "body1" : "subtitle1"} 
                          sx={{ 
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.95)',
                            lineHeight: 1.2,
                            fontSize: { xs: '14px', sm: compact ? '14px' : '16px' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.title}
                        </Typography>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.6)',
                            mt: 0.5,
                            fontSize: { xs: '12px', sm: '14px' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.subtitle}
                        </Typography>
                      }
                      sx={{ flex: 1, ml: { xs: 1.5, sm: 2 } }}
                    />
                    {onAdd && (
                      <IconButton
                        onClick={(e) => handleAddClick(e, item)}
                        sx={{ 
                          ml: 1,
                          color: '#f5c518',
                          '&:hover': {
                            backgroundColor: 'rgba(245, 197, 24, 0.1)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </ListItem>
                </Fade>
              ))}
              {results.length === 0 && !loading && query.length > 2 && (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography color="rgba(255, 255, 255, 0.7)">
                        No results found
                      </Typography>
                    }
                    secondary={
                      <Typography color="rgba(255, 255, 255, 0.5)">
                        Try a different search term
                      </Typography>
                    }
                  />
                </ListItem>
              )}
              {results.length > 0 && (
                <ListItem
                  button
                  onClick={handleViewAllResults}
                  sx={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    backgroundColor: 'rgba(245, 197, 24, 0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(245, 197, 24, 0.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography 
                        sx={{ 
                          textAlign: 'center',
                          fontWeight: 600,
                          color: '#f5c518',
                        }}
                      >
                        View All Results →
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          )}
        </Paper>
      </Slide>
    </Box>
  );
}
