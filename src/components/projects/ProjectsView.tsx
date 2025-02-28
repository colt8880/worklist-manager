import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { Projects } from './Projects';
import { ProjectContent } from './ProjectContent';
import { NewProjectDialog } from './NewProjectDialog';
import { useAppSelector, useAppDispatch } from '../../store/store';
import {
  fetchProjects,
  createProject,
  deleteProject,
  updateProject,
  setCurrentProject,
  clearProjectData,
  updateProjectData,
  updateCell,
  updateCustomColumns,
} from '../../store/slices/projectsSlice';
import { setNewProjectDialogOpen } from '../../store/slices/uiSlice';
import { Project, CustomColumn } from '../../types/project';
import { projectService } from '../../services/projectService';
import { debounce } from 'lodash';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    currentProject,
    isLoading,
    error,
    data,
    columns,
  } = useAppSelector((state) => state.projects);
  const { isNewProjectOpen } = useAppSelector((state) => state.ui.dialog);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const hasCleared = React.useRef(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchProjects(user.id));
    }
  }, [dispatch, user]);

  // Handle project loading when URL contains project ID
  useEffect(() => {
    if (!projectId) {
      // Only clear if we haven't already cleared and there's a current project
      if (!hasCleared.current && currentProject !== null) {
        dispatch(setCurrentProject(null));
        dispatch(clearProjectData());
        hasCleared.current = true;
      }
      return;
    }

    // Reset the cleared flag when we have a projectId
    hasCleared.current = false;

    // Always fetch fresh project data when navigating to a project
    const loadProject = async () => {
      if (!user) return;
      
      try {
        // Fetch fresh project data from the database
        const freshProject = await projectService.getProject(user.id, projectId);
        if (freshProject) {
          dispatch(setCurrentProject(freshProject));
        } else {
          navigate('/projects');
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        navigate('/projects');
      }
    };

    loadProject();
  }, [projectId, user, dispatch, navigate]);

  const handleOpenProject = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleCreateProject = async (name: string) => {
    if (!user) return;
    
    try {
      const result = await dispatch(createProject({ name, userId: user.id })).unwrap();
      dispatch(setNewProjectDialogOpen(false));
      // Navigate immediately after creation
      navigate(`/projects/${result.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!user) return;

    try {
      await dispatch(deleteProject({ userId: user.id, projectId: id })).unwrap();
      // Only navigate to projects list if we're currently viewing the project being deleted
      if (projectId === id) {
        navigate('/projects');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleEditProject = async (id: string, name: string) => {
    if (!user) return;

    try {
      await dispatch(updateProject({ userId: user.id, projectId: id, name })).unwrap();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDataUpdate = async (data: any[], columns: string[]) => {
    if (!user || !currentProject) return;

    try {
      await dispatch(updateProjectData({
        userId: user.id,
        projectId: currentProject.id,
        data,
        columns,
      })).unwrap();
    } catch (error) {
      console.error('Failed to update project data:', error);
    }
  };

  const handleCellUpdate = async (rowId: string | number, column: string, value: any) => {
    if (!user || !currentProject) return null;

    try {
      // Update Redux state with just the cell change
      dispatch(updateCell({ rowId, column, value }));

      // Find the existing row
      const existingRow = data.find(row => row.id === rowId);
      if (!existingRow) {
        console.error('Row not found:', rowId);
        return null;
      }

      // Create updated data array for database save
      const updatedData = data.map(row => 
        row.id === rowId ? { ...row, [column]: value } : row
      );

      // Save to database in the background
      projectService.saveProject(user.id, {
        ...currentProject,
        data: updatedData,
        updatedAt: new Date().toISOString(),
      }).catch(error => {
        console.error('Failed to save to database:', error);
      });

      // Return the updated row with id
      return {
        ...existingRow,
        id: rowId, // Ensure the id is included
        [column]: value
      };
    } catch (error) {
      console.error('Failed to update cell:', error);
      return null;
    }
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleAddCustomColumn = async (column: CustomColumn) => {
    if (!user || !currentProject) return;

    try {
      // Update custom columns
      const updatedCustomColumns = {
        ...currentProject.customColumns,
        [column.name]: column,
      };

      // Add new column to columns array
      const updatedColumns = [...currentProject.columns, column.name];
      
      // Create updated project with preserved data
      const updatedProject = {
        ...currentProject,
        customColumns: updatedCustomColumns,
        columns: updatedColumns,
        data: currentProject.data, // Preserve existing data
        updatedAt: new Date().toISOString(),
      };

      // Save to database first
      const savedProject = await projectService.saveProject(user.id, updatedProject);
      
      // Update Redux state with the saved project
      dispatch(setCurrentProject(savedProject));
    } catch (error) {
      console.error('Failed to add custom column:', error);
    }
  };

  // Show loading state only when initially loading projects
  if (isLoading && !projects.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  // Use URL to determine which view to show
  if (!projectId) {
    return (
      <>
        <Projects
          projects={projects.map((p: Project) => ({
            id: p.id,
            name: p.name,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            recordCount: p.data.length
          }))}
          onNewProject={() => dispatch(setNewProjectDialogOpen(true))}
          onOpenProject={handleOpenProject}
          onDeleteProject={handleDeleteProject}
          onEditProject={handleEditProject}
        />
        <NewProjectDialog
          open={isNewProjectOpen}
          onClose={() => dispatch(setNewProjectDialogOpen(false))}
          onCreate={handleCreateProject}
        />
      </>
    );
  }

  // Show loading state when switching between projects or loading a specific project
  if (isLoading || !currentProject || currentProject.id !== projectId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProjectContent
      currentProject={currentProject}
      data={data}
      columns={columns}
      customColumns={currentProject.customColumns}
      onDataUpdate={handleDataUpdate}
      onClearData={() => dispatch(clearProjectData())}
      onAddCustomColumn={handleAddCustomColumn}
      onUpdateData={handleCellUpdate}
      onBackToProjects={handleBackToProjects}
      userId={user?.id || ''}
      setCurrentProject={(project: Project | null) => dispatch(setCurrentProject(project))}
    />
  );
};

export default ProjectsView; 