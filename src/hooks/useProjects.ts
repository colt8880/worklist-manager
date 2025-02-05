import { useState, useEffect } from 'react';
import { Project, ProjectSummary } from '../types/project';
import { DataRecord } from '../types';

// Mock project data - replace with API calls in production
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Sample Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: [],
    columns: [],
    customColumns: {},
    userId: 'admin'
  }
];

export const useProjects = (userId: string | undefined) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [data, setData] = useState<DataRecord[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      // Mock API call - replace with real API
      const userProjects = mockProjects.filter(p => p.userId === userId);
      setProjects(userProjects);
    }
  }, [userId]);

  const createProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: [],
      columns: [],
      customColumns: {},
      userId: userId || ''
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    clearData();
  };

  const deleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
        clearData();
      }
    }
  };

  const openProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      setData(project.data);
      setColumns(project.columns);
    }
  };

  const updateProjectData = (uploadedData: DataRecord[], detectedColumns: string[]) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        data: uploadedData,
        columns: detectedColumns,
        updatedAt: new Date().toISOString()
      };
      setCurrentProject(updatedProject);
      setProjects(prev => 
        prev.map(p => p.id === currentProject.id ? updatedProject : p)
      );
      setData(uploadedData);
      setColumns(detectedColumns);
    }
  };

  const clearData = () => {
    setData([]);
    setColumns([]);
  };

  const editProject = (projectId: string, newName: string) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId
        ? { ...project, name: newName, updatedAt: new Date().toISOString() }
        : project
    );
    setProjects(updatedProjects);
    
    if (currentProject?.id === projectId) {
      setCurrentProject({ ...currentProject, name: newName });
    }
  };

  return {
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
  };
}; 