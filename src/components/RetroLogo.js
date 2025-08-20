import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function RetroLogo({ collapsed = false }) {
  const [imgOk, setImgOk] = React.useState(true);
  const src = '/logo.png?v=2'; // cache-bust in case of stale CDN/browser cache
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      px: collapsed ? 1 : 2,
      py: 1.5,
      justifyContent: collapsed ? 'center' : 'flex-start'
    }}>
      {/* Logo image with graceful fallback */}
      {imgOk ? (
        <Box
          component="img"
          src={src}
          alt="myLIST Logo"
          decoding="async"
          loading="eager"
          onError={() => setImgOk(false)}
          sx={{
            width: collapsed ? 32 : 40,
            height: collapsed ? 32 : 40,
            objectFit: 'contain',
            borderRadius: 1,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }
          }}
        />
      ) : (
        <Box sx={{
          width: collapsed ? 32 : 40,
          height: collapsed ? 32 : 40,
          borderRadius: 1,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.25)',
        }} />
      )}
      {!collapsed && (
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: '"Press Start 2P", monospace, "Courier New"',
            fontSize: { xs: 14, sm: 16 },
            fontWeight: 400,
            color: 'primary.main',
            textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
            letterSpacing: 1
          }}
        >
          myLIST
        </Typography>
      )}
    </Box>
  );
}
