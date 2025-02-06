import React from 'react';
import { DataGrid, GridColDef, GridCellParams, GridRenderCellParams } from '@mui/x-data-grid';
import { Checkbox, Select, MenuItem } from '@mui/material';
import { DataRecord } from '../../types/datatable';
import { CustomColumn } from '../../types/project';

interface DataTableProps {
  data: DataRecord[];
  columns: string[];
  customColumns: Record<string, CustomColumn>;
  onUpdateCell: (rowIndex: number, column: string, value: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  customColumns,
  onUpdateCell,
}) => {
  console.log('Data received:', data);
  console.log('Columns:', columns);

  const gridColumns: GridColDef[] = columns.map((column) => {
    const customCol = customColumns[column];
    
    return {
      field: column,
      headerName: column,
      flex: 1,
      minWidth: 150,
      resizable: true,
      editable: !customCol || customCol.type === 'text',
      type: 'string',
      renderCell: (params) => {
        if (!customCol) return params.value;

        switch (customCol.type) {
          case 'checkbox':
            return (
              <Checkbox
                checked={!!params.value}
                onChange={(e) => onUpdateCell(params.row.id, column, e.target.checked)}
              />
            );
          case 'select':
            return (
              <Select
                value={params.value || ''}
                onChange={(e) => onUpdateCell(params.row.id, column, e.target.value)}
                size="small"
                fullWidth
              >
                {customCol.options?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            );
          default:
            return params.value;
        }
      }
    };
  });

  const rowsWithIds = data.map((row, index) => ({
    id: index,
    ...row,
  }));

  console.log('Grid columns:', gridColumns);
  console.log('First row:', rowsWithIds[0]);

  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rowsWithIds}
        columns={gridColumns}
        density="compact"
        disableRowSelectionOnClick
        getRowHeight={() => 'auto'}
        editMode="cell"
        initialState={{
          columns: {
            columnVisibilityModel: Object.fromEntries(
              columns.map(column => [column, true])
            ),
          },
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            padding: '8px',
          },
        }}
      />
    </div>
  );
}; 