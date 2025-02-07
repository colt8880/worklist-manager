import { useState, useEffect } from 'react';
import { Project, ProjectSummary, CustomColumn } from '../../../types/project';
import { DataRecord } from '../../../types';
import { projectService } from '../../../services/projectService';
import { supabase } from '../../../config/supabase';

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

export const useProjects = (userId: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [data, setData] = useState<DataRecord[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      if (userId) {
        try {
          setIsLoading(true);
          setError(null);
          const loadedProjects = await projectService.getProjects(userId);
          setProjects(loadedProjects);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load projects');
          console.error('Error loading projects:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadProjects();
  }, [userId]);

  const createProject = async (name: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
      data: [],
      columns: [],
      customColumns: {},
    };

    await projectService.saveProject(userId, newProject);
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    clearData();
  };

  const deleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await projectService.deleteProject(userId, projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
        clearData();
      }
    }
  };

  const openProject = async (projectId: string) => {
    try {
      // Get fresh data from Supabase
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projects) {
        setCurrentProject(projects);
        setData(projects.data || []);
        setColumns(projects.columns || []);
      }
    } catch (error) {
      console.error('Error opening project:', error);
      // Optionally handle error
    }
  };

  const updateProjectData = async (uploadedData: DataRecord[], detectedColumns: string[]) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        data: uploadedData,
        columns: detectedColumns,
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      await projectService.saveProject(userId, updatedProject);
      
      // Update local state
      setCurrentProject(updatedProject);
      setProjects(prev => 
        prev.map(p => p.id === currentProject.id ? updatedProject : p)
      );
      setData(uploadedData);
      setColumns(detectedColumns);
    }
  };

  const clearData = async () => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        data: [],
        columns: [],
        updatedAt: new Date().toISOString()
      };

      // Save cleared state to localStorage
      await projectService.saveProject(userId, updatedProject);
      
      // Update local state
      setCurrentProject(updatedProject);
      setProjects(prev => 
        prev.map(p => p.id === currentProject.id ? updatedProject : p)
      );
    }
    setData([]);
    setColumns([]);
  };

  const addCustomColumn = async (column: CustomColumn) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        customColumns: { 
          ...currentProject.customColumns, 
          [column.name]: column 
        },
        columns: [...currentProject.columns, column.name],
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      await projectService.saveProject(userId, updatedProject);
      
      // Update local state
      setCurrentProject(updatedProject);
      setProjects(prev => 
        prev.map(p => p.id === currentProject.id ? updatedProject : p)
      );
      setColumns([...columns, column.name]);
    }
  };

  const editProject = async (projectId: string, newName: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedProject = {
        ...project,
        name: newName,
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      await projectService.saveProject(userId, updatedProject);
      
      // Update local state
      setProjects(prev => 
        prev.map(p => p.id === projectId ? updatedProject : p)
      );
      
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
    }
  };

  const updateCell = async (rowIndex: number, column: string, value: any) => {
    if (currentProject) {
      // Update the data
      const newData = [...data];
      newData[rowIndex] = { ...newData[rowIndex], [column]: value };

      const updatedProject = {
        ...currentProject,
        data: newData,
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      await projectService.saveProject(userId, updatedProject);
      
      // Update local state
      setCurrentProject(updatedProject);
      setProjects(prev => 
        prev.map(p => p.id === currentProject.id ? updatedProject : p)
      );
      setData(newData);
    }
  };

  return {
    projects,
    currentProject,
    data,
    columns,
    isLoading,
    error,
    createProject,
    deleteProject,
    openProject,
    updateProjectData,
    clearData,
    setCurrentProject,
    editProject,
    setProjects,
    setColumns,
    addCustomColumn,
    updateCell,
    userId,
  };
}; 