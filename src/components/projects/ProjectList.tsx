import React, { useState } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Menu, 
  MenuItem,
  Typography 
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Project, ProjectSummary } from '../../types/project';
import { formatDate } from '../../utils/dateUtils';
import { EditProjectDialog } from './EditProjectDialog';

interface ProjectListProps {
  projects: ProjectSummary[];
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject: (projectId: string, name: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onOpenProject,
  onDeleteProject,
  onEditProject,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<{ id: string; name: string } | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    event.stopPropagation();
    setMenuAnchor({ [projectId]: event.currentTarget });
  };

  const handleMenuClose = (projectId: string) => {
    setMenuAnchor({ [projectId]: null });
  };

  return (
    <>
      <List>
        {projects.map((project) => (
          <ListItem
            key={project.id}
            onClick={() => onOpenProject(project.id)}
            sx={{
              border: '1px solid',
              borderColor: 'rgba(132, 172, 206, 0.2)',
              borderRadius: 1,
              mb: 1,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(26, 169, 98, 0.04)',
              },
            }}
          >
            <ListItemText
              primary={project.name}
              secondary={
                <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary' }}>
                  <Typography variant="body2">
                    Records: {project.recordCount}
                  </Typography>
                  <Typography variant="body2">
                    Updated: {formatDate(project.updatedAt)}
                  </Typography>
                </Box>
              }
            />
            <IconButton
              onClick={(e) => handleMenuOpen(e, project.id)}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchor[project.id]}
              open={Boolean(menuAnchor[project.id])}
              onClose={() => handleMenuClose(project.id)}
            >
              <MenuItem onClick={(e) => {
                e.stopPropagation();
                handleMenuClose(project.id);
                setProjectToEdit({ id: project.id, name: project.name });
                setEditDialogOpen(true);
              }}>
                Edit
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose(project.id);
                  onDeleteProject(project.id);
                }}
                sx={{ color: 'error.main' }}
              >
                Delete
              </MenuItem>
            </Menu>
          </ListItem>
        ))}
      </List>
      {projectToEdit && (
        <EditProjectDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setProjectToEdit(null);
          }}
          onSave={(newName) => {
            onEditProject(projectToEdit.id, newName);
            setEditDialogOpen(false);
            setProjectToEdit(null);
          }}
          currentName={projectToEdit.name}
        />
      )}
    </>
  );
}; 