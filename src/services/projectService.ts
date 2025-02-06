import { Project, ProjectSummary } from '../types/project';

// Simulating API calls with localStorage
const STORAGE_KEY = 'projects';

const getStoredProjects = (username: string): Project[] => {
  const stored = localStorage.getItem(`${STORAGE_KEY}_${username}`);
  return stored ? JSON.parse(stored) : [];
};

const setStoredProjects = (username: string, projects: Project[]) => {
  localStorage.setItem(`${STORAGE_KEY}_${username}`, JSON.stringify(projects));
};

export const projectService = {
  getProjects: async (username: string): Promise<Project[]> => {
    return getStoredProjects(username);
  },

  createProject: async (username: string, name: string): Promise<Project> => {
    const projects = getStoredProjects(username);
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: username,
      data: [],
      columns: [],
      customColumns: {},
    };
    
    projects.push(newProject);
    setStoredProjects(username, projects);
    return newProject;
  },

  updateProject: async (username: string, projectId: string, updates: Partial<Project>): Promise<Project> => {
    const projects = getStoredProjects(username);
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) throw new Error('Project not found');

    const updatedProject = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    projects[index] = updatedProject;
    setStoredProjects(username, projects);
    return updatedProject;
  },

  deleteProject: async (username: string, projectId: string): Promise<void> => {
    const projects = getStoredProjects(username);
    const filtered = projects.filter(p => p.id !== projectId);
    setStoredProjects(username, filtered);
  }
}; 