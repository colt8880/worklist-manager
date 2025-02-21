import { useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/useProjects';

export const useProjectNavigation = () => {
  const navigate = useNavigate();
  const { setCurrentProject } = useProjects();

  const goToProjects = () => {
    setCurrentProject(null);
    navigate('/projects');
  };

  return {
    goToProjects
  };
}; 