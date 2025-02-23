import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewProjectDialog } from '../NewProjectDialog';

describe('NewProjectDialog Component', () => {
  const mockHandlers = {
    onClose: jest.fn(),
    onCreate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <NewProjectDialog
        open={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(
      <NewProjectDialog
        open={true}
        {...mockHandlers}
      />
    );

    const input = screen.getByLabelText('Project Name');
    fireEvent.change(input, { target: { value: 'New Project' } });
    expect(input).toHaveValue('New Project');
  });

  it('calls onCreate with project name when form is submitted', () => {
    render(
      <NewProjectDialog
        open={true}
        {...mockHandlers}
      />
    );

    const input = screen.getByLabelText('Project Name');
    fireEvent.change(input, { target: { value: 'New Project' } });
    
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    expect(mockHandlers.onCreate).toHaveBeenCalledWith('New Project');
    expect(mockHandlers.onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <NewProjectDialog
        open={true}
        {...mockHandlers}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockHandlers.onClose).toHaveBeenCalled();
    expect(mockHandlers.onCreate).not.toHaveBeenCalled();
  });

  it('disables Create button when input is empty', () => {
    render(
      <NewProjectDialog
        open={true}
        {...mockHandlers}
      />
    );

    const input = screen.getByLabelText('Project Name');
    const createButton = screen.getByText('Create');

    // Initially disabled (empty input)
    expect(createButton).toBeDisabled();

    // Add text
    fireEvent.change(input, { target: { value: 'New Project' } });
    expect(createButton).not.toBeDisabled();

    // Clear input
    fireEvent.change(input, { target: { value: '' } });
    expect(createButton).toBeDisabled();

    // Add whitespace only
    fireEvent.change(input, { target: { value: '   ' } });
    expect(createButton).toBeDisabled();
  });

  it('clears input when dialog is reopened', () => {
    const { rerender } = render(
      <NewProjectDialog
        open={true}
        {...mockHandlers}
      />
    );

    const input = screen.getByLabelText('Project Name');
    fireEvent.change(input, { target: { value: 'New Project' } });
    expect(input).toHaveValue('New Project');

    // Close and reopen dialog
    rerender(
      <NewProjectDialog
        open={false}
        {...mockHandlers}
      />
    );
    rerender(
      <NewProjectDialog
        open={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByLabelText('Project Name')).toHaveValue('');
  });
}); 