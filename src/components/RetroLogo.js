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
      <Box sx={{
        width: collapsed ? 28 : 32,
        height: collapsed ? 28 : 32,
        background: 'linear-gradient(45deg, #ff6b35, #f7931e, #7209b7)',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 2,
          background: 'background.paper',
          borderRadius: 0.5,
        },
        '&::after': {
          content: '"✦"',
          position: 'absolute',
          fontSize: collapsed ? 14 : 16,
          fontWeight: 'bold',
          color: 'primary.main',
          zIndex: 1,
        }
      }} />
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
