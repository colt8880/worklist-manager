import React, { useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridColumnMenuProps,
  GridColumnMenu,
  GridRowModel,
  useGridApiRef,
  GridPreProcessEditCellProps,
  GridCellEditStopParams,
} from '@mui/x-data-grid';
import { Checkbox, Select, MenuItem, Box, Tooltip, Divider } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { CustomColumn } from '../../types/project';
import { DataTableProps } from '../../types/datatable';

function CustomColumnMenu(props: GridColumnMenuProps) {
  const { hideMenu, colDef } = props;

  const handleDeleteColumn = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Delete column clicked:', colDef.field);
    if (window.confirm('Are you sure you want to delete this column? This action cannot be undone.')) {
      console.log('Confirmed deletion for column:', colDef.field);
      // Access onDeleteColumn through the window object
      const customEvent = new CustomEvent('deleteColumn', { detail: colDef.field });
      window.dispatchEvent(customEvent);
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
  const apiRef = useGridApiRef();

  // Add event listener for column deletion
  React.useEffect(() => {
    const handleDeleteColumn = (event: Event) => {
      const customEvent = event as CustomEvent;
      onDeleteColumn?.(customEvent.detail);
    };

    window.addEventListener('deleteColumn', handleDeleteColumn);
    return () => {
      window.removeEventListener('deleteColumn', handleDeleteColumn);
    };
  }, [onDeleteColumn]);

  // Add IDs to rows if they don't exist
  const rowsWithIds = useMemo(() => 
    data.map((row, index) => ({
      id: row.id ?? index,
      ...row
    })),
    [data]
  );

  const columnDefs: GridColDef[] = useMemo(() => 
    columns.map((column): GridColDef => {
      const customColumn = customColumns[column];
      let columnType: 'string' | 'number' | 'boolean' | 'date' | undefined;
      
      // Map custom column types to MUI types
      switch (customColumn?.type) {
        case 'checkbox':
          columnType = 'boolean';
          break;
        case 'select':
        case 'text':
        default:
          columnType = 'string';
          break;
      }

      const baseColumnDef: GridColDef = {
        field: column,
        headerName: customColumn?.label || column,
        flex: 1,
        minWidth: 150,
        editable: !customColumn || customColumn.type === 'text',
        type: columnType,
        disableColumnMenu: false,
        description: customColumn?.helperText,
        renderHeader: (params) => (
          <Tooltip 
            title={customColumn?.helperText || ''} 
            placement="top"
          >
            <div style={{ 
              width: '100%', 
              cursor: 'help',
              fontWeight: 700
            }}>
              {params.colDef.headerName}
            </div>
          </Tooltip>
        ),
        preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
          const hasError = !params.props.value && customColumn?.type === 'text';
          return { ...params.props, error: hasError };
        },
      };

      // Add checkbox specific styling and handling
      if (customColumn?.type === 'checkbox') {
        return {
          ...baseColumnDef,
          align: 'left',
          headerAlign: 'left',
          renderCell: (params: GridRenderCellParams) => (
            <Box 
              onClick={(e) => e.stopPropagation()}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%'
              }}
            >
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
          ),
        };
      }

      // Add select specific handling
      if (customColumn?.type === 'select') {
        return {
          ...baseColumnDef,
          type: 'singleSelect',
          valueOptions: customColumn.options || [],
          renderCell: (params: GridRenderCellParams) => (
            <Select
              value={params.value || ''}
              onChange={(e) => 
                onUpdateCell(params.row.id, column, e.target.value)
              }
              size="small"
              fullWidth
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200
                  }
                }
              }}
            >
              {customColumn.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          ),
        };
      }

      // Default column definition
      return baseColumnDef;
    }),
    [columns, customColumns]
  );

  const handleProcessRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    const changedField = Object.keys(newRow).find(key => newRow[key] !== oldRow[key]);
    if (changedField) {
      onUpdateCell(newRow.id as number, changedField, newRow[changedField]);
    }
    return newRow;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        apiRef={apiRef}
        rows={rowsWithIds}
        columns={columnDefs}
        autoHeight
        disableRowSelectionOnClick
        processRowUpdate={handleProcessRowUpdate}
        slots={{
          columnMenu: CustomColumnMenu,
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700
            }
          },
        }}
      />
    </Box>
  );
}; 