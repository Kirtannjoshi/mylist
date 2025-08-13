import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';

// Sample locations with photos from Unsplash
const sampleLocations = [
  {
    name: "Paris",
    country: "France",
    state: "Île-de-France",
    description: "City of Light and romance",
    photo: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop",
    type: "city"
  },
  {
    name: "Tokyo",
    country: "Japan", 
    state: "Tokyo Prefecture",
    description: "Modern metropolis with traditional culture",
    photo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    type: "city"
  },
  {
    name: "Bali",
    country: "Indonesia",
    state: "Bali Province", 
    description: "Tropical paradise with stunning beaches",
    photo: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop",
    type: "island"
  },
  {
    name: "New York City",
    country: "United States",
    state: "New York",
    description: "The city that never sleeps",
    photo: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop",
    type: "city"
  },
  {
    name: "Santorini",
    country: "Greece",
    state: "South Aegean",
    description: "Beautiful Greek island with white buildings",
    photo: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop",
    type: "island"
  },
  {
    name: "London",
    country: "United Kingdom",
    state: "England",
    description: "Historic city with royal heritage",
    photo: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop",
    type: "city"
  }
];

export default function TravelLocationSearch({ onAdd }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    
    // Simulate search delay and filter sample locations
    await new Promise(resolve => setTimeout(resolve, 800));
    const filtered = sampleLocations.filter(location => 
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.country.toLowerCase().includes(query.toLowerCase()) ||
      location.state.toLowerCase().includes(query.toLowerCase())
    );
    
    setResults(filtered);
    setLoading(false);
  };

  const addLocation = (location) => {
    onAdd({
      id: `loc_${Date.now()}`,
      name: location.name,
      country: location.country,
      state: location.state,
      description: location.description,
      photo: location.photo,
      type: location.type,
      visited: false,
      dateAdded: new Date().toISOString()
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search destinations (city, country, state)"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          fullWidth
          InputProps={{
            startAdornment: <LocationOnIcon sx={{ color: 'text.secondary', mr: 1 }} />
          }}
        />
        <Button 
          variant="contained" 
          startIcon={<SearchIcon />} 
          onClick={search}
          sx={{ minWidth: 120 }}
        >
          Search
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Finding destinations...</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {results.map((location, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ 
              height: '100%',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)' 
              }
            }}>
              <CardMedia
                component="img"
                height="200"
                image={location.photo}
                alt={location.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
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
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => addLocation(location)}
                  fullWidth
                  size="small"
                >
                  Add to Travel List
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {results.length === 0 && query && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No destinations found for "{query}". Try searching for cities, countries, or states.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
