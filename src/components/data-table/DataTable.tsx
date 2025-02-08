import React, { useMemo } from 'react';
import { DataGrid, GridColDef, GridCellParams, GridRenderCellParams } from '@mui/x-data-grid';
import { Checkbox, Select, MenuItem, TextField, Box, Typography, Tooltip } from '@mui/material';
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
  const gridColumns: GridColDef[] = useMemo(() => 
    columns.map((column): GridColDef => ({
      field: column,
      headerName: column,
      flex: 1,
      minWidth: 150,
      editable: !customColumns[column] || customColumns[column].type === 'text',
      renderHeader: () => {
        const customColumn = customColumns[column];
        return (
          <Tooltip 
            title={customColumn?.helperText || ''} 
            placement="top"
          >
            <div style={{ width: '100%', cursor: 'help' }}>
              {customColumn?.label || column}
            </div>
          </Tooltip>
        );
      },
      renderCell: (params: GridRenderCellParams) => {
        const customColumn = customColumns[column];
        if (!customColumn) return params.value;

        switch (customColumn.type) {
          case 'checkbox':
            return (
              <Checkbox
                checked={Boolean(params.value)}
                onChange={(e) => 
                  onUpdateCell(params.row.id, column, e.target.checked)
                }
              />
            );
          case 'select':
            return (
              <Select
                value={params.value || ''}
                onChange={(e) => 
                  onUpdateCell(params.row.id, column, e.target.value)
                }
                size="small"
                fullWidth
              >
                {customColumn.options?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            );
          default:
            return params.value;
        }
      },
    })),
    [columns, customColumns, onUpdateCell]
  );

  const rows = useMemo(() => 
    data.map((row, index) => ({
      id: index,
      ...row,
    })),
    [data]
  );

  return (
    <DataGrid
      rows={rows}
      columns={gridColumns}
      autoHeight
      disableRowSelectionOnClick
      processRowUpdate={(newRow, oldRow) => {
        console.log('Row update:', newRow);
        const changedField = Object.keys(newRow).find(key => newRow[key] !== oldRow[key]);
        if (changedField) {
          onUpdateCell(newRow.id, changedField, newRow[changedField]);
        }
        return newRow;
      }}
      sx={{
        '& .MuiDataGrid-cell': {
          borderRight: '1px solid rgba(224, 224, 224, 1)',
        },
        '& .MuiDataGrid-columnHeader': {
          borderRight: '1px solid rgba(224, 224, 224, 1)',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
        },
      }}
    />
  );
}; 