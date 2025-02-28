import { supabase } from '../config/supabase';
import { Project } from '../types/project';

export const projectService = {
  getProjects: async (username: string): Promise<Project[]> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('userId', userData.user.id);

      if (error) {
        console.error('[projectService] Error fetching projects:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('[projectService] Error in getProjects:', error);
      throw error;
    }
  },

  saveProject: async (username: string, project: Project): Promise<Project> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('No authenticated user found');
      }

      // Ensure the data is properly formatted for Postgres JSONB
      const projectData = {
        id: project.id,
        name: project.name,
        userId: userData.user.id, // Must match auth.uid()
        data: project.data || [],
        columns: project.columns || [],
        customColumns: project.customColumns || {},
        createdAt: project.createdAt,
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('projects')
        .upsert(projectData)
        .select()
        .single();

      if (error) {
        console.error('[projectService] Error saving project:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          projectId: project.id
        });
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[projectService] Error in saveProject:', error);
      if (error instanceof Error) {
        console.error('[projectService] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  },

  deleteProject: async (username: string, projectId: string): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
      
    if (!userData?.user) {
      throw new Error('No authenticated user found');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('userId', userData.user.id);

    if (error) {
      console.error('[projectService] Error deleting project:', {
        projectId,
        error
      });
      throw error;
    }
  },

  getProject: async (username: string, projectId: string): Promise<Project | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('userId', userData.user.id)
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('[projectService] Error fetching project:', {
          projectId,
          error
        });
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[projectService] Error in getProject:', error);
      throw error;
    }
  }
}; 