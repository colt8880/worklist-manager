import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { User } from '../../types/auth';
import { UserMenu } from './UserMenu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

export interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onLoginClick?: () => void;
  onTitleClick: () => void;
  onProjectsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  onLoginClick,
  onTitleClick,
  onProjectsClick
}) => {
  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/login');
    }
  };

  return (
    <AppBar position="fixed" sx={{ borderRadius: 0 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8
            }
          }}
          onClick={onTitleClick}
        >
          OpsDriver
        </Typography>
        {user ? (
          <>
            <Button 
              color="inherit" 
              onClick={onProjectsClick}
              sx={{ mr: 2 }}
            >
              My Projects
            </Button>
            <UserMenu user={user} onLogout={onLogout} />
          </>
        ) : (
          <Button 
            color="inherit" 
            onClick={handleAccountClick}
            endIcon={<AccountCircleIcon />}
            sx={{ 
              '& .MuiButton-endIcon': {
                marginLeft: 1 // Add a bit more spacing between text and icon
              }
            }}
          >
            Account
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}; 