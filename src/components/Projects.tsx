import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { ProjectSummary } from '../types/project';
import { EditProjectDialog } from './EditProjectDialog';

interface ProjectsProps {
  projects: ProjectSummary[];
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject: (projectId: string, newName: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({
  projects,
  onNewProject,
  onOpenProject,
  onDeleteProject,
  onEditProject,
}) => {
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h5" component="h2">
          Your Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewProject}
        >
          New Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {project.name}
                  </Typography>
                  <Box>
                    <IconButton
                      onClick={() => setEditingProject(project)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => onDeleteProject(project.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {project.recordCount} records
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => onOpenProject(project.id)}
                >
                  Open Project
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <EditProjectDialog
        open={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSave={(newName) => {
          if (editingProject) {
            onEditProject(editingProject.id, newName);
          }
          setEditingProject(null);
        }}
        initialName={editingProject?.name || ''}
      />

      {projects.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            You don't have any projects yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onNewProject}
          >
            Create Your First Project
          </Button>
        </Paper>
      )}
    </Box>
  );
}; 