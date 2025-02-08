import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '../DataTable';
import { CustomColumn, ColumnType } from '../../../types';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef } from '@mui/x-data-grid';

describe('DataTable', () => {
  const mockData = [
    { id: 0, name: 'John', age: '30' },
    { id: 1, name: 'Jane', age: '25' },
  ];

  const mockColumns: string[] = ['name', 'age'];
  
  const mockCustomColumns: Record<string, CustomColumn> = {
    isActive: {
      name: 'isActive',
      type: 'checkbox' as ColumnType,
      label: 'Is Active'
    }
  };

  const mockOnUpdateCell = jest.fn();

  it('renders data grid with correct columns and data', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        customColumns={mockCustomColumns}
        onUpdateCell={mockOnUpdateCell}
      />
    );

    // Check if column headers are rendered
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();

    // Check if data is rendered
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('handles text cell editing correctly', async () => {
    const user = userEvent.setup();
    
    const { container, debug } = render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        customColumns={mockCustomColumns}
        onUpdateCell={mockOnUpdateCell}
      />
    );

    debug();
    
    // Find and click the cell with John's name
    const nameCell = screen.getByText('John');
    await user.dblClick(nameCell);

    // Wait for the input to appear and find it
    const input = await screen.findByRole('textbox', {}, { timeout: 2000 });
    await user.clear(input);
    await user.type(input, 'Jonathan');
    await user.keyboard('{Enter}');

    expect(mockOnUpdateCell).toHaveBeenCalledWith(0, 'name', 'Jonathan');
  });
}); 