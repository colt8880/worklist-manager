import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ProjectList } from '../ProjectList';
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
  onOpenProject: jest.fn(),
  onDeleteProject: jest.fn(),
  onEditProject: jest.fn()
};

describe('ProjectList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all projects', () => {
    render(
      <ProjectList
        projects={mockProjects}
        {...mockHandlers}
      />
    );

    mockProjects.forEach(project => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
      expect(screen.getByText(`Records: ${project.recordCount}`)).toBeInTheDocument();
    });
  });

  it('shows search bar when search icon is clicked', () => {
    render(
      <ProjectList
        projects={mockProjects}
        {...mockHandlers}
      />
    );

    const searchButton = screen.getByRole('button', { name: /show search/i });
    fireEvent.click(searchButton);

    expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument();
  });

  it('filters projects based on search term', () => {
    render(
      <ProjectList
        projects={mockProjects}
        {...mockHandlers}
      />
    );

    // Show search bar
    const searchButton = screen.getByRole('button', { name: /show search/i });
    fireEvent.click(searchButton);

    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search projects...');
    fireEvent.change(searchInput, { target: { value: 'Test Project 1' } });

    // Check that only the matching project is shown
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Project 2')).not.toBeInTheDocument();
  });

  it('opens project menu and handles edit action', () => {
    render(
      <ProjectList
        projects={mockProjects}
        {...mockHandlers}
      />
    );

    // Open menu for first project
    const menuButtons = screen.getAllByRole('button', { name: /more options/i });
    fireEvent.click(menuButtons[0]);

    // Click edit option
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Check if edit dialog is opened
    expect(screen.getByText('Edit Project Name')).toBeInTheDocument();
  });

  it('opens project menu and handles delete action', () => {
    render(
      <ProjectList
        projects={mockProjects}
        {...mockHandlers}
      />
    );

    // Open menu for first project
    const menuButtons = screen.getAllByRole('button', { name: /more options/i });
    fireEvent.click(menuButtons[0]);

    // Click delete option
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDeleteProject).toHaveBeenCalledWith(mockProjects[0].id);
  });

  it('calls onOpenProject when clicking on a project', () => {
    render(
      <ProjectList
        projects={mockProjects}
        {...mockHandlers}
      />
    );

    const firstProject = screen.getByText('Test Project 1').closest('li');
    if (firstProject) {
      fireEvent.click(firstProject);
    }

    expect(mockHandlers.onOpenProject).toHaveBeenCalledWith(mockProjects[0].id);
  });

  it('handles edit project name submission', () => {
    render(
      <ProjectList
        projects={mockProjects}
        {...mockHandlers}
      />
    );

    // Open menu and click edit
    const menuButtons = screen.getAllByRole('button', { name: /more options/i });
    fireEvent.click(menuButtons[0]);
    fireEvent.click(screen.getByText('Edit'));

    // Change project name
    const input = screen.getByLabelText('Project Name');
    fireEvent.change(input, { target: { value: 'Updated Project Name' } });

    // Submit form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockHandlers.onEditProject).toHaveBeenCalledWith(
      mockProjects[0].id,
      'Updated Project Name'
    );
  });

  it('shows no projects message when search returns no results', () => {
    render(
      <ProjectList
        projects={mockProjects}
        {...mockHandlers}
      />
    );

    // Show search bar
    const searchButton = screen.getByRole('button', { name: /show search/i });
    fireEvent.click(searchButton);

    // Enter search term that won't match any projects
    const searchInput = screen.getByPlaceholderText('Search projects...');
    fireEvent.change(searchInput, { target: { value: 'No Match' } });

    expect(screen.getByText('No projects match your search')).toBeInTheDocument();
  });
}); 