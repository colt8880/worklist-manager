import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { ProjectSummary } from '../../types/project';
import { ProjectList } from './ProjectList';
import AddIcon from '@mui/icons-material/Add';

interface ProjectsProps {
  projects: ProjectSummary[];
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject: (projectId: string, name: string) => void;
}

/**
 * EmptyProjectsState component displays when there are no projects
 */
const EmptyProjectsState: React.FC<{ onNewProject: () => void }> = ({ onNewProject }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 300px)',
      textAlign: 'center',
      px: 2,
      mt: -8
    }}
  >
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
        bgcolor: 'transparent'
      }}
    >
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ 
          mb: 2,
          color: 'text.primary',
          fontWeight: 500
        }}
      >
        Create a New Project to Get Started
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={onNewProject}
        startIcon={<AddIcon />}
        sx={{ 
          mt: 2,
          py: 1.5,
          px: 4,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1.1rem'
        }}
      >
        Add Project
      </Button>
    </Paper>
  </Box>
);

/**
 * Projects component manages the display of all projects and project-related actions
 */
export const Projects: React.FC<ProjectsProps> = ({
  projects,
  onNewProject,
  onOpenProject,
  onDeleteProject,
  onEditProject,
}) => {
  if (projects.length === 0) {
    return <EmptyProjectsState onNewProject={onNewProject} />;
  }

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}
      >
        <Typography variant="h5">Projects</Typography>
        <Button 
          variant="contained" 
          onClick={onNewProject}
          startIcon={<AddIcon />}
        >
          New Project
        </Button>
      </Box>
      <ProjectList
        projects={projects}
        onOpenProject={onOpenProject}
        onDeleteProject={onDeleteProject}
        onEditProject={onEditProject}
      />
    </Box>
  );
}; 