import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Project, ProjectSummary } from '../../types/project';
import { ProjectList } from './ProjectList';

interface ProjectsProps {
  projects: ProjectSummary[];
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject: (projectId: string, name: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({
  projects,
  onNewProject,
  onOpenProject,
  onDeleteProject,
  onEditProject,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Projects</Typography>
        <Button variant="contained" onClick={onNewProject}>
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