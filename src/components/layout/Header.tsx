import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { User } from '../../types/auth';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
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
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 4,
      pb: 3,
      borderBottom: '1px solid',
      borderColor: 'rgba(132, 172, 206, 0.2)',
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          color: '#264653',
          fontWeight: 600,
          letterSpacing: '-0.5px'
        }}
      >
        Worklist Manager
      </Typography>
      <Box>
        <IconButton onClick={handleMenuOpen}>
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