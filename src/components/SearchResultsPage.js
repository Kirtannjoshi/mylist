import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const OMDB_URL = 'https://www.omdbapi.com/';
const API_KEY = process.env.REACT_APP_OMDB_KEY || '4d2dd959';

export default function SearchResultsPage({ userData, onAddMovie, onAddTodo, onAddBucket }) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const navigate = useNavigate();
  
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
      // Get detailed information if from OMDB
      if (item.source === 'omdb') {
        const detailResponse = await fetch(
          `${OMDB_URL}?apikey=${API_KEY}&i=${item.imdbID}`
        );
        const detailedItem = await detailResponse.json();
        
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
        
        if (onAddMovie) {
          const result = onAddMovie(mediaItem);
          if (result && result.success === false) {
            console.log(result.message);
          }
        }
      }
    } catch (error) {
      console.error('Error adding media:', error);
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
      <Paper elevation={1} sx={{ px: 3, py: 2, mb: 3, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
      </Paper>

      <Box sx={{ px: 3, pb: 3 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6">Searching...</Typography>
          </Box>
        ) : totalResults === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>No results found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try searching for movies, TV shows, or create new items
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
                <Grid container spacing={2}>
                  {results.movies.map((movie, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id + index}>
                      <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                        {movie.poster && (
                          <CardMedia
                            component="img"
                            height="200"
                            image={movie.poster}
                            alt={movie.title}
                            sx={{ objectFit: 'cover' }}
                          />
                        )}
                        <CardContent sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            {movie.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {movie.subtitle}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={movie.source === 'user' ? 'In Library' : 'Add'} 
                              color={movie.source === 'user' ? 'success' : 'primary'}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (movie.source !== 'user') {
                                  handleAddMedia(movie);
                                }
                              }}
                            />
                            <IconButton size="small" color="primary">
                              <PlayCircleOutlineIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
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
                <Grid container spacing={2}>
                  {results.series.map((series, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={series.id + index}>
                      <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                        {series.poster && (
                          <CardMedia
                            component="img"
                            height="200"
                            image={series.poster}
                            alt={series.title}
                            sx={{ objectFit: 'cover' }}
                          />
                        )}
                        <CardContent sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            {series.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {series.subtitle}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={series.source === 'user' ? 'In Library' : 'Add'} 
                              color={series.source === 'user' ? 'success' : 'secondary'}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (series.source !== 'user') {
                                  handleAddMedia(series);
                                }
                              }}
                            />
                            <IconButton size="small" color="secondary">
                              <PlayCircleOutlineIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
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
