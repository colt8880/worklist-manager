// src/App.tsx
import React, { useState } from 'react';
import { Container, Paper, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Login } from './components/Login';
import { Projects } from './components/Projects';
import { Header } from './components/Header';
import { ProjectContent } from './components/ProjectContent';
import { NewProjectDialog } from './components/NewProjectDialog';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const App: React.FC = () => {
  const { user, authError, login, logout } = useAuth();
  const {
    projects,
    currentProject,
    data,
    columns,
    createProject,
    deleteProject,
    openProject,
    updateProjectData,
    clearData,
    setCurrentProject,
    editProject,
    setProjects,
    setColumns
  } = useProjects(user?.username);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <Login onLogin={login} error={authError} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Header
            user={user}
            onLogout={logout}
          />
          
          {!currentProject ? (
            <Projects
              projects={projects.map(p => ({
                id: p.id,
                name: p.name,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                recordCount: p.data.length
              }))}
              onNewProject={() => setIsNewProjectDialogOpen(true)}
              onOpenProject={openProject}
              onDeleteProject={deleteProject}
              onEditProject={editProject}
            />
          ) : (
            <ProjectContent
              data={data}
              columns={columns}
              onDataUpdate={updateProjectData}
              onClearData={clearData}
              customColumns={currentProject?.customColumns || {}}
              onAddCustomColumn={(column) => {
                if (currentProject) {
                  const updatedProject = {
                    ...currentProject,
                    customColumns: { ...currentProject.customColumns, [column.name]: column },
                    columns: [...currentProject.columns, column.name]
                  };
                  setCurrentProject(updatedProject);
                  setColumns([...columns, column.name]);
                  setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
                }
              }}
              onUpdateData={(newData) => {
                if (currentProject) {
                  updateProjectData(newData, columns);
                }
              }}
              currentProject={currentProject}
              onBackToProjects={() => setCurrentProject(null)}
            />
          )}
        </Paper>
      </Container>
      <NewProjectDialog
        open={isNewProjectDialogOpen}
        onClose={() => setIsNewProjectDialogOpen(false)}
        onCreate={createProject}
      />
    </ThemeProvider>
  );
};

export default App;