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
import Paper from '@mui/material/Paper';
import MediaCard from './MediaCard';
import MasonryGrid from './MasonryGrid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RecommendIcon from '@mui/icons-material/Recommend';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import PendingIcon from '@mui/icons-material/Pending';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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
  { 
    key: 'thinking-to-watch', 
    label: 'Plan to Watch', 
    shortLabel: 'Plan to Watch',
    icon: PendingIcon, 
    color: 'info',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
    description: 'Movies and shows you want to watch'
  },
  { 
    key: 'in-progress', 
    label: 'Currently Watching', 
    shortLabel: 'Watching',
    icon: PlayArrowIcon, 
    color: 'primary',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    description: 'Currently enjoying these titles'
  },
  { 
    key: 'on-hold', 
    label: 'On Hold', 
    shortLabel: 'On Hold',
    icon: PauseCircleIcon, 
    color: 'warning',
    gradient: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)',
    description: 'Paused for later'
  },
  { 
    key: 'completed', 
    label: 'Completed', 
    shortLabel: 'Completed',
    icon: CheckCircleIcon, 
    color: 'success',
    gradient: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
    description: 'Finished and enjoyed'
  },
  { 
    key: 'dropped', 
    label: 'Dropped', 
    shortLabel: 'Dropped',
    icon: CancelIcon, 
    color: 'error',
    gradient: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',
    description: 'Not continuing'
  }
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

  // Debug logging
  useEffect(() => {
    console.log('EntertainmentPage - savedMedia:', savedMedia);
    console.log('EntertainmentPage - savedMedia length:', savedMedia.length);
    console.log('EntertainmentPage - statusFilter:', statusFilter);
  }, [savedMedia, statusFilter]);

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
  counts['all'] = savedMedia.length;
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

      {/* Modern Status Filter Section */}
      <Paper elevation={0} sx={{ 
        mb: 4, 
        p: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.5rem', sm: '1.75rem' }
          }}
        >
          <PlayCircleIcon sx={{ color: 'primary.main', fontSize: { xs: 28, sm: 32 } }} />
          Your Collection
        </Typography>

        {/* Enhanced Status Cards Grid */}
        <Grid container spacing={3}>
          {statusCategories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = statusFilter === category.key;
            const count = statusCounts[category.key];
            
            return (
              <Grid item xs={6} sm={4} lg={2.4} key={category.key}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    position: 'relative',
                    height: '140px',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    border: isSelected ? '2px solid' : '1px solid',
                    borderColor: isSelected ? `${category.color}.main` : 'rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    background: isSelected 
                      ? category.gradient
                      : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                    backdropFilter: 'blur(20px)',
                    overflow: 'hidden',
                    '&:hover': { 
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: isSelected 
                        ? `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${category.color}.main`
                        : '0 20px 40px rgba(0,0,0,0.2)',
                      '& .status-icon': {
                        transform: 'scale(1.2) rotate(5deg)',
                      },
                      '& .status-count': {
                        transform: 'scale(1.1)',
                      }
                    },
                    '&:active': {
                      transform: 'translateY(-4px) scale(0.98)',
                    }
                  }}
                  onClick={() => onFilterChange(category.key)}
                >
                  {/* Glass morphism background effect */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: isSelected 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 0 10px rgba(255,255,255,0.5)',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', opacity: 1 },
                          '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                          '100%': { transform: 'scale(1)', opacity: 1 },
                        }
                      }}
                    />
                  )}

                  <CardContent sx={{ 
                    position: 'relative',
                    textAlign: 'center', 
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    {/* Icon */}
                    <IconComponent 
                      className="status-icon"
                      sx={{ 
                        fontSize: { xs: 32, sm: 36 },
                        color: isSelected ? 'rgba(255,255,255,0.95)' : `${category.color}.main`,
                        transition: 'all 0.3s ease',
                        filter: isSelected ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' : 'none'
                      }} 
                    />
                    
                    {/* Count */}
                    <Typography 
                      variant="h4" 
                      className="status-count"
                      sx={{ 
                        fontWeight: 800,
                        fontSize: { xs: '1.75rem', sm: '2rem' },
                        color: isSelected ? 'rgba(255,255,255,0.95)' : 'text.primary',
                        transition: 'all 0.3s ease',
                        textShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
                      }}
                    >
                      {count}
                    </Typography>
                    
                    {/* Label */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        color: isSelected ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        transition: 'all 0.3s ease',
                        textShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.3)' : 'none'
                      }}
                    >
                      {category.shortLabel}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Enhanced Filter Summary */}
        {statusFilter !== 'all' && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Chip
              icon={React.createElement(statusCategories.find(cat => cat.key === statusFilter)?.icon)}
              label={`${statusCategories.find(cat => cat.key === statusFilter)?.label} • ${statusCounts[statusFilter]} items`}
              sx={{
                px: 2,
                py: 1,
                height: 40,
                fontSize: '0.9rem',
                fontWeight: 600,
                background: statusCategories.find(cat => cat.key === statusFilter)?.gradient,
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                '& .MuiChip-icon': {
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 20
                }
              }}
              onDelete={() => onFilterChange('all')}
              deleteIcon={<CancelIcon sx={{ color: 'rgba(255,255,255,0.8) !important' }} />}
            />
          </Box>
        )}
      </Paper>

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
                  const filteredMedia = (statusFilter === 'all' 
                    ? savedMedia 
                    : savedMedia.filter((m) => m.status === statusFilter)
                  ).slice(0, visibleCount);
                  const visibleIds = filteredMedia.map((m) => (m.imdbID||m.title));
                  
                  // Show empty state if no content
                  if (filteredMedia.length === 0) {
                    return (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        py: 8,
                        px: 4,
                        textAlign: 'center'
                      }}>
                        <PlayCircleIcon sx={{ 
                          fontSize: 80, 
                          color: 'text.disabled', 
                          mb: 2 
                        }} />
                        <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                          {savedMedia.length === 0 
                            ? "No movies or shows yet"
                            : `No ${statusCategories.find(cat => cat.key === statusFilter)?.label.toLowerCase() || statusFilter} titles`
                          }
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mb: 3, maxWidth: 400 }}>
                          {savedMedia.length === 0
                            ? "Start building your entertainment collection by searching and adding movies or TV shows above!"
                            : `You haven't added any ${statusCategories.find(cat => cat.key === statusFilter)?.label.toLowerCase() || statusFilter} titles yet. Try switching to a different category or add new content!`
                          }
                        </Typography>
                        {savedMedia.length === 0 && (
                          <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<TrendingUpIcon />}
                            onClick={() => onFilterChange('all')}
                            sx={{ borderRadius: 2 }}
                          >
                            Explore Trending
                          </Button>
                        )}
                      </Box>
                    );
                  }
                  
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
              
              {(statusFilter === 'all' 
                ? savedMedia.length 
                : savedMedia.filter((m) => m.status === statusFilter).length
               ) > visibleCount && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button variant="outlined" onClick={onShowMore}>
                    {(() => { 
                      const total = statusFilter === 'all' ? savedMedia.length : savedMedia.filter((m) => m.status === statusFilter).length; 
                      return `Show More (${total - visibleCount} remaining)`; 
                    })()}
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
