import React, { useState } from 'react';
import { useProjects } from '../../contexts/useProjects';
import { Projects } from './Projects';
import { ProjectContent } from './ProjectContent';
import { NewProjectDialog } from './NewProjectDialog';
import { Box, CircularProgress, Alert } from '@mui/material';
import { projectService } from '../../services/projectService';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';

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
  } = useProjects();

  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const { goToProjects } = useProjectNavigation();

  if (isLoading) {
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

  if (!currentProject) {
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
          onOpenProject={openProjectById}
          onDeleteProject={deleteProject}
          onEditProject={editProject}
        />
        <NewProjectDialog
          open={isNewProjectDialogOpen}
          onClose={() => setIsNewProjectDialogOpen(false)}
          onCreate={createProject}
        />
      </>
    );
  }

  return (
    <ProjectContent
      data={data}
      columns={columns}
      onDataUpdate={updateProjectData}
      onClearData={clearData}
      customColumns={currentProject?.customColumns || {}}
      onAddCustomColumn={async (column) => {
        const updatedProject = {
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
      onBackToProjects={goToProjects}
      userId={userId}
    />
  );
}; 