import { renderHook, act } from '@testing-library/react';
import { useProjects } from '../useProjects';
import { projectService } from '../../../../services/projectService';
import * as NotificationContext from '../../../../contexts/NotificationContext';

// Mock dependencies
jest.mock('../../../../services/projectService');

const mockShowNotification = jest.fn();

const mockProject = {
  id: '1',
  name: 'Test Project',
  userId: 'test-user',
  data: [],
  columns: [],
  customColumns: {},
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('useProjects Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(NotificationContext, 'useNotification').mockReturnValue({
      showNotification: mockShowNotification
    });
    (projectService.getProjects as jest.Mock).mockResolvedValue([mockProject]);
    (projectService.saveProject as jest.Mock).mockResolvedValue(mockProject);
    (projectService.getProject as jest.Mock).mockResolvedValue(mockProject);
    (projectService.deleteProject as jest.Mock).mockResolvedValue(undefined);
  });

  it('loads projects on mount', async () => {
    const { result } = renderHook(() => useProjects('test-user'));

    expect(result.current.isLoading).toBe(true);
    
    // Wait for projects to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.projects).toEqual([mockProject]);
    expect(projectService.getProjects).toHaveBeenCalledWith('test-user');
  });

  it('creates a new project', async () => {
    const { result } = renderHook(() => useProjects('test-user'));

    await act(async () => {
      await result.current.createProject('New Project');
    });

    expect(projectService.saveProject).toHaveBeenCalled();
    expect(mockShowNotification).toHaveBeenCalledWith('Project created successfully', 'success');
  });

  it('deletes a project', async () => {
    const { result } = renderHook(() => useProjects('test-user'));
    window.confirm = jest.fn(() => true);

    await act(async () => {
      await result.current.deleteProject('1');
    });

    expect(projectService.deleteProject).toHaveBeenCalledWith('test-user', '1');
    expect(mockShowNotification).toHaveBeenCalledWith('Project deleted successfully', 'success');
  });

  it('opens a project', async () => {
    const { result } = renderHook(() => useProjects('test-user'));

    await act(async () => {
      await result.current.openProject('1');
    });

    expect(projectService.getProject).toHaveBeenCalledWith('test-user', '1');
    expect(result.current.currentProject).toEqual(mockProject);
    expect(result.current.data).toEqual(mockProject.data);
    expect(result.current.columns).toEqual(mockProject.columns);
  });

  it('updates project data', async () => {
    const { result } = renderHook(() => useProjects('test-user'));
    const newData = [{ id: 1, name: 'Test' }];
    const newColumns = ['id', 'name'];

    // Set current project first
    await act(async () => {
      await result.current.openProject('1');
    });

    await act(async () => {
      await result.current.updateProjectData(newData, newColumns);
    });

    expect(projectService.saveProject).toHaveBeenCalled();
    expect(mockShowNotification).toHaveBeenCalledWith('Project data updated successfully', 'success');
  });

  it('edits a project name', async () => {
    const { result } = renderHook(() => useProjects('test-user'));

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.editProject('1', 'Updated Name');
    });

    expect(projectService.saveProject).toHaveBeenCalled();
    expect(mockShowNotification).toHaveBeenCalledWith('Project renamed successfully', 'success');
  });

  it('updates a cell value', async () => {
    const { result } = renderHook(() => useProjects('test-user'));

    // Set current project first
    await act(async () => {
      await result.current.openProject('1');
    });

    await act(async () => {
      await result.current.updateCell(0, 'name', 'Updated Value');
    });

    expect(projectService.saveProject).toHaveBeenCalled();
  });

  it('handles errors during project operations', async () => {
    const error = new Error('Test error');
    (projectService.saveProject as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useProjects('test-user'));

    await act(async () => {
      await result.current.createProject('New Project').catch(() => {});
    });

    expect(mockShowNotification).toHaveBeenCalledWith(error.message, 'error');
  });

  it('uses cache for subsequent project loads within 5 minutes', async () => {
    const { result, rerender } = renderHook(() => useProjects('test-user'));

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Clear mock calls
    (projectService.getProjects as jest.Mock).mockClear();

    // Rerender hook
    rerender();

    expect(projectService.getProjects).not.toHaveBeenCalled();
    expect(result.current.projects).toEqual([mockProject]);
  });
}); 