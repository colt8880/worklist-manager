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
  onColumnOrderChange?: (newOrder: string[]) => void;
  columnOrder?: string[];
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  customColumns,
  onUpdateCell,
  onColumnOrderChange,
  columnOrder,
}) => {
  // Use columnOrder if provided, otherwise use columns
  const orderedColumns = useMemo(() => 
    columnOrder || columns,
    [columnOrder, columns]
  );

  const gridColumns: GridColDef[] = useMemo(() => 
    orderedColumns.map((column): GridColDef => ({
      field: column,
      headerName: customColumns[column]?.label || column,
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
    [orderedColumns, customColumns]
  );

  return (
    <DataGrid
      rows={data.map((row, index) => ({ id: index, ...row }))}
      columns={gridColumns}
      autoHeight
      disableRowSelectionOnClick
      disableColumnMenu={false}
      processRowUpdate={(newRow, oldRow) => {
        const changedField = Object.keys(newRow).find(key => newRow[key] !== oldRow[key]);
        if (changedField) {
          onUpdateCell(newRow.id, changedField, newRow[changedField]);
        }
        return newRow;
      }}
      onColumnOrderChange={(params) => {
        const newOrder = params.targetIndex !== undefined ? 
          gridColumns.map(col => col.field) :
          columns;
        onColumnOrderChange?.(newOrder);
      }}
      sx={{
        '& .MuiDataGrid-cell': {
          borderRight: '1px solid rgba(224, 224, 224, 1)',
        },
        '& .MuiDataGrid-columnHeader': {
          borderRight: '1px solid rgba(224, 224, 224, 1)',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          cursor: 'move',
        },
      }}
    />
  );
}; 