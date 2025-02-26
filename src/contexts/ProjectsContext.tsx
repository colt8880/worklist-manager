import React, { createContext, useContext, useCallback } from 'react';
import { useProjects as useProjectsHook } from '../components/projects/hooks/useProjects';
import { Project } from '../types/project';
import { DataRecord } from '../types/datatable';
import { useNavigate } from 'react-router-dom';

interface ProjectsContextType {
  projects: Project[];
  currentProject: Project | null;
  data: DataRecord[];
  columns: string[];
  createProject: (name: string) => Promise<Project>;
  deleteProject: (projectId: string) => void;
  openProject: (projectId: string) => void;
  updateProjectData: (data: DataRecord[], columns: string[]) => void;
  clearData: () => void;
  setCurrentProject: (project: Project | null) => void;
  editProject: (projectId: string, name: string) => void;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setColumns: React.Dispatch<React.SetStateAction<string[]>>;
  updateCell: (rowIndex: number, column: string, value: any) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  userId: string;
  goToProjectsList: () => void;
}

export const ProjectsContext = createContext<ProjectsContextType | null>(null);

export const ProjectsProvider: React.FC<{
  children: React.ReactNode;
  username: string;
}> = ({ children, username }) => {
  const projectsData = useProjectsHook(username);
  const navigate = useNavigate();

  const goToProjectsList = useCallback(() => {
    // First clear the state
    projectsData.setCurrentProject(null);
    projectsData.clearData();
    // Then navigate
    navigate('/projects');
  }, [projectsData, navigate]);

  // Ensure the userId is properly passed through the context
  const contextValue = {
    ...projectsData,
    userId: username, // Explicitly set the userId to match the username
    goToProjectsList
  };

  return (
    <ProjectsContext.Provider value={contextValue} data-projects-context>
      {children}
    </ProjectsContext.Provider>
  );
}; 