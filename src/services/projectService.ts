import { supabase } from '../config/supabase';
import { Project } from '../types/project';

export const projectService = {
  getProjects: async (username: string): Promise<Project[]> => {
    try {
      console.log('[projectService] Starting getProjects for:', username);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('userId', username);

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
      console.log('Saving project:', project);
      const { data, error } = await supabase
        .from('projects')
        .upsert({
          id: project.id,
          name: project.name,
          userId: username,
          data: project.data,
          columns: project.columns,
          columnOrder: project.columnOrder,
          customColumns: project.customColumns,
          createdAt: project.createdAt,
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving project:', error);
        throw error;
      }
      console.log('Successfully saved project:', data);
      return data;
    } catch (error) {
      console.error('Error in saveProject:', error);
      throw error;
    }
  },

  deleteProject: async (username: string, projectId: string): Promise<void> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('userId', username);

    if (error) throw error;
  },

  getProject: async (username: string, projectId: string): Promise<Project | null> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('userId', username)
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