import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

export default function TaskList({ title, items = [], onAdd, onToggle, onRemove }) {
  const [text, setText] = useState('');
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd?.(t);
    setText('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField size="small" label={`Add to ${title}`} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} fullWidth />
        <Button variant="contained" onClick={submit}>Add</Button>
      </Box>
      <List dense disablePadding>
        {items.map((it) => (
          <ListItem key={it.id} disablePadding secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => onRemove?.(it.id)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemButton onClick={() => onToggle?.(it.id)}>
              <ListItemIcon>
                <Checkbox edge="start" tabIndex={-1} checked={!!it.done} />
              </ListItemIcon>
              <ListItemText primary={it.text} sx={{ textDecoration: it.done ? 'line-through' : 'none', color: it.done ? 'text.disabled' : 'text.primary' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
