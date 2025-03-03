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
        py: 2,
        backgroundColor: (theme) => theme.palette.primary.main,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        marginBottom: '-50vw'
      }}
    >
      <Box
        sx={{
          maxWidth: 'lg',
          width: '100%',
          mx: 'auto',
          px: { xs: 3, lg: 0 } // Remove horizontal padding on large screens
        }}
      >
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'left',
            gap: 0.5,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500
          }}
        >
          © OpsDriver 2025
        </Typography>
      </Box>
    </Box>
  );
}; 