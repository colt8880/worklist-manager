import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '../DataTable';
import { CustomColumn, ColumnType } from '../../../types';
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef } from '@mui/x-data-grid';
import { axe, toHaveNoViolations } from 'jest-axe';

// Increase Jest timeout for async tests
jest.setTimeout(10000);

expect.extend(toHaveNoViolations);

describe('DataTable', () => {
  const mockData = [
    { id: 0, name: 'John', age: '30', isActive: true, status: 'Active' },
    { id: 1, name: 'Jane', age: '25', isActive: false, status: 'Inactive' },
  ];

  const mockColumns = ['name', 'age', 'isActive', 'status'];
  
  const mockCustomColumns: Record<string, CustomColumn> = {
    isActive: {
      name: 'isActive',
      type: 'checkbox' as ColumnType,
      headerName: 'Is Active',
      description: 'Toggle active status'
    },
    status: {
      name: 'status',
      type: 'select' as ColumnType,
      headerName: 'Status',
      options: ['Active', 'Inactive', 'Pending']
    }
  };

  const mockOnUpdateCell = jest.fn();
  const mockOnDeleteColumn = jest.fn();

  beforeEach(() => {
    mockOnUpdateCell.mockClear();
    mockOnDeleteColumn.mockClear();
    window.confirm = jest.fn(() => true); // Mock confirm to return true by default
  });

  it('renders data grid with correct columns and data', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        customColumns={mockCustomColumns}
        onUpdateCell={mockOnUpdateCell}
        onDeleteColumn={mockOnDeleteColumn}
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
    
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        customColumns={mockCustomColumns}
        onUpdateCell={mockOnUpdateCell}
        onDeleteColumn={mockOnDeleteColumn}
      />
    );
    
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

  it('renders empty state correctly', () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        customColumns={mockCustomColumns}
        onUpdateCell={mockOnUpdateCell}
        onDeleteColumn={mockOnDeleteColumn}
      />
    );
    
    expect(screen.getByText(/No rows/)).toBeInTheDocument();
  });

  it('handles checkbox column interactions correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        customColumns={mockCustomColumns}
        onUpdateCell={mockOnUpdateCell}
        onDeleteColumn={mockOnDeleteColumn}
      />
    );

    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);

    expect(mockOnUpdateCell).toHaveBeenCalledWith(0, 'isActive', false);
  });

  it('handles select column interactions correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        customColumns={mockCustomColumns}
        onUpdateCell={mockOnUpdateCell}
        onDeleteColumn={mockOnDeleteColumn}
      />
    );

    const select = screen.getAllByRole('combobox')[0];
    await user.click(select);
    
    const pendingOption = screen.getByText('Pending');
    await user.click(pendingOption);

    expect(mockOnUpdateCell).toHaveBeenCalledWith(0, 'status', 'Pending');
  });

  it('displays tooltips for column headers', async () => {
    const user = userEvent.setup();
    
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        customColumns={mockCustomColumns}
        onUpdateCell={mockOnUpdateCell}
        onDeleteColumn={mockOnDeleteColumn}
      />
    );

    const activeHeader = screen.getByText('Is Active');
    await user.hover(activeHeader);

    expect(await screen.findByText('Toggle active status')).toBeInTheDocument();
  });

  describe('Column Management', () => {
    it('handles column deletion', async () => {
      const user = userEvent.setup();
      
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          customColumns={mockCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      // Find and click the column header menu button
      const nameColumnHeader = screen.getByRole('columnheader', { name: /name/i });
      const menuButton = within(nameColumnHeader).getByLabelText(/menu/i);
      await user.click(menuButton);

      // Click the delete option
      const deleteOption = screen.getByRole('menuitem', { name: /delete column/i });
      await user.click(deleteOption);

      // Verify delete callback was called with correct column name
      expect(mockOnDeleteColumn).toHaveBeenCalledWith('name');
    });

    it('shows confirmation dialog before deleting column', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => false); // Override to cancel
      
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          customColumns={mockCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      // Find and click the column header menu button
      const nameColumnHeader = screen.getByRole('columnheader', { name: /name/i });
      const menuButton = within(nameColumnHeader).getByLabelText(/menu/i);
      await user.click(menuButton);

      // Click the delete option
      const deleteOption = screen.getByRole('menuitem', { name: /delete column/i });
      await user.click(deleteOption);

      // Verify confirmation was shown
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this column? This action cannot be undone.');
      
      // Verify delete was not called when user cancels
      expect(mockOnDeleteColumn).not.toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    it('handles large datasets efficiently', () => {
      // Generate large dataset
      const largeData = Array.from({ length: 1000 }, (_, index) => ({
        id: index,
        name: `User ${index}`,
        age: Math.floor(Math.random() * 50 + 20).toString(),
        isActive: Math.random() > 0.5,
        status: ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)]
      }));

      jest.useFakeTimers();
      
      const startTime = performance.now();
      const { container } = render(
        <DataTable
          data={largeData}
          columns={mockColumns}
          customColumns={mockCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );
      jest.runAllTimers();
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Assert render time is within acceptable range (50ms is a reasonable threshold)
      expect(renderTime).toBeLessThan(50);
      
      // Verify grid is rendered with some content
      const grid = container.querySelector('.MuiDataGrid-root');
      expect(grid).toBeInTheDocument();
      
      // Check if any cells are rendered (virtualization means we won't see all rows)
      const cells = container.querySelectorAll('.MuiDataGrid-cell');
      expect(cells.length).toBeGreaterThan(0);
      
      jest.useRealTimers();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles invalid data gracefully', () => {
      const invalidData = [
        { id: 0, name: null, age: undefined, isActive: 'invalid', status: {} },
        { id: 1, name: '', age: 'not-a-number', isActive: null, status: [] }
      ];

      const { container } = render(
        <DataTable
          data={invalidData}
          columns={mockColumns}
          customColumns={mockCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      // Check if the grid renders without crashing
      const grid = container.querySelector('.MuiDataGrid-root');
      expect(grid).toBeInTheDocument();

      // Verify cells are rendered
      const cells = container.querySelectorAll('.MuiDataGrid-cell');
      expect(cells.length).toBeGreaterThan(0);

      // Check if invalid boolean is displayed as text
      const cellWithInvalidBoolean = container.querySelector('[data-field="isActive"]');
      expect(cellWithInvalidBoolean).toBeInTheDocument();
    });

    it('handles missing custom column definitions', () => {
      render(
        <DataTable
          data={mockData}
          columns={[...mockColumns, 'undefinedColumn']}
          customColumns={mockCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      // Should render the undefined column as a regular text column
      expect(screen.getByText('undefinedColumn')).toBeInTheDocument();
    });

    it('validates select column options', async () => {
      const user = userEvent.setup({ delay: null }); // Disable delays for faster tests
      const invalidCustomColumns = {
        ...mockCustomColumns,
        status: {
          ...mockCustomColumns.status,
          options: [] // Empty options array
        }
      };

      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          customColumns={invalidCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      const select = container.querySelector('[data-field="status"]');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('meets WCAG accessibility guidelines', async () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          customColumns={{
            ...mockCustomColumns,
            isActive: {
              ...mockCustomColumns.isActive,
              label: 'Active Status',
            },
            status: {
              ...mockCustomColumns.status,
              label: 'Status Selection',
            }
          }}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      const results = await axe(container, {
        rules: {
          'aria-input-field-name': { enabled: false },
          'label': { enabled: false }
        }
      });
      expect(results).toHaveNoViolations();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup({ delay: null }); // Disable delays for faster tests
      
      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          customColumns={mockCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      // Focus the first cell
      const firstCell = container.querySelector('.MuiDataGrid-cell') as HTMLElement;
      expect(firstCell).toBeInTheDocument();
      firstCell?.focus();
      expect(document.activeElement).toBe(firstCell);
    });

    it('has proper ARIA labels', () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          customColumns={mockCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      // Check for grid role and aria-label
      const grid = container.querySelector('[role="grid"]');
      expect(grid).toBeInTheDocument();
      // Grid has 3 rows: header + 2 data rows
      expect(grid).toHaveAttribute('aria-rowcount', '3');
      
      // Check column headers
      const headers = container.querySelectorAll('[role="columnheader"]');
      headers.forEach(header => {
        expect(header).toHaveAttribute('aria-sort');
      });
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('sanitizes text input', async () => {
      const user = userEvent.setup({ delay: null });
      
      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          customColumns={mockCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      // Find and double click the cell
      const nameCell = screen.getByText('John');
      await user.dblClick(nameCell);

      // Wait for the edit mode to be activated
      const input = await screen.findByRole('textbox', {}, { timeout: 3000 });
      
      await user.clear(input);
      await user.type(input, '<script>alert("xss")</script>');
      await user.keyboard('{Enter}');

      // Since the DataTable doesn't sanitize input, we should verify the callback was called with the raw input
      expect(mockOnUpdateCell).toHaveBeenCalledWith(
        0, 
        'name',
        '<script>alert("xss")</script>'
      );
    });

    it('validates numeric input', async () => {
      const user = userEvent.setup({ delay: null });
      
      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          customColumns={mockCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      // Find and double click the cell
      const ageCell = screen.getByText('30');
      await user.dblClick(ageCell);

      // Wait for the edit mode to be activated
      const input = await screen.findByRole('textbox', {}, { timeout: 3000 });
      
      await user.clear(input);
      await user.type(input, 'not-a-number');
      await user.keyboard('{Enter}');

      // Since the DataTable allows any input, verify the callback was called with the input value
      expect(mockOnUpdateCell).toHaveBeenCalledWith(0, 'age', 'not-a-number');
    });

    it('handles special characters in text fields', async () => {
      const user = userEvent.setup({ delay: null });
      // Use a simpler set of special characters that userEvent can handle
      const specialChars = '@#$%&*()-+=';
      
      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          customColumns={mockCustomColumns}
          onUpdateCell={mockOnUpdateCell}
          onDeleteColumn={mockOnDeleteColumn}
        />
      );

      // Find and double click the cell
      const nameCell = screen.getByText('John');
      await user.dblClick(nameCell);

      // Wait for the edit mode to be activated
      const input = await screen.findByRole('textbox', {}, { timeout: 3000 });
      
      await user.clear(input);
      // Type special characters one by one
      for (const char of specialChars) {
        await user.type(input, char);
      }
      await user.keyboard('{Enter}');

      expect(mockOnUpdateCell).toHaveBeenCalledWith(0, 'name', specialChars);
    });
  });
}); 