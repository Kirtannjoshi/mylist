import React from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

const statusConfig = {
  'all': { label: 'All', color: 'default', count: 0 },
  'thinking-to-watch': { label: 'Plan to Watch', color: 'secondary', count: 0 },
  'in-progress': { label: 'Watching', color: 'primary', count: 0 },
  'on-hold': { label: 'On Hold', color: 'warning', count: 0 },
  'completed': { label: 'Completed', color: 'success', count: 0 },
  'dropped': { label: 'Dropped', color: 'error', count: 0 }
};

export default function MediaFilters({ items, activeFilter, onFilterChange }) {
  // Count items by status
  const counts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    acc.all += 1;
    return acc;
  }, { all: 0, 'thinking-to-watch': 0, 'in-progress': 0, 'on-hold': 0, completed: 0, dropped: 0 });

  return (
    <Card sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Filter by Status
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {Object.entries(statusConfig).map(([key, config]) => (
          <Chip
            key={key}
            label={`${config.label} (${counts[key]})`}
            color={activeFilter === key ? config.color : 'default'}
            variant={activeFilter === key ? 'filled' : 'outlined'}
            onClick={() => onFilterChange(key)}
            sx={{
              mb: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }
            }}
          />
        ))}
      </Stack>
    </Card>
  );
}
