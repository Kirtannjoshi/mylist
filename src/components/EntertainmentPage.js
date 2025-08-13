import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MediaCard from './MediaCard';
import MasonryGrid from './MasonryGrid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RecommendIcon from '@mui/icons-material/Recommend';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { getPersonalizedRecommendations } from '../utils/recommendations';

// Trending/Popular content
const trendingContent = [
  {
    imdbID: "tt15398776",
    title: "Oppenheimer",
    subtitle: "MOVIE • 2023",
    poster: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LWE2NjUtNzc1YjU2YWZkN2E1XkEyXkFqcGdeQXVyNzAwMjU2MDA@._V1_SX300.jpg",
    rating: "8.4"
  },
  {
    imdbID: "tt6710474",
    title: "Everything Everywhere All at Once",
    subtitle: "MOVIE • 2022",
    poster: "https://m.media-amazon.com/images/M/MV5BYTdiOTIyZTQtNmQ1OS00NjZlLWIyMTgtYzk5Y2M3ZDVmMDk1XkEyXkFqcGdeQXVyMTAzMDg4NzU0._V1_SX300.jpg",
    rating: "7.8"
  },
  {
    imdbID: "tt1630029",
    title: "Avatar: The Way of Water",
    subtitle: "MOVIE • 2022", 
    poster: "https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_SX300.jpg",
    rating: "7.6"
  },
  {
    imdbID: "tt9362722",
    title: "Spider-Man: Across the Spider-Verse",
    subtitle: "MOVIE • 2023",
    poster: "https://m.media-amazon.com/images/M/MV5BMzI0NmVkMjEtYmY4MS00ZDMxLTlkZmEtMzU4MDQxYTMzMjU2XkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_SX300.jpg",
    rating: "8.7"
  }
];

const statusCategories = [
  { key: 'thinking-to-watch', label: 'Plan to Watch', icon: '📝', color: 'secondary' },
  { key: 'in-progress', label: 'Currently Watching', icon: '▶️', color: 'primary' },
  { key: 'on-hold', label: 'On Hold', icon: '⏸️', color: 'warning' },
  { key: 'completed', label: 'Completed', icon: '✅', color: 'success' },
  { key: 'dropped', label: 'Dropped', icon: '❌', color: 'error' }
];

