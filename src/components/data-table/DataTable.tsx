import React, { useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridColumnMenuProps,
  GridColumnMenu,
  GridRowModel,
  useGridApiRef,
  GridCellEditStopParams,
  GridRenderCellParams,
  GridEventListener,
  GridCellEditStopReasons,
  GridCellParams,
  GridValueFormatter,
} from '@mui/x-data-grid';
import { MenuItem, Box, Divider, Checkbox } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { CustomColumn } from '../../types/project';

interface DataTableProps {
  data: any[];
  columns: string[];
  customColumns: Record<string, any>;
  onUpdateCell: (rowId: string | number, field: string, value: any) => Promise<any>;
  onDeleteColumn?: (columnName: string) => void;
}

function CustomColumnMenu(props: GridColumnMenuProps) {
  const { hideMenu, colDef } = props;

  const handleDeleteColumn = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this column? This action cannot be undone.')) {
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

  // Add IDs to rows if they don't exist and ensure they're strings
  const rowsWithIds = useMemo(() => {
    // Log initial data state
    console.log('Processing rows with IDs:', {
      dataLength: data.length,
      hasIds: data.every(row => row.id !== undefined),
      firstFewRows: data.slice(0, 3)
    });

    // If all rows already have IDs, just ensure they're strings
    if (data.every(row => row.id !== undefined)) {
      return data.map(row => ({
        ...row,
        id: String(row.id)
      }));
    }

    // If some rows are missing IDs, assign new ones
    console.warn('Some rows are missing IDs, assigning new ones');
    return data.map((row, index) => ({
      ...row,
      id: row.id !== undefined ? String(row.id) : String(index)
    }));
  }, [data]);

  // Handle row updates
  const handleProcessRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
    try {
      // Find the changed field
      const changedField = Object.keys(newRow).find(
        field => field !== 'id' && newRow[field] !== oldRow[field]
      );

      if (!changedField) {
        console.log('No changes detected in row update');
        return oldRow;
      }

      console.log('Processing row update:', {
        rowId: newRow.id,
        field: changedField,
        oldValue: oldRow[changedField],
        newValue: newRow[changedField]
      });

      // Call onUpdateCell with the changed field and wait for the result
      const result = await onUpdateCell(newRow.id, changedField, newRow[changedField]);
      
      if (!result) {
        console.log('Update failed, returning old row');
        return oldRow;
      }

      // Ensure the returned result has an ID
      const finalResult = {
        ...result,
        id: result.id || newRow.id
      };

      console.log('Update successful, returning row:', finalResult);
      return finalResult;
    } catch (error) {
      console.error('Error processing row update:', error);
      return oldRow;
    }
  };

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

  // Handle checkbox changes
  const handleCheckboxChange = async (params: GridCellParams) => {
    const stringId = String(params.id);
    console.log('Handling checkbox change:', {
      ...params,
      rowId: stringId,
      originalRowId: params.id,
      rowIdType: typeof stringId,
      originalRowIdType: typeof params.id,
      row: params.row,
      matchingRow: rowsWithIds.find(r => String(r.id) === stringId)
    });
    
    try {
      const newValue = !params.value;
      console.log('New checkbox value:', newValue);
      
      // Update through the standard row update process
      const oldRow = params.row;
      const newRow = { ...oldRow, [params.field]: newValue };
      
      const result = await onUpdateCell(stringId, params.field, newValue);
      console.log('Checkbox update result:', result);
      
      return result || oldRow;
    } catch (error) {
      console.error('Error handling checkbox change:', error);
      return params.row;
    }
  };

  // Column definitions with checkbox handling
  const columnDefs = useMemo<GridColDef[]>(() => {
    return columns.map(colName => {
      const customColumn = customColumns[colName];
      
      // Base column definition
      const baseColDef: GridColDef = {
        field: colName,
        headerName: customColumn?.headerName || colName,
        flex: 1,
        minWidth: 150,
        editable: true,
        description: customColumn?.description || ''
      };

      // If it's a custom column, add the specific configuration
      if (customColumn) {
        if (customColumn.type === 'boolean') {
          return {
            ...baseColDef,
            type: 'boolean' as const,
            renderCell: (params: GridRenderCellParams) => (
              <Checkbox
                checked={Boolean(params.value)}
                onChange={() => handleCheckboxChange(params)}
              />
            )
          } satisfies GridColDef;
        }

        if (customColumn.type === 'singleSelect') {
          return {
            ...baseColDef,
            type: 'singleSelect' as const,
            valueOptions: customColumn.options || [],
            // Ensure undefined values are converted to empty string and handle null params
            valueFormatter: (params: { value: any }) => {
              if (!params) return '';
              return params.value === undefined || params.value === null ? '' : String(params.value);
            },
            renderCell: (params: GridRenderCellParams) => (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: 0
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  apiRef.current.startCellEditMode({ id: params.id, field: params.field });
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, paddingLeft: '8px' }}>
                  {params.value || ''}
                </span>
                <ArrowDropDownIcon 
                  sx={{ 
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginLeft: 1,
                    marginRight: 1,
                    fontSize: 20,
                    flexShrink: 0
                  }} 
                />
              </Box>
            )
          } satisfies GridColDef;
        }
      }

      return baseColDef;
    });
  }, [columns, customColumns, handleCheckboxChange]);

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <DataGrid
        apiRef={apiRef}
        rows={rowsWithIds}
        columns={columnDefs}
        autoHeight
        disableRowSelectionOnClick
        processRowUpdate={handleProcessRowUpdate}
        onProcessRowUpdateError={(error) => {
          console.error('Error in row update:', error);
        }}
        slots={{
          columnMenu: CustomColumnMenu,
        }}
        editMode="cell"
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