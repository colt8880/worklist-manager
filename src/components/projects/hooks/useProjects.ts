import { useState, useEffect, useRef, useCallback } from 'react';
import { Project, ProjectSummary, CustomColumn } from '../../../types/project';
import { DataRecord } from '../../../types';
import { projectService } from '../../../services/projectService';
import { supabase } from '../../../config/supabase';
import React from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

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

interface ProjectsCache {
  userId: string | null;
  projects: Project[];
  timestamp: number;
}

/**
 * Custom hook for managing projects state and operations
 * @param userId - The ID of the current user
 */
export const useProjects = (userId: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [data, setData] = useState<DataRecord[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Cache for projects data
  const projectsCache = useRef<ProjectsCache>({
    userId: null,
    projects: [],
    timestamp: 0
  });

  /**
   * Loads projects for the current user
   */
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache validity (5 minutes)
      const now = Date.now();
      const cacheValid = projectsCache.current.userId === userId && 
                        (now - projectsCache.current.timestamp) < 300000;

      if (cacheValid) {
        setProjects(projectsCache.current.projects);
        setIsLoading(false);
        return;
      }

      const fetchedProjects = await projectService.getProjects(userId);
      setProjects(fetchedProjects);
      
      // Update cache
      projectsCache.current = {
        userId,
        projects: fetchedProjects,
        timestamp: now
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Creates a new project
   * @param name - The name of the new project
   * @returns The created project
   */
  const createProject = async (name: string): Promise<Project> => {
    try {
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

      const savedProject = await projectService.saveProject(userId, newProject);
      setProjects(prev => [...prev, savedProject]);
      setCurrentProject(savedProject);
      clearData();
      showNotification('Project created successfully', 'success');
      return savedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }
  };

  /**
   * Deletes a project
   * @param projectId - The ID of the project to delete
   */
  const deleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(userId, projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        // Only clear current project if we're viewing the project being deleted
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
          clearData();
        }
        showNotification('Project deleted successfully', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
        showNotification(errorMessage, 'error');
      }
    }
  };

  /**
   * Updates project data
   * @param newData - The new data records
   * @param newColumns - The new columns
   */
  const updateProjectData = async (newData: DataRecord[], newColumns: string[]) => {
    if (!currentProject) return;

    try {
      const updatedProject = {
        ...currentProject,
        data: newData,
        columns: newColumns,
        updatedAt: new Date().toISOString()
      };

      const savedProject = await projectService.saveProject(userId, updatedProject);
      setCurrentProject(savedProject);
      setData(newData);
      setColumns(newColumns);
      // Update the project in the projects array
      setProjects(prev => prev.map(p => p.id === savedProject.id ? savedProject : p));
      showNotification('Project data updated successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project data';
      showNotification(errorMessage, 'error');
      throw err; // Propagate the error to handle it in the UI
    }
  };

  /**
   * Clears the current project data
   */
  const clearData = () => {
    setData([]);
    setColumns([]);
  };

  /**
   * Opens a project
   * @param projectId - The ID of the project to open
   */
  const openProject = useCallback(async (projectId: string) => {
    console.log('=== openProject Called ===');
    console.log('Opening project with ID:', projectId);
    console.log('Current projects state:', projects.map(p => p.id));
    try {
      // Only set loading if we don't have the project yet
      const existingProject = projects.find(p => p.id === projectId);
      console.log('Existing project found:', existingProject?.id);
      
      if (!existingProject) {
        console.log('Setting loading state: true');
        setIsLoading(true);
      }
      setError(null);

      // Always fetch the latest data from the server
      console.log('Fetching latest project data from server');
      const latestProject = await projectService.getProject(userId, projectId);
      
      if (latestProject) {
        console.log('Latest project data received, updating state...');
        console.log('Setting currentProject:', latestProject.id);
        setCurrentProject(latestProject);
        console.log('Setting data:', latestProject.data.length, 'records');
        setData(latestProject.data);
        console.log('Setting columns:', latestProject.columns);
        setColumns(latestProject.columns);
        
        // Update the project in our projects array
        console.log('Updating projects array...');
        setProjects(prev => {
          const exists = prev.some(p => p.id === projectId);
          if (exists) {
            console.log('Updating existing project in array');
            return prev.map(p => p.id === projectId ? latestProject : p);
          } else {
            console.log('Adding new project to array');
            return [...prev, latestProject];
          }
        });
      } else {
        console.log('Project not found on server');
        setError('Project not found');
        showNotification('Project not found', 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open project';
      console.error('Error in openProject:', errorMessage);
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      console.log('Setting loading state: false');
      setIsLoading(false);
      console.log('=== openProject Complete ===');
    }
  }, [projects, userId]);

  /**
   * Edits a project's name
   * @param projectId - The ID of the project to edit
   * @param name - The new name for the project
   */
  const editProject = async (projectId: string, name: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedProject = {
        ...project,
        name,
        updatedAt: new Date().toISOString()
      };

      await projectService.saveProject(userId, updatedProject);
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
      showNotification('Project renamed successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename project';
      showNotification(errorMessage, 'error');
    }
  };

  /**
   * Updates a single cell in the current project
   * @param rowIndex - The index of the row to update
   * @param column - The column name
   * @param value - The new value
   */
  const updateCell = async (rowIndex: number, column: string, value: any) => {
    if (!currentProject) return;

    try {
      const newData = data.map((row, index) => 
        index === rowIndex ? { ...row, [column]: value } : row
      );
      
      const updatedProject = {
        ...currentProject,
        data: newData,
        updatedAt: new Date().toISOString()
      };

      const savedProject = await projectService.saveProject(userId, updatedProject);
      setCurrentProject(savedProject);
      setData(savedProject.data);
      // Update the project in the projects array
      setProjects(prev => prev.map(p => p.id === savedProject.id ? savedProject : p));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cell';
      showNotification(errorMessage, 'error');
    }
  };

  // Load projects on mount and when userId changes
  useEffect(() => {
    loadProjects();
  }, [userId]);

  return {
    projects,
    currentProject,
    data,
    columns,
    isLoading,
    error,
    userId,
    createProject,
    deleteProject,
    openProject,
    updateProjectData,
    clearData,
    setCurrentProject,
    editProject,
    setProjects,
    setColumns,
    updateCell,
    setIsLoading,
  };
}; 