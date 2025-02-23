import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Menu, 
  MenuItem,
  Typography,
  TextField,
  InputAdornment,
  Fade
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { ProjectSummary } from '../../types/project';
import { formatDate } from '../../utils/dateUtils';
import { EditProjectDialog } from './EditProjectDialog';

interface ProjectListProps {
  projects: ProjectSummary[];
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject: (projectId: string, name: string) => void;
}

/**
 * SearchBar component for filtering projects
 */
const SearchBar: React.FC<{
  searchTerm: string;
  isVisible: boolean;
  onSearch: (term: string) => void;
  onVisibilityChange: (visible: boolean) => void;
}> = ({ searchTerm, isVisible, onSearch, onVisibilityChange }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isVisible]);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 2, 
      gap: 1, 
      position: 'relative',
      height: 40,
    }}>
      <Fade in={!isVisible}>
        <IconButton 
          onClick={() => onVisibilityChange(true)}
          sx={{ position: 'absolute', left: 0 }}
          aria-label="Show search"
        >
          <SearchIcon />
        </IconButton>
      </Fade>
      <Fade in={isVisible}>
        <Box sx={{ 
          maxWidth: { xs: '100%', sm: '50%', md: '25%' },
          minWidth: '200px',
          display: 'flex', 
          gap: 1,
          position: 'absolute',
          left: 0,
          transition: 'all 0.3s ease-in-out',
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            inputRef={searchInputRef}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <IconButton 
            onClick={() => {
              onVisibilityChange(false);
              onSearch('');
            }} 
            size="small"
            aria-label="Hide search"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Fade>
    </Box>
  );
};

/**
 * ProjectListItem component for rendering individual project items
 */
const ProjectListItem: React.FC<{
  project: ProjectSummary;
  menuAnchor: HTMLElement | null;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onProjectOpen: () => void;
  onProjectEdit: () => void;
  onProjectDelete: () => void;
}> = ({
  project,
  menuAnchor,
  onMenuOpen,
  onMenuClose,
  onProjectOpen,
  onProjectEdit,
  onProjectDelete,
}) => (
  <ListItem
    onClick={onProjectOpen}
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
      secondaryTypographyProps={{
        component: 'div'
      }}
      secondary={
        <Box component="span" sx={{ display: 'flex', gap: 2, color: 'text.secondary', typography: 'body2' }}>
          <span>Records: {project.recordCount}</span>
          <span>Updated: {formatDate(project.updatedAt)}</span>
        </Box>
      }
    />
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        onMenuOpen(e);
      }}
      size="small"
      aria-label="More options"
    >
      <MoreVertIcon />
    </IconButton>
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={onMenuClose}
    >
      <MenuItem onClick={(e) => {
        e.stopPropagation();
        onMenuClose();
        onProjectEdit();
      }}>
        Edit
      </MenuItem>
      <MenuItem
        onClick={() => {
          onMenuClose();
          onProjectDelete();
        }}
        sx={{ color: 'error.main' }}
      >
        Delete
      </MenuItem>
    </Menu>
  </ListItem>
);

/**
 * ProjectList component manages the list of projects with search and actions
 */
export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onOpenProject,
  onDeleteProject,
  onEditProject,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<{ id: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SearchBar
        searchTerm={searchTerm}
        isVisible={isSearchVisible}
        onSearch={setSearchTerm}
        onVisibilityChange={setIsSearchVisible}
      />

      <List>
        {filteredProjects.map((project) => (
          <ProjectListItem
            key={project.id}
            project={project}
            menuAnchor={menuAnchor[project.id]}
            onMenuOpen={(e) => setMenuAnchor({ [project.id]: e.currentTarget })}
            onMenuClose={() => setMenuAnchor({ [project.id]: null })}
            onProjectOpen={() => onOpenProject(project.id)}
            onProjectEdit={() => {
              setProjectToEdit({ id: project.id, name: project.name });
              setEditDialogOpen(true);
            }}
            onProjectDelete={() => onDeleteProject(project.id)}
          />
        ))}
        
        {filteredProjects.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {searchTerm ? 'No projects match your search' : 'No projects yet'}
            </Typography>
          </Box>
        )}
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