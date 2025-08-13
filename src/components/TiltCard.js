import React, { useRef } from 'react';
import Box from '@mui/material/Box';

// A lightweight 3D tilt card using mouse position. No external deps.
export default function TiltCard({ children, sx, intensity = 12 }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotY = ((x - midX) / midX) * intensity;
    const rotX = ((midY - y) / midY) * intensity;
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <Box
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      sx={{
        transition: 'transform 120ms ease-out',
        transformStyle: 'preserve-3d',
        borderRadius: 3,
        background: (theme) => theme.palette.background.paper,
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
