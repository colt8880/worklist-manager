import React, { useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridRenderCellParams,
  GridColumnMenuProps,
  GridColumnMenu,
  GridRowModel,
  GridColumnVisibilityModel,
  GridColumnOrderChangeParams,
} from '@mui/x-data-grid';
import { Checkbox, Select, MenuItem, TextField, Box, Typography, Tooltip, Divider } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { CustomColumn } from '../../types/project';
import { DataTableProps } from '../../types/datatable';

interface CustomColumnMenuProps extends GridColumnMenuProps {
  onDeleteColumn?: (columnName: string) => void;
}

function CustomColumnMenu(props: CustomColumnMenuProps) {
  const { hideMenu, colDef, onDeleteColumn } = props;

  const handleDeleteColumn = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Delete column clicked:', colDef.field);
    if (window.confirm('Are you sure you want to delete this column? This action cannot be undone.')) {
      console.log('Confirmed deletion for column:', colDef.field);
      onDeleteColumn?.(colDef.field);
    }
    const syntheticEvent = { stopPropagation: () => {} } as React.SyntheticEvent;
    hideMenu(syntheticEvent);
  };

  return (
    <div>
      <GridColumnMenu {...props} />
      <Divider />
      <MenuItem 
        onClick={handleDeleteColumn}
        data-testid="delete-column-menu-item"
        sx={{
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          minHeight: '32px',
          color: 'error.main',
          '& .MuiSvgIcon-root': {
            fontSize: '1.25rem',
            color: 'error.main',
            marginRight: 2
          }
        }}
      >
        <DeleteOutlineIcon />
        Delete Column
      </MenuItem>
    </div>
  );
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  customColumns,
  onUpdateCell,
  onDeleteColumn,
}) => {
  // Add IDs to rows if they don't exist
  const rowsWithIds = useMemo(() => 
    data.map((row, index) => ({
      id: row.id ?? index,
      ...row
    })),
    [data]
  );

  const columnDefs: GridColDef[] = useMemo(() => 
    columns.map((column): GridColDef => ({
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
              <Box onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={Boolean(params.value)}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newValue = e.target.checked;
                    onUpdateCell(params.row.id, column, newValue);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ padding: '0px' }}
                />
              </Box>
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
    [columns, customColumns]
  );

  const handleProcessRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    const changedField = Object.keys(newRow).find(key => newRow[key] !== oldRow[key]);
    if (changedField) {
      onUpdateCell(newRow.id as number, changedField, newRow[changedField]);
    }
    return newRow;
  };

  const handleDeleteColumn = (columnName: string) => {
    console.log('DataTable handleDeleteColumn called with:', columnName);
    onDeleteColumn?.(columnName);
  };

  return (
    <DataGrid
      rows={rowsWithIds}
      columns={columnDefs}
      autoHeight
      disableRowSelectionOnClick
      disableColumnMenu={false}
      processRowUpdate={handleProcessRowUpdate}
      slots={{
        columnMenu: CustomColumnMenu,
      }}
      slotProps={{
        columnMenu: {
          onDeleteColumn: handleDeleteColumn,
        } as Partial<CustomColumnMenuProps>,
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