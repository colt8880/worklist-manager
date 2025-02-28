import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../../types/project';
import { DataRecord } from '../../types';
import { projectService } from '../../services/projectService';
import { WritableDraft } from 'immer/dist/internal';
import { v4 as uuidv4 } from 'uuid';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  data: DataRecord[];
  columns: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  data: [],
  columns: [],
  isLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (userId: string, { rejectWithValue }) => {
    try {
      const projects = await projectService.getProjects(userId);
      return projects;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async ({ name, userId }: { name: string; userId: string }, { rejectWithValue }) => {
    try {
      const newProject: Project = {
        id: uuidv4(), // Generate a UUID for new projects
        name,
        userId,
        data: [],
        columns: [],
        customColumns: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const project = await projectService.saveProject(userId, newProject);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async ({ userId, projectId }: { userId: string; projectId: string }, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(userId, projectId);
      return projectId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async (
    { userId, projectId, name }: { userId: string; projectId: string; name: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { projects: ProjectsState };
      const existingProject = state.projects.projects.find((p) => p.id === projectId);
      if (!existingProject) {
        throw new Error('Project not found');
      }
      const updatedProject: Project = {
        ...existingProject,
        name,
        updatedAt: new Date().toISOString(),
      };
      const project = await projectService.saveProject(userId, updatedProject);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProjectData = createAsyncThunk(
  'projects/updateProjectData',
  async (
    {
      userId,
      projectId,
      data,
      columns,
    }: { userId: string; projectId: string; data: DataRecord[]; columns: string[] },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { projects: ProjectsState };
      const existingProject = state.projects.projects.find((p) => p.id === projectId);
      if (!existingProject) {
        throw new Error('Project not found');
      }
      const updatedProject: Project = {
        ...existingProject,
        data,
        columns,
        customColumns: existingProject.customColumns || {},
        updatedAt: new Date().toISOString(),
      };
      const project = await projectService.saveProject(userId, updatedProject);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCustomColumns = createAsyncThunk(
  'projects/updateCustomColumns',
  async (
    {
      userId,
      projectId,
      customColumns,
      columns,
    }: {
      userId: string;
      projectId: string;
      customColumns: { [key: string]: any };
      columns: string[];
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { projects: ProjectsState };
      const existingProject = state.projects.projects.find((p) => p.id === projectId);
      if (!existingProject) {
        throw new Error('Project not found');
      }
      const updatedProject: Project = {
        ...existingProject,
        customColumns,
        columns,
        updatedAt: new Date().toISOString(),
      };
      const project = await projectService.saveProject(userId, updatedProject);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

function updateStateWithProject(state: WritableDraft<ProjectsState>, project: Project) {
  const index = state.projects.findIndex((p) => p.id === project.id);
  if (index !== -1) {
    // Ensure we preserve any existing customColumns if not provided in the update
    const existingProject = state.projects[index];
    state.projects[index] = {
      ...project,
      customColumns: project.customColumns || existingProject.customColumns || {},
    } as WritableDraft<Project>;
  } else {
    // Add the project if it doesn't exist
    state.projects.push(project as WritableDraft<Project>);
  }
  // Set as current project when creating/updating
  state.currentProject = {
    ...project,
    customColumns: project.customColumns || state.currentProject?.customColumns || {},
  } as WritableDraft<Project>;
  state.data = project.data as WritableDraft<DataRecord[]>;
  state.columns = project.columns;
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload as WritableDraft<Project> | null;
      if (action.payload) {
        state.data = action.payload.data as WritableDraft<DataRecord[]>;
        state.columns = action.payload.columns;
      } else {
        state.data = [];
        state.columns = [];
      }
    },
    clearProjectData: (state) => {
      state.data = [];
      state.columns = [];
    },
    updateCell: (state, action: PayloadAction<{ rowId: string | number; column: string; value: any }>) => {
      const { rowId, column, value } = action.payload;
      const rowIndex = state.data.findIndex((row: DataRecord) => row.id === rowId);
      if (rowIndex !== -1) {
        state.data[rowIndex] = {
          ...state.data[rowIndex],
          [column]: value,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload as WritableDraft<Project[]>;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        updateStateWithProject(state, action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = state.projects.filter((p) => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
          state.data = [];
          state.columns = [];
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        updateStateWithProject(state, action.payload);
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Project Data
      .addCase(updateProjectData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProjectData.fulfilled, (state, action) => {
        state.isLoading = false;
        updateStateWithProject(state, action.payload);
      })
      .addCase(updateProjectData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCustomColumns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomColumns.fulfilled, (state, action) => {
        state.isLoading = false;
        updateStateWithProject(state, action.payload);
      })
      .addCase(updateCustomColumns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentProject, clearProjectData, updateCell } = projectsSlice.actions;
export default projectsSlice.reducer; 