import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Masonry from '@mui/lab/Masonry';

const OMDB_URL = 'https://www.omdbapi.com/';
const API_KEY = process.env.REACT_APP_OMDB_KEY || '4d2dd959';

// MasonryCard Component for both movies and series
const MasonryCard = ({ item, type, index, onNavigate, onAddMedia }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Generate random height for masonry effect
  const cardHeight = isMobile 
    ? Math.floor(Math.random() * 100) + 320  // 320-420px for mobile
    : Math.floor(Math.random() * 120) + 280; // 280-400px for desktop
  
  const brandColor = type === 'movie' ? '#f5c518' : '#00d4ff';
  
  return (
    <Fade in={true} timeout={300 + index * 50}>
      <Card 
        elevation={0}
        sx={{ 
          cursor: 'pointer',
          borderRadius: { xs: '16px', sm: '20px' },
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          height: cardHeight,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${brandColor}08 0%, transparent 50%, ${brandColor}04 100%)`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            zIndex: 1,
          },
          '&:hover': { 
            borderColor: `${brandColor}40`,
            backgroundColor: `${brandColor}08`,
            boxShadow: isMobile 
              ? `0 8px 32px ${brandColor}20`
              : `0 16px 64px ${brandColor}25`,
            transform: isMobile 
              ? 'translateY(-4px) scale(1.02)' 
              : 'translateY(-8px) scale(1.03)',
            '&:before': {
              opacity: 1,
            },
            '& .MuiCardMedia-root': {
              transform: 'scale(1.08)',
            }
          },
          '&:active': {
            transform: isMobile ? 'translateY(-2px) scale(1.01)' : 'translateY(-4px) scale(1.02)',
            transition: 'all 0.15s ease',
          }
        }}
        onClick={() => {
          if (item.imdbID) {
            onNavigate(`/movie/${item.imdbID}`);
          }
        }}
      >
        {item.poster && (
          <CardMedia
            component="img"
            height={cardHeight * 0.7} // 70% of card height for image
            image={item.poster}
            alt={item.title}
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              zIndex: 2,
            }}
          />
        )}
        <CardContent sx={{ 
          flex: 1,
          p: { xs: 2, sm: 2.5 },
          background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
          backdropFilter: 'blur(8px)',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <Box>
            <Typography 
              variant={isMobile ? "subtitle2" : "h6"}
              component="h3" 
              sx={{
                fontWeight: 700,
                color: 'white',
                mb: 1,
                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {item.title}
            </Typography>
            {item.subtitle && !isMobile && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  mb: 1.5,
                  opacity: 0.9,
                }}
              >
                {item.subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 'auto'
          }}>
            <Chip 
              label={item.source === 'user' ? '✓ Added' : '+ Add to List'}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: '22px', sm: '26px' },
                borderRadius: '12px',
                background: item.source === 'user' 
                  ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                  : `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                color: item.source === 'user' ? 'white' : '#000',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                cursor: item.source === 'user' ? 'default' : 'pointer',
                '&:hover': {
                  transform: item.source === 'user' ? 'none' : 'scale(1.05)',
                  boxShadow: item.source === 'user' ? '0 2px 8px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.3)',
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (item.source !== 'user' && onAddMedia) {
                  console.log('Adding item to list:', item);
                  onAddMedia({
                    ...item,
                    source: 'omdb' // Ensure source is set correctly for OMDB items
                  });
                }
              }}
            />
            <IconButton 
              size="small" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                padding: { xs: '6px', sm: '8px' },
                '&:hover': { 
                  color: brandColor,
                  backgroundColor: `${brandColor}15`,
                  transform: 'scale(1.1)',
                }
              }}
            >
              <PlayArrowIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default function SearchResultsPage({ userData, onAddMovie, onAddTodo, onAddBucket }) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();
  
  const [results, setResults] = useState({
    movies: [],
    series: [],
    music: [],
    books: [],
    todos: [],
    bucketList: []
  });
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(async (query) => {
    setLoading(true);
    const searchResults = {
      movies: [],
      series: [],
      music: [],
      books: [],
      todos: [],
      bucketList: []
    };

    try {
      // Search OMDB for movies
      const movieResponse = await fetch(
        `${OMDB_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`
      );
      const movieData = await movieResponse.json();
      
      if (movieData.Response === 'True') {
        searchResults.movies = movieData.Search.slice(0, 8).map(item => ({
          id: item.imdbID,
          imdbID: item.imdbID,
          title: item.Title,
          subtitle: `${item.Type?.toUpperCase()} • ${item.Year}`,
          poster: item.Poster !== 'N/A' ? item.Poster : null,
          type: 'movie',
          year: item.Year,
          source: 'omdb'
        }));
      }

      // Search OMDB for TV series
      const seriesResponse = await fetch(
        `${OMDB_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=series`
      );
      const seriesData = await seriesResponse.json();
      
      if (seriesData.Response === 'True') {
        searchResults.series = seriesData.Search.slice(0, 8).map(item => ({
          id: item.imdbID,
          imdbID: item.imdbID,
          title: item.Title,
          subtitle: `${item.Type?.toUpperCase()} • ${item.Year}`,
          poster: item.Poster !== 'N/A' ? item.Poster : null,
          type: 'series',
          year: item.Year,
          source: 'omdb'
        }));
      }

      // Search user's existing todos
      if (userData?.todo) {
        searchResults.todos = userData.todo
          .filter(item => item.text?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6);
      }

      // Search user's existing bucket list
      if (userData?.bucket) {
        searchResults.bucketList = userData.bucket
          .filter(item => item.text?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6);
      }

      // Search user's media library
      if (userData?.media) {
        const mediaMatches = userData.media
          .filter(item => item.title?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4);
        
        mediaMatches.forEach(item => {
          if (item.Type === 'series') {
            searchResults.series.unshift({ ...item, source: 'user' });
          } else {
            searchResults.movies.unshift({ ...item, source: 'user' });
          }
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [userData]); // Include userData as it's used inside the function

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery, performSearch]);

  const handleAddMedia = async (item) => {
    try {
      console.log('handleAddMedia called with:', item);
      
      // Get detailed information if from OMDB
      if (item.source === 'omdb') {
        console.log('Fetching detailed info for OMDB item:', item.imdbID);
        
        const detailResponse = await fetch(
          `${OMDB_URL}?apikey=${API_KEY}&i=${item.imdbID}`
        );
        const detailedItem = await detailResponse.json();
        
        console.log('Detailed item from OMDB:', detailedItem);
        
        const mediaItem = {
          imdbID: detailedItem.imdbID,
          title: detailedItem.Title,
          subtitle: `${detailedItem.Type?.toUpperCase()} • ${detailedItem.Year}`,
          poster: detailedItem.Poster !== 'N/A' ? detailedItem.Poster : null,
          type: detailedItem.Type,
          year: detailedItem.Year,
          rating: detailedItem.imdbRating,
          plot: detailedItem.Plot,
          status: 'thinking-to-watch'
        };
        
        console.log('Processed media item:', mediaItem);
        
        if (onAddMovie) {
          console.log('Calling onAddMovie with:', mediaItem);
          const result = await onAddMovie(mediaItem);
          console.log('Result from onAddMovie:', result);
          
          if (result && result.success === false) {
            console.log('Failed to add movie:', result.message);
            alert(result.message || 'Failed to add to list');
          } else {
            console.log('Successfully added movie to list');
            // Update the results to show the item as added
            setResults(prev => ({
              ...prev,
              movies: prev.movies.map(movie => 
                movie.imdbID === item.imdbID 
                  ? { ...movie, source: 'user' }
                  : movie
              ),
              series: prev.series.map(series => 
                series.imdbID === item.imdbID 
                  ? { ...series, source: 'user' }
                  : series
              )
            }));
          }
        } else {
          console.error('onAddMovie function not provided');
          alert('Add movie function not available');
        }
      }
    } catch (error) {
      console.error('Error adding media:', error);
      alert('Error adding to list. Please try again.');
    }
  };

  const handleAddTodo = () => {
    if (onAddTodo) {
      onAddTodo(searchQuery);
    }
  };

  const handleAddBucket = () => {
    if (onAddBucket) {
      onAddBucket(searchQuery);
    }
  };

  const totalResults = Object.values(results).reduce((total, arr) => total + arr.length, 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Search Results
            </Typography>
            <Typography variant="body2" color="text.secondary">
              "{searchQuery}" • {totalResults} results found
            </Typography>
          </Box>
        </Box>
        
        {/* Search Input */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for movies, TV shows..."
            defaultValue={searchQuery}
            size="small"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#f5c518',
                },
              },
              '& input': {
                color: 'white',
                fontSize: '0.9rem',
              }
            }}
          />
        </Box>
      </Paper>

      <Box sx={{ px: 3, pb: 3 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={48} sx={{ color: '#f5c518', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Searching for "{searchQuery}"...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Finding the best results for you
            </Typography>
          </Box>
        ) : totalResults === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              No results found for "{searchQuery}"
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              Try searching for different keywords, or create new items to add to your lists
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddTodo}
              >
                Add to To-Do List
              </Button>
              <Button
                variant="outlined"
                startIcon={<StarIcon />}
                onClick={handleAddBucket}
              >
                Add to Bucket List
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            {/* Quick Actions */}
            {results.movies.length === 0 && results.series.length === 0 && (
              <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Create New Items
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
                      startIcon={<AddIcon />}
                      onClick={handleAddTodo}
                    >
                      Add "{searchQuery}" to To-Do
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'inherit' }}
                      startIcon={<StarIcon />}
                      onClick={handleAddBucket}
                    >
                      Add to Bucket List
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Movies */}
            {results.movies.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MovieIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Movies ({results.movies.length})
                  </Typography>
                </Box>
                <Masonry 
                  columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} 
                  spacing={{ xs: 1.5, sm: 2 }}
                  sx={{
                    alignContent: 'flex-start',
                  }}
                >
                  {results.movies.map((movie, index) => (
                    <MasonryCard
                      key={movie.id + index}
                      item={movie}
                      type="movie"
                      index={index}
                      onNavigate={navigate}
                      onAddMedia={handleAddMedia}
                    />
                  ))}
                </Masonry>
              </Box>
            )}

            {/* TV Series */}
            {results.series.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TvIcon color="secondary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    TV Series ({results.series.length})
                  </Typography>
                </Box>
                <Masonry 
                  columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} 
                  spacing={{ xs: 1.5, sm: 2 }}
                  sx={{
                    alignContent: 'flex-start',
                  }}
                >
                  {results.series.map((series, index) => (
                    <MasonryCard
                      key={series.id + index}
                      item={series}
                      type="series"
                      index={index}
                      onNavigate={navigate}
                      onAddMedia={handleAddMedia}
                    />
                  ))}
                </Masonry>
              </Box>
            )}

            {/* To-Do Items */}
            {results.todos.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircleIcon color="info" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    To-Do Items ({results.todos.length})
                  </Typography>
                </Box>
                <Paper variant="outlined">
                  <List>
                    {results.todos.map((todo, index) => (
                      <React.Fragment key={todo.id}>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color={todo.done ? 'success' : 'action'} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={todo.text}
                            secondary={todo.done ? 'Completed' : 'Pending'}
                            sx={{
                              '& .MuiListItemText-primary': {
                                textDecoration: todo.done ? 'line-through' : 'none'
                              }
                            }}
                          />
                        </ListItem>
                        {index < results.todos.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}

            {/* Bucket List Items */}
            {results.bucketList.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarIcon color="error" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bucket List ({results.bucketList.length})
                  </Typography>
                </Box>
                <Paper variant="outlined">
                  <List>
                    {results.bucketList.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <ListItem>
                          <ListItemIcon>
                            <StarIcon color={item.done ? 'success' : 'error'} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.text}
                            secondary={item.done ? 'Achieved' : 'Goal'}
                            sx={{
                              '& .MuiListItemText-primary': {
                                textDecoration: item.done ? 'line-through' : 'none'
                              }
                            }}
                          />
                        </ListItem>
                        {index < results.bucketList.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
