import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TiltCard from './TiltCard';

export default function ListBoard({ title, items = [], onAdd }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ flex: 1 }}>
          {title}
        </Typography>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={onAdd}>
          Add
        </Button>
      </Box>
      <Grid container spacing={2}>
        {items.map((it, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <TiltCard sx={{ p: 2, height: 140 }}>
              <Typography variant="subtitle1" fontWeight={600}>{it.title}</Typography>
              {it.subtitle && (
                <Typography variant="body2" color="text.secondary">{it.subtitle}</Typography>
              )}
            </TiltCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
