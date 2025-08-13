import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export default function TravelList({ locations, onToggleVisited, onRemove }) {
  if (!locations.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No travel destinations yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search and add places you want to visit above
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {locations.map((location) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={location.id}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            opacity: location.visited ? 0.8 : 1,
            position: 'relative',
            '&:hover': { 
              transform: 'translateY(-2px)', 
              boxShadow: '0 6px 20px rgba(0,0,0,0.25)' 
            }
          }}>
            <CardMedia
              component="img"
              height="180"
              image={location.photo}
              alt={location.name}
              sx={{ 
                objectFit: 'cover',
                filter: location.visited ? 'grayscale(0.3)' : 'none'
              }}
            />
            
            {location.visited && (
              <Box sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: 'success.main',
                color: 'white',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <CheckCircleIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Visited
                </Typography>
              </Box>
            )}

            <IconButton
              onClick={() => onRemove(location.id)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
              }}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="h3" sx={{ 
                  fontWeight: 600,
                  textDecoration: location.visited ? 'line-through' : 'none'
                }}>
                  {location.name}
                </Typography>
                <Chip 
                  label={location.type} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {location.state}, {location.country}
              </Typography>
              
              <Typography variant="body2" sx={{ flexGrow: 1, mb: 2 }}>
                {location.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={location.visited}
                    onChange={() => onToggleVisited(location.id)}
                    icon={<RadioButtonUncheckedIcon />}
                    checkedIcon={<CheckCircleIcon />}
                    color="success"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {location.visited ? 'Visited' : 'Want to visit'}
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Added {new Date(location.dateAdded).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
