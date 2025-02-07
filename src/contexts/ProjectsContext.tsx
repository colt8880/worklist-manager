import React, { createContext, useContext } from 'react';
import { useProjects as useProjectsHook } from '../components/projects/hooks/useProjects';
import { Project } from '../types/project';
import { DataRecord } from '../types/datatable';

interface ProjectsContextType {
  projects: Project[];
  currentProject: Project | null;
  data: DataRecord[];
  columns: string[];
  createProject: (name: string) => void;
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
  error: string | null;
  userId: string;
}

export const ProjectsContext = createContext<ProjectsContextType | null>(null);

export const ProjectsProvider: React.FC<{
  children: React.ReactNode;
  username: string;
}> = ({ children, username }) => {
  const projectsData = useProjectsHook(username);
  return (
    <ProjectsContext.Provider value={projectsData}>
      {children}
    </ProjectsContext.Provider>
  );
}; 