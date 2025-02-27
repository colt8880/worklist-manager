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
} from '@mui/x-data-grid';
import { MenuItem, Box, Divider, Checkbox } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { CustomColumn } from '../../types/project';
import { DataTableProps } from '../../types/datatable';

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

  // Add IDs to rows if they don't exist and ensure they're strings
  const rowsWithIds = useMemo(() => {
    console.log('Processing rows with IDs:', {
      originalData: data,
      dataLength: data.length,
      sampleIds: data.slice(0, 3).map((row, idx) => ({ 
        originalId: row.id, 
        index: idx,
        type: typeof row.id 
      }))
    });

    const processedRows = data.map((row, index) => {
      // Always use the array index as the ID to match DataGrid's expectations
      const processedRow = {
        ...row,
        id: String(index)
      };
      
      // Log a few rows for debugging
      if (index < 3) {
        console.log('Processed row:', {
          index,
          originalId: row.id,
          newId: processedRow.id,
          originalType: typeof row.id,
          newType: typeof processedRow.id,
          row: processedRow
        });
      }
      
      return processedRow;
    });

    console.log('First few processed rows:', processedRows.slice(0, 3));
    return processedRows;
  }, [data]);

  // Process row updates
  const handleProcessRowUpdate = async (newRow: any, oldRow: any) => {
    console.log('Processing row update:', {
      newRow,
      oldRow,
      newRowId: newRow.id,
      oldRowId: oldRow.id,
      newRowIdType: typeof newRow.id,
      oldRowIdType: typeof oldRow.id,
      allRowIds: rowsWithIds.slice(0, 5).map(r => ({ 
        id: r.id, 
        type: typeof r.id
      }))
    });

    try {
      // Find the changed field
      const changedField = Object.keys(newRow).find(
        field => newRow[field] !== oldRow[field]
      );

      if (!changedField) {
        console.log('No changes detected in row update');
        return oldRow;
      }

      const stringId = String(newRow.id);
      console.log('Detected change in field:', {
        field: changedField,
        oldValue: oldRow[changedField],
        newValue: newRow[changedField],
        rowId: stringId,
        rowIdType: typeof stringId,
        matchingRow: rowsWithIds.find(r => r.id === stringId)
      });

      // Call onUpdateCell with the changed field
      await onUpdateCell(stringId, changedField, newRow[changedField]);
      console.log('Cell update successful');
      return newRow;
    } catch (error) {
      console.error('Error processing row update:', error);
      return oldRow;
    }
  };

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
      
      const result = await handleProcessRowUpdate(newRow, oldRow);
      console.log('Checkbox update result:', {
        success: !!result,
        resultId: result?.id,
        resultIdType: typeof result?.id,
        result
      });
      
      return result;
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
                  }
                }
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