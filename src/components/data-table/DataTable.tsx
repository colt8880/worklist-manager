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
import _ from 'lodash';

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

  // Handle cell edit stop events
  const handleCellEditStop: GridEventListener<'cellEditStop'> = (params, event) => {
    const { id, field, reason } = params;
    
    // Only process if edit was committed
    if (reason === GridCellEditStopReasons.cellFocusOut || 
        reason === GridCellEditStopReasons.enterKeyDown) {
      console.log('[DataTable] Cell edit stopped:', { id, field, reason });
      
      // Get the new value from the editor
      const newValue = apiRef.current.getCellValue(id, field);
      console.log('[DataTable] New cell value:', { id, field, newValue });
      
      // If the edit was committed, ensure the value is saved
      // This is a backup for cases where processRowUpdate might not be triggered
      if (newValue !== undefined) {
        onUpdateCell(id, field, newValue).catch(error => {
          console.error('[DataTable] Error updating cell from edit stop event:', error);
        });
      }
    }
  };

  // Handle row updates
  const processRowUpdate = React.useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel) => {
      try {
        // Skip update if no changes
        if (_.isEqual(newRow, oldRow)) {
          return oldRow;
        }

        // Find the changed column by comparing newRow and oldRow
        const changedColumn = Object.keys(newRow).find(key => 
          key !== 'id' && !_.isEqual(newRow[key], oldRow[key])
        );

        if (!changedColumn) {
          console.warn('[DataTable] No changed column found between:', { newRow, oldRow });
          return oldRow;
        }

        console.log('[DataTable] Updating cell:', {
          rowId: newRow.id,
          column: changedColumn,
          oldValue: oldRow[changedColumn],
          newValue: newRow[changedColumn]
        });

        const result = await onUpdateCell(newRow.id, changedColumn, newRow[changedColumn]);
        if (!result) {
          console.warn('[DataTable] Update cell returned no result');
          return oldRow;
        }

        const finalResult = {
          ...result,
          isNew: false
        };

        return finalResult;
      } catch (error) {
        console.error('[DataTable] Error processing row update:', {
          error,
          rowId: newRow.id
        });
        return oldRow;
      }
    },
    [onUpdateCell]
  );

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
  const handleCheckboxChange = React.useCallback(
    async (params: GridCellParams) => {
      try {
        const { id, field, value } = params;
        const newValue = !value;
        
        const result = await onUpdateCell(id, field, newValue);
        if (!result) {
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('[DataTable] Error handling checkbox change:', {
          error,
          params
        });
        return false;
      }
    },
    [onUpdateCell]
  );

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
            renderCell: (params: GridRenderCellParams) => {
              // Log the cell value for debugging
              console.log(`[DataTable] Rendering singleSelect cell:`, {
                id: params.id,
                field: params.field,
                value: params.value,
                valueType: typeof params.value
              });
              
              return (
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
              );
            }
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
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(error) => {
          console.error('[DataGrid] Error in row update:', error);
        }}
        slots={{
          columnMenu: CustomColumnMenu,
        }}
        editMode="cell"
        onCellEditStop={handleCellEditStop}
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