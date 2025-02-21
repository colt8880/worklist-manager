import { supabase } from '../config/supabase';
import { Project } from '../types/project';

export const projectService = {
  getProjects: async (username: string): Promise<Project[]> => {
    try {
      console.log('[projectService] Starting getProjects for:', username);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('userId', userData.user.id);

      if (error) {
        console.error('[projectService] Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('[projectService] Successfully fetched projects. Count:', data?.length);
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

      console.log('Current auth state:', {
        user: userData.user,
        session: (await supabase.auth.getSession()).data.session
      });

      console.log('Saving project with data:', {
        username,
        userId: userData.user.id,
        projectId: project.id,
        projectName: project.name
      });

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

      console.log('Formatted project data:', projectData);

      // First, verify we can read from the table
      const { data: testData, error: testError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
      
      console.log('Test read result:', { data: testData, error: testError });

      const { data, error } = await supabase
        .from('projects')
        .upsert(projectData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          user: userData.user.id
        });
        throw error;
      }

      console.log('Successfully saved project:', data);
      return data;
    } catch (error) {
      console.error('Error in saveProject:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
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

    if (error) throw error;
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
        console.error('Error fetching project:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getProject:', error);
      throw error;
    }
  }
}; 