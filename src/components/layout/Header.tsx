import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { User } from '../../types/auth';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onTitleClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onTitleClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  return (
    <Box 
      component="header"
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: '64px',  // Fixed height for header
        px: 4,
        bgcolor: 'primary.main',
        color: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        onClick={onTitleClick}
        sx={{ 
          color: '#ffffff',
          fontWeight: 600,
          letterSpacing: '-0.5px',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.9,
          },
        }}
      >
        Worklist Manager
      </Typography>
      <Box>
        <IconButton 
          onClick={handleMenuOpen}
          sx={{ color: '#ffffff' }}
        >
          <AccountCircleIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}; 