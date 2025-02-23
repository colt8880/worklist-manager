import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Projects } from '../Projects';
import { ProjectSummary } from '../../../types/project';

const mockProjects: ProjectSummary[] = [
  {
    id: '1',
    name: 'Test Project 1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    recordCount: 5
  },
  {
    id: '2',
    name: 'Test Project 2',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    recordCount: 10
  }
];

const mockHandlers = {
  onNewProject: jest.fn(),
  onOpenProject: jest.fn(),
  onDeleteProject: jest.fn(),
  onEditProject: jest.fn()
};

describe('Projects Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no projects exist', () => {
    render(
      <Projects
        projects={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Create a New Project to Get Started')).toBeInTheDocument();
    expect(screen.getByText('Add Project')).toBeInTheDocument();
  });

  it('renders project list when projects exist', () => {
    render(
      <Projects
        projects={mockProjects}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  it('calls onNewProject when Add Project button is clicked in empty state', () => {
    render(
      <Projects
        projects={[]}
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByText('Add Project'));
    expect(mockHandlers.onNewProject).toHaveBeenCalledTimes(1);
  });

  it('calls onNewProject when New Project button is clicked in list view', () => {
    render(
      <Projects
        projects={mockProjects}
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByText('New Project'));
    expect(mockHandlers.onNewProject).toHaveBeenCalledTimes(1);
  });
}); 