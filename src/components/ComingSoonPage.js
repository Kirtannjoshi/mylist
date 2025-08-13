import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function ComingSoonPage({ title, icon, features }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Card sx={{ 
        maxWidth: 600, 
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'primary.main',
        bgcolor: 'background.paper',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ p: 6 }}>
          <Box sx={{ mb: 3 }}>
            {icon}
          </Box>
          
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            {title}
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Coming Soon!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            We're working hard to bring you an amazing {title.toLowerCase()} tracking experience. 
            Stay tuned for updates!
          </Typography>
          
          {features && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Planned Features:
              </Typography>
              <Stack spacing={1}>
                {features.map((feature, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {feature}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
          
          <Button 
            variant="outlined" 
            size="large"
            disabled
            sx={{ borderStyle: 'dashed' }}
          >
            Notify Me When Ready
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export function SongsComingSoon() {
  const features = [
    "Track your favorite songs and albums",
    "Create custom playlists",
    "Rate and review music",
    "Discover new music based on your taste",
    "Integration with Spotify, Apple Music, and more"
  ];

  return (
    <ComingSoonPage 
      title="Songs & Music"
      icon={<MusicNoteIcon sx={{ fontSize: 80, color: 'primary.main' }} />}
      features={features}
    />
  );
}

export function BooksComingSoon() {
  const features = [
    "Track books you've read and want to read",
    "Rate and review books",
    "Set reading goals and progress",
    "Discover new books and authors",
    "Integration with Goodreads and library systems"
  ];

  return (
    <ComingSoonPage 
      title="Books & Reading"
      icon={
        <Box sx={{ fontSize: 80, color: 'primary.main' }}>📚</Box>
      }
      features={features}
    />
  );
}