export default function EntertainmentPage({ 
  savedMedia = [], 
  statusFilter, 
  onFilterChange, 
  onAdd, 
  onRemove, 
  onUpdateStatus,
  onOpenDetail,
  visibleCount,
  onShowMore,
  SortableItem 
}) {
  
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Generate personalized recommendations based on user's saved media
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        const recs = await getPersonalizedRecommendations(savedMedia, 12);
        setRecommendations(recs.length > 0 ? recs : trendingContent);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        setRecommendations(trendingContent);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, [savedMedia]);
  
  const getStatusCounts = () => {
    const counts = {};
    statusCategories.forEach(cat => {
      counts[cat.key] = savedMedia.filter(m => m.status === cat.key).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const currentlyWatching = savedMedia.filter(m => m.status === 'in-progress').slice(0, 6);
  const recentlyCompleted = savedMedia.filter(m => m.status === 'completed').slice(0, 6);
  const planToWatch = savedMedia.filter(m => m.status === 'thinking-to-watch').slice(0, 6);

  return (
    <Box>
      {/* Hero Section */}
      <Card sx={{ 
        background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(156, 39, 176, 0.1) 50%, rgba(63, 81, 181, 0.1) 100%)',
        border: '1px solid',
        borderColor: 'divider',
        mb: 4,
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Your Entertainment Hub
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Discover, track, and organize your favorite movies, TV shows, and series
          </Typography>
          
          {/* Quick Stats */}
          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 3 }}>
            <Chip 
              icon={<StarIcon />}
              label={`${savedMedia.length} titles tracked`} 
              color="primary" 
              variant="filled"
            />
            <Chip 
              label={`${statusCounts['completed']} completed`} 
              color="success"
              variant="outlined" 
            />
            <Chip 
              label={`${statusCounts['in-progress']} watching`} 
              color="info"
              variant="outlined"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Status Overview Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PlayCircleIcon color="primary" />
          Your Collection
        </Typography>
        <Grid container spacing={2}>
          {statusCategories.map((category) => (
            <Grid item xs={12} sm={6} lg={3} key={category.key}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: statusFilter === category.key ? '2px solid' : '1px solid',
                  borderColor: statusFilter === category.key ? `${category.color}.main` : 'divider',
                  bgcolor: statusFilter === category.key ? `${category.color}.50` : 'background.paper',
                  '&:hover': { 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)' 
                  }
                }}
                onClick={() => onFilterChange(category.key)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" sx={{ mb: 1, opacity: 0.8 }}>
                    {category.icon}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: `${category.color}.main` }}>
                    {statusCounts[category.key]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Currently Watching */}
      {currentlyWatching.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              Continue Watching
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => onFilterChange('in-progress')}
            >
              View All
            </Button>
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
                  onRemove={() => onRemove(movie.imdbID || movie.title)}
                  height={280}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Recommendations & Trending */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <RecommendIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {savedMedia.length > 0 ? 'Recommended for You' : 'Trending Now'}
          </Typography>
          {loadingRecommendations && (
            <Typography variant="body2" color="text.secondary">
              (Updating recommendations...)
            </Typography>
          )}
        </Box>
        {loadingRecommendations ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {recommendations.map((movie) => (
              <Grid item xs={6} sm={4} md={3} lg={3} key={movie.imdbID || movie.id}>
                <MediaCard
                  poster={movie.poster}
                  title={movie.title}
                  subtitle={movie.subtitle}
                  rating={movie.rating}
                  onAdd={() => onAdd(movie)}
                  onClick={() => onOpenDetail(movie.imdbID)}
                  height={280}
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

      {/* Plan to Watch */}
      {planToWatch.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              📝 Plan to Watch
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => onFilterChange('thinking-to-watch')}
            >
              View All
            </Button>
          </Box>
          <Grid container spacing={2}>
            {planToWatch.map((movie) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={movie.imdbID || movie.title}>
                <MediaCard
                  poster={movie.poster}
                  title={movie.title}
                  subtitle={movie.subtitle}
                  rating={movie.rating}
                  onClick={() => onOpenDetail(movie.imdbID)}
                  onRemove={() => onRemove(movie.imdbID || movie.title)}
                  height={280}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Recently Completed */}
      {recentlyCompleted.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FavoriteIcon color="success" />
              Recently Completed
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => onFilterChange('completed')}
            >
              View All
            </Button>
          </Box>
          <Grid container spacing={2}>
            {recentlyCompleted.map((movie) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={movie.imdbID || movie.title}>
                <MediaCard
                  poster={movie.poster}
                  title={movie.title}
                  subtitle={movie.subtitle}
                  rating={movie.rating}
                  onClick={() => onOpenDetail(movie.imdbID)}
                  onRemove={() => onRemove(movie.imdbID || movie.title)}
                  height={280}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* All Library Items (when filter is selected) */}
      {statusFilter !== 'all' && (
        <Box sx={{ mb: 4 }}>
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                {statusCategories.find(cat => cat.key === statusFilter)?.label} ({statusCounts[statusFilter]})
              </Typography>
              
              <DndContext 
                collisionDetection={closestCenter} 
                onDragEnd={(e) => {
                  const { active, over } = e;
                  if (!over || active.id === over.id) return;
                  // Handle drag and drop logic here
                }}
              >
                {(() => {
                  const filteredMedia = savedMedia.filter((m) => m.status === statusFilter).slice(0, visibleCount);
                  const visibleIds = filteredMedia.map((m) => (m.imdbID||m.title));
                  
                  return (
                    <SortableContext items={visibleIds} strategy={rectSortingStrategy}>
                      <MasonryGrid columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} spacing={2}>
                        {filteredMedia.map((m) => {
                          const idKey = m.imdbID || m.title;
                          return (
                            <SortableItem id={idKey} key={idKey}>
                              {({ setNodeRef, style, attributes, listeners }) => (
                                <Box ref={setNodeRef} style={style}>
                                  <MediaCard
                                    poster={m.poster}
                                    title={m.title}
                                    subtitle={m.subtitle}
                                    rating={m.rating}
                                    onClick={() => onOpenDetail(m.imdbID)}
                                    onRemove={() => onRemove(idKey)}
                                    sx={{ width: '100%' }}
                                  />
                                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <Box {...attributes} {...listeners} sx={{ cursor: 'grab', opacity: 0.7, fontSize: 12 }}>⋮⋮</Box>
                                    {statusCategories.map((cat) => (
                                      <Chip
                                        key={cat.key}
                                        size="small"
                                        color={m.status === cat.key ? cat.color : 'default'}
                                        variant={m.status === cat.key ? 'filled' : 'outlined'}
                                        label={cat.key === 'thinking-to-watch' ? 'plan' : cat.key}
                                        onClick={() => onUpdateStatus(idKey, cat.key)}
                                        sx={{ fontSize: '0.6rem', height: 20 }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </SortableItem>
                          );
                        })}
                      </MasonryGrid>
                    </SortableContext>
                  );
                })()}
              </DndContext>
              
              {savedMedia.filter((m) => m.status === statusFilter).length > visibleCount && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button variant="outlined" onClick={onShowMore}>
                    Show More ({savedMedia.filter((m) => m.status === statusFilter).length - visibleCount} remaining)
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Collections Preview - Coming Soon */}
      <Card sx={{ 
        border: '2px dashed', 
        borderColor: 'primary.main', 
        bgcolor: 'primary.50',
        textAlign: 'center',
        p: 4
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          🎬 Smart Collections
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Coming Soon! Create custom collections like "Marvel Cinematic Universe", "Christopher Nolan Films", "Studio Ghibli", etc.
        </Typography>
        <Button variant="outlined" disabled sx={{ borderStyle: 'dashed' }}>
          Notify When Available
        </Button>
      </Card>
    </Box>
  );
}
