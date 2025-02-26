import React, { useState, useEffect } from 'react';
import { useProjects } from '../../contexts/useProjects';
import { Projects } from './Projects';
import { ProjectContent } from './ProjectContent';
import { NewProjectDialog } from './NewProjectDialog';
import { Box, CircularProgress, Alert } from '@mui/material';
import { projectService } from '../../services/projectService';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '../../types/project';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    currentProject,
    isLoading,
    error,
    data,
    columns,
    createProject,
    deleteProject,
    openProject: openProjectById,
    updateProjectData,
    clearData,
    setCurrentProject,
    editProject,
    setProjects,
    setColumns,
    updateCell,
    userId,
    setIsLoading,
  } = useProjects();

  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const hasCleared = React.useRef(false);

  // Handle project loading when URL contains project ID
  useEffect(() => {
    const loadProject = async () => {
      console.log('useEffect triggered with projectId:', projectId);
      console.log('Current project state:', currentProject);

      if (!projectId) {
        // Only clear if we haven't already cleared and there's a current project
        if (!hasCleared.current && currentProject !== null) {
          console.log('No projectId, clearing current project');
          setCurrentProject(null);
          clearData();
          hasCleared.current = true;
        }
        return;
      }

      // Reset the cleared flag when we have a projectId
      hasCleared.current = false;

      // Don't reload if we already have the correct project
      if (currentProject && currentProject.id === projectId) {
        console.log('Project already loaded:', projectId);
        return;
      }

      // Load the project
      try {
        console.log('Loading project:', projectId);
        setIsLoading(true);
        await openProjectById(projectId);
        console.log('Project loaded successfully:', projectId);
      } catch (error: any) {
        console.error('Failed to load project:', error);
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, currentProject, openProjectById]);

  const handleOpenProject = (id: string) => {
    console.log('handleOpenProject called with id:', id);
    navigate(`/projects/${id}`);
  };

  const handleBackToProjects = () => {
    console.log('handleBackToProjects called');
    navigate('/projects');
  };

  const handleCreateProject = async (name: string) => {
    try {
      const newProject = await createProject(name);
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  // Show loading state only when initially loading projects
  if (isLoading && !projects.length) {
    console.log('Showing initial loading state');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.log('Showing error state:', error);
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  // Use URL to determine which view to show
  if (!projectId) {
    console.log('Rendering projects list view');
    return (
      <>
        <Projects
          projects={projects.map(p => ({
            id: p.id,
            name: p.name,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            recordCount: p.data.length
          }))}
          onNewProject={() => setIsNewProjectDialogOpen(true)}
          onOpenProject={handleOpenProject}
          onDeleteProject={async (id) => {
            console.log('Deleting project:', id);
            await deleteProject(id);
            if (projectId === id) {
              navigate('/projects');
            }
          }}
          onEditProject={editProject}
        />
        <NewProjectDialog
          open={isNewProjectDialogOpen}
          onClose={() => setIsNewProjectDialogOpen(false)}
          onCreate={handleCreateProject}
        />
      </>
    );
  }

  // Show loading state when switching between projects or loading a specific project
  if (isLoading || !currentProject || currentProject.id !== projectId) {
    console.log('Showing project loading state:', {
      isLoading,
      hasCurrentProject: !!currentProject,
      currentProjectId: currentProject?.id,
      requestedProjectId: projectId
    });
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log('Rendering project content view for project:', currentProject.id);

  return (
    <ProjectContent
      data={data}
      columns={columns}
      onDataUpdate={updateProjectData}
      onClearData={clearData}
      customColumns={currentProject?.customColumns || {}}
      onAddCustomColumn={async (column) => {
        if (!currentProject) return;
        
        const updatedProject: Project = {
          ...currentProject,
          customColumns: { ...currentProject.customColumns, [column.name]: column },
          columns: [...currentProject.columns, column.name]
        };
        
        await projectService.saveProject(userId, updatedProject);
        setCurrentProject(updatedProject);
        setColumns([...columns, column.name]);
        setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
      }}
      onUpdateData={updateCell}
      currentProject={currentProject}
      setCurrentProject={setCurrentProject}
      onBackToProjects={handleBackToProjects}
      userId={userId}
    />
  );
}; 