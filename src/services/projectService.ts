import { supabase } from '../config/supabase';
import { Project } from '../types/project';

export const projectService = {
  getProjects: async (username: string): Promise<Project[]> => {
    try {
      console.log('Fetching projects for:', username);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('userId', username);

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('Successfully fetched projects:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getProjects:', error);
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
  }
}; 