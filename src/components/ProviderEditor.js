import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { PROVIDERS, PROVIDER_KINDS } from '../lib/providers';

export default function ProviderEditor({ value = [], onChange }) {
  // value: Array<{ id: string; name?: string; kind: 'sub'|'rent'|'buy' }>
  const selected = useMemo(() => new Set(value.map((v) => `${v.kind}:${v.id}`)), [value]);

  const toggle = (id, kind) => {
    const key = `${kind}:${id}`;
    const exists = selected.has(key);
    const next = exists
      ? value.filter((v) => !(v.id === id && v.kind === kind))
      : [...value, { id, kind }];
    onChange?.(next);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Available on</Typography>
      {PROVIDER_KINDS.map((k) => (
        <Box key={k.id} sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">{k.label}</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {PROVIDERS.map((p) => {
              const active = selected.has(`${k.id}:${p.id}`);
              return (
                <Chip
                  key={p.id+':'+k.id}
                  label={`${p.emoji} ${p.name}`}
                  size="small"
                  color={active ? 'secondary' : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                  onClick={() => toggle(p.id, k.id)}
                />
              );
            })}
          </Box>
        </Box>
      ))}
      <Divider sx={{ my: 1 }} />
    </Box>
  );
}
