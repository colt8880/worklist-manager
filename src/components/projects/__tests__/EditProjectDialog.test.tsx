import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditProjectDialog } from '../EditProjectDialog';

describe('EditProjectDialog Component', () => {
  const mockHandlers = {
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with current project name', () => {
    render(
      <EditProjectDialog
        open={true}
        currentName="Test Project"
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Edit Project Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name')).toHaveValue('Test Project');
  });

  it('updates input value when typing', () => {
    render(
      <EditProjectDialog
        open={true}
        currentName="Test Project"
        {...mockHandlers}
      />
    );

    const input = screen.getByLabelText('Project Name');
    fireEvent.change(input, { target: { value: 'Updated Project' } });
    expect(input).toHaveValue('Updated Project');
  });

  it('calls onSave with new name when form is submitted', () => {
    render(
      <EditProjectDialog
        open={true}
        currentName="Test Project"
        {...mockHandlers}
      />
    );

    const input = screen.getByLabelText('Project Name');
    fireEvent.change(input, { target: { value: 'Updated Project' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockHandlers.onSave).toHaveBeenCalledWith('Updated Project');
    expect(mockHandlers.onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <EditProjectDialog
        open={true}
        currentName="Test Project"
        {...mockHandlers}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockHandlers.onClose).toHaveBeenCalled();
    expect(mockHandlers.onSave).not.toHaveBeenCalled();
  });

  it('disables Save button when input is empty', () => {
    render(
      <EditProjectDialog
        open={true}
        currentName="Test Project"
        {...mockHandlers}
      />
    );

    const input = screen.getByLabelText('Project Name');
    const saveButton = screen.getByText('Save');

    // Initially enabled
    expect(saveButton).not.toBeDisabled();

    // Clear input
    fireEvent.change(input, { target: { value: '' } });
    expect(saveButton).toBeDisabled();

    // Add whitespace only
    fireEvent.change(input, { target: { value: '   ' } });
    expect(saveButton).toBeDisabled();
  });

  it('updates input when currentName prop changes', () => {
    const { rerender } = render(
      <EditProjectDialog
        open={true}
        currentName="Test Project"
        {...mockHandlers}
      />
    );

    expect(screen.getByLabelText('Project Name')).toHaveValue('Test Project');

    rerender(
      <EditProjectDialog
        open={true}
        currentName="New Project Name"
        {...mockHandlers}
      />
    );

    expect(screen.getByLabelText('Project Name')).toHaveValue('New Project Name');
  });
}); 