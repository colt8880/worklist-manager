import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { User } from '../types/auth';
import { Project } from '../types/project';

interface HeaderProps {
  user: User;
  currentProject: Project | null;
  onLogout: () => void;
  onBackToProjects: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentProject,
  onLogout,
  onBackToProjects,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <Typography variant="h4" component="h1">
        {currentProject ? currentProject.name : 'Worklist Manager'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {currentProject && (
          <Button variant="outlined" onClick={onBackToProjects}>
            Back to Projects
          </Button>
        )}
        <Typography variant="body1">
          Welcome, {user.username}
        </Typography>
        <Button variant="outlined" onClick={onLogout}>
          Logout
        </Button>
      </Box>
    </Box>
  );
}; 