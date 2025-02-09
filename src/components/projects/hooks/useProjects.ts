import { useState, useEffect } from 'react';
import { Project, ProjectSummary, CustomColumn } from '../../../types/project';
import { DataRecord } from '../../../types';
import { projectService } from '../../../services/projectService';
import { supabase } from '../../../config/supabase';
import React from 'react';

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

  // Cache for projects data
  const projectsCache = React.useRef<{
    userId: string | null;
    projects: Project[];
    timestamp: number;
  }>({
    userId: null,
    projects: [],
    timestamp: 0
  });

  // Load projects on mount
  useEffect(() => {
    console.log('useEffect triggered with userId:', userId);
    let isMounted = true;

    const loadProjects = async () => {
      if (!userId || !isMounted) return;

      try {
        setIsLoading(true);
        setError(null);

        // Check cache validity (5 minute expiry)
        const now = Date.now();
        const cacheIsValid = 
          projectsCache.current.userId === userId && 
          projectsCache.current.projects.length > 0 &&
          (now - projectsCache.current.timestamp) < 5 * 60 * 1000;

        if (cacheIsValid) {
          console.log('Using cached projects data');
          setProjects(projectsCache.current.projects);
        } else {
          console.log('Starting to load projects...');
          const loadedProjects = await projectService.getProjects(userId);
          if (isMounted) {
            console.log('Setting projects in state');
            setProjects(loadedProjects);
            // Update cache
            projectsCache.current = {
              userId,
              projects: loadedProjects,
              timestamp: now
            };
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load projects');
          console.error('Error loading projects:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      console.log('useEffect cleanup - unmounting');
      isMounted = false;
    };
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
      // First try to find the project in our existing state
      const existingProject = projects.find(p => p.id === projectId);
      
      if (existingProject) {
        setCurrentProject(existingProject);
        setData(existingProject.data || []);
        setColumns(existingProject.columns || []);
      } else {
        // If not found in state (rare case), fetch from database
        const project = await projectService.getProject(userId, projectId);
        if (project) {
          setCurrentProject(project);
          setData(project.data || []);
          setColumns(project.columns || []);
          // Update projects list to include this project
          setProjects(prev => [...prev, project]);
        }
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
      // Initialize data for checkbox columns with false values
      const updatedData = column.type === 'checkbox'
        ? data.map(row => ({ ...row, [column.name]: false }))
        : data;

      const updatedProject = {
        ...currentProject,
        customColumns: { 
          ...currentProject.customColumns, 
          [column.name]: column 
        },
        columns: [...currentProject.columns, column.name],
        data: updatedData,
        updatedAt: new Date().toISOString()
      };

      // Save to database
      await projectService.saveProject(userId, updatedProject);
      
      // Update local state
      setCurrentProject(updatedProject);
      setProjects(prev => 
        prev.map(p => p.id === currentProject.id ? updatedProject : p)
      );
      setColumns([...columns, column.name]);
      setData(updatedData);
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
      try {
        // Update the data
        const newData = [...data];
        const customColumn = currentProject.customColumns[column];
        
        // Handle checkbox values explicitly
        const processedValue = customColumn?.type === 'checkbox' ? Boolean(value) : value;
        newData[rowIndex] = { ...newData[rowIndex], [column]: processedValue };

        const updatedProject = {
          ...currentProject,
          data: newData,
          updatedAt: new Date().toISOString()
        };

        // Save to database
        const savedProject = await projectService.saveProject(userId, updatedProject);
        
        // Update local state with the saved project data
        setCurrentProject(savedProject);
        setProjects(prev => 
          prev.map(p => p.id === currentProject.id ? savedProject : p)
        );
        setData(savedProject.data);
      } catch (error) {
        console.error('Failed to update cell:', error);
      }
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