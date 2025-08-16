import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function RetroLogo({ collapsed = false }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      px: collapsed ? 1 : 2,
      py: 1.5,
      justifyContent: collapsed ? 'center' : 'flex-start'
    }}>
      {/* Custom myLIST Logo */}
      <Box
        component="img"
        src="/logo.png"
        alt="myLIST Logo"
        sx={{
          width: collapsed ? 32 : 40,
          height: collapsed ? 32 : 40,
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }
        }}
      />
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
