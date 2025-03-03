import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Footer component that displays at the bottom of every page
 * Contains copyright information and other footer content
 * 
 * @returns {JSX.Element} The footer component
 */
export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginTop: '25px',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        marginBottom: '-50vw',
        py: 2
      }}
    >
      <Typography
        variant="body2"
        sx={{
          display: 'flex',
          alignItems: 'left',
          gap: 0.5,
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: 500,
          pl: 3
        }}
      >
        © OpsDriver 2025
      </Typography>
    </Box>
  );
}; 