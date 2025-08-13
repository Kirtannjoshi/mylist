import React from 'react';
import Box from '@mui/material/Box';

export default function MasonryGrid({ 
  children, 
  columns = { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }, 
  spacing = 2 
}) {
  // Convert children to array
  const items = React.Children.toArray(children);
  
  // Get responsive column count
  const getColumnCount = () => {
    if (typeof columns === 'number') return columns;
    
    // For now, default to desktop value
    // In a real app, you'd use Material-UI's breakpoints
    return columns.lg || columns.md || columns.sm || columns.xs || 3;
  };
  
  const columnCount = getColumnCount();
  
  // Distribute items across columns
  const columnsArray = Array.from({ length: columnCount }, () => []);
  
  items.forEach((item, index) => {
    const columnIndex = index % columnCount;
    columnsArray[columnIndex].push(item);
  });
  
  return (
    <Box
      sx={{
        display: 'flex',
        gap: spacing,
        alignItems: 'flex-start',
      }}
    >
      {columnsArray.map((column, columnIndex) => (
        <Box
          key={columnIndex}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing,
          }}
        >
          {column}
        </Box>
      ))}
    </Box>
  );
}
