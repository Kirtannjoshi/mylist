import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export default function MediaCard({ poster, title, subtitle, rating, onClick, onAdd, onRemove, sx, height = 'auto' }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Pinterest-style random heights for visual variety
  const getRandomHeight = () => {
    if (height !== 'auto') return height;
    const heights = [250, 280, 320, 350, 380];
    return heights[Math.floor(Math.random() * heights.length)];
  };

  const cardHeight = typeof height === 'number' ? height : getRandomHeight();

  return (
    <Box sx={{
      borderRadius: 2,
      overflow: 'hidden',
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 120ms ease',
      '&:hover': { 
        transform: 'translateY(-4px)', 
        boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
        '& .media-actions': {
          opacity: 1,
        }
      },
      breakInside: 'avoid', // For CSS Grid masonry support
      ...sx,
    }}>
      <Box sx={{ position: 'relative' }}>
        <Box onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
          <Box sx={{ 
            width: '100%', 
            height: cardHeight,
            background: imageLoaded && !imageError 
              ? 'transparent' 
              : 'linear-gradient(45deg, rgba(233, 30, 99, 0.1) 0%, rgba(156, 39, 176, 0.1) 50%, rgba(63, 81, 181, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {poster && !imageError ? (
              <img 
                src={poster} 
                alt={title} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  display: imageLoaded ? 'block' : 'none'
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
            ) : null}
            {(!poster || imageError || !imageLoaded) && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'text.secondary', 
                fontSize: 14,
                p: 2,
                textAlign: 'center'
              }}>
                <Box sx={{ fontSize: 32, mb: 1, opacity: 0.5 }}>🎬</Box>
                <Typography variant="body2" color="text.secondary">
                  {imageError ? 'Image not available' : 'Loading...'}
                </Typography>
              </Box>
            )}
            
            {/* Gradient overlay for better text readability */}
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              display: imageLoaded && !imageError ? 'block' : 'none'
            }} />
          </Box>
        </Box>

        {/* Rating Badge */}
        {typeof rating !== 'undefined' && (
          <Box sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8, 
            bgcolor: 'rgba(0,0,0,0.8)', 
            color: 'white',
            px: 1.5, 
            py: 0.5, 
            borderRadius: 2, 
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            ⭐ {rating}
          </Box>
        )}

        {/* Action Buttons */}
        <Box 
          className="media-actions"
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8,
            opacity: 0,
            transition: 'opacity 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {onAdd && (
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              sx={{ 
                bgcolor: 'rgba(76, 175, 80, 0.9)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(76, 175, 80, 1)' }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          )}
          {onRemove && (
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              sx={{ 
                bgcolor: 'rgba(244, 67, 54, 0.9)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(244, 67, 54, 1)' }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Title and Subtitle */}
      <Box sx={{ p: 1.5 }}>
        <Typography 
          variant="subtitle2" 
          fontWeight={600} 
          noWrap 
          title={title}
          sx={{ mb: 0.5 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ display: 'block', lineHeight: 1.2 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
