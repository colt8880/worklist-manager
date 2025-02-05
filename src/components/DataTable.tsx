import React, { useMemo, useState } from 'react';
import { Box, Checkbox, Select, MenuItem, TextField, IconButton, Tooltip } from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DataRecord } from '../types';
import AddIcon from '@mui/icons-material/Add';
import { CustomColumn } from '../types/project';

const ROW_HEIGHT = 52;
const MIN_COLUMN_WIDTH = 100;
const MAX_COLUMN_WIDTH = 400;
const PADDING = 32;
const CHAR_WIDTH = 8;
const HEADER_CHAR_WIDTH = 10;
const PLACEHOLDER_COLUMN_WIDTH = 200; // Width for each placeholder column

interface Styles {
  row: React.CSSProperties;
  cell: React.CSSProperties;
  header: React.CSSProperties;
  container: React.CSSProperties;
  resizeHandle: React.CSSProperties;
  headerCell: React.CSSProperties;
}

const baseStyles: Omit<Styles, 'headerCell'> = {
  row: {
    display: 'flex',
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
  },
  cell: {
    padding: '16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    borderBottom: '2px solid rgba(224, 224, 224, 1)',
    backgroundColor: '#fafafa',
    width: '100%',
  },
  container: {
    overflow: 'hidden',
  },
  resizeHandle: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    cursor: 'col-resize',
    userSelect: 'none' as const,
    backgroundColor: 'transparent',
  },
};

const styles: Styles = {
  ...baseStyles,
  headerCell: {
    ...baseStyles.cell,
    position: 'relative' as const,
    fontWeight: 'bold',
  },
};

interface DataTableProps {
  data: DataRecord[];
  columns: string[];
  customColumns: Record<string, CustomColumn>;
  onAddColumn: () => void;
  onUpdateCell: (rowIndex: number, column: string, value: any) => void;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: DataRecord[];
  columns: string[];
  columnWidths: Record<string, number>;
  totalWidth: number;
  customColumns: Record<string, CustomColumn>;
  onUpdateCell: (rowIndex: number, column: string, value: any) => void;
}

const renderCell = (rowIndex: number, column: string, value: any, customCol: CustomColumn, onUpdateCell: (rowIndex: number, column: string, value: any) => void) => {
  switch (customCol.type) {
    case 'checkbox':
      return (
        <Checkbox
          checked={!!value}
          onChange={(e) => onUpdateCell(rowIndex, column, e.target.checked)}
        />
      );
    case 'select':
      return (
        <Select
          value={value || ''}
          onChange={(e) => onUpdateCell(rowIndex, column, e.target.value)}
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
    case 'text':
      return (
        <TextField
          value={value || ''}
          onChange={(e) => onUpdateCell(rowIndex, column, e.target.value)}
          size="small"
          fullWidth
          sx={{ 
            '& .MuiInputBase-root': { 
              height: '32px' 
            }
          }}
        />
      );
    default:
      return value;
  }
};

const TableRow: React.FC<RowProps> = ({ index, style, data, columns, columnWidths, totalWidth, customColumns, onUpdateCell }) => (
  <div style={{
    ...style,
    ...styles.row,
    backgroundColor: index % 2 ? '#fafafa' : '#ffffff',
    width: `${totalWidth}px`,
  }}>
    {columns.map((column) => (
      <div
        key={column}
        style={{
          ...styles.cell,
          width: `${columnWidths[column]}px`,
        }}
      >
        {customColumns[column] 
          ? renderCell(index, column, data[index][column], customColumns[column], onUpdateCell)
          : data[index][column]}
      </div>
    ))}
  </div>
);

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  customColumns,
  onAddColumn,
  onUpdateCell,
}) => {
  const [resizing, setResizing] = useState<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [customWidths, setCustomWidths] = useState<Record<string, number>>({});

  const handleResizeStart = (column: string, startX: number, startWidth: number) => {
    setResizing({ column, startX, startWidth });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing) return;

    const diff = e.clientX - resizing.startX;
    const newWidth = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, resizing.startWidth + diff));
    
    setCustomWidths(prev => ({
      ...prev,
      [resizing.column]: newWidth,
    }));
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  React.useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing]);

  const calculateColumnWidths = () => {
    const widths: Record<string, number> = {};
    
    columns.forEach(column => {
      if (customWidths[column]) {
        widths[column] = customWidths[column];
        return;
      }

      let maxWidth = column.length * HEADER_CHAR_WIDTH;
      
      data.forEach(row => {
        const cellContent = String(row[column]);
        const contentLength = cellContent.length * CHAR_WIDTH;
        maxWidth = Math.max(maxWidth, contentLength);
      });

      maxWidth = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, maxWidth + PADDING));
      widths[column] = maxWidth;
    });

    return widths;
  };

  const columnWidths = useMemo(() => {
    const widths = calculateColumnWidths();
    return {
      ...widths,
      ...customWidths  // Override with custom widths
    };
  }, [data, columns, customWidths]); // Add customWidths to dependencies

  const totalWidth = useMemo(() => 
    columns.reduce((sum, column) => sum + columnWidths[column], 0),
    [columns, columnWidths]
  );

  const getPlaceholderColumns = (containerWidth: number) => {
    if (totalWidth >= containerWidth) return [];
    const numPlaceholders = Math.ceil((containerWidth - totalWidth) / PLACEHOLDER_COLUMN_WIDTH);
    return Array(numPlaceholders).fill('').map((_, i) => `__placeholder_${i}`);
  };

  const getColumnData = (containerWidth: number) => {
    const placeholderColumns = getPlaceholderColumns(containerWidth);
    const allColumns = [...columns, ...placeholderColumns];
    const allColumnWidths = {
      ...columnWidths,
      ...Object.fromEntries(placeholderColumns.map(col => [col, PLACEHOLDER_COLUMN_WIDTH]))
    };
    const effectiveTotalWidth = Math.max(containerWidth, totalWidth);

    return { allColumns, allColumnWidths, effectiveTotalWidth, placeholderColumns };
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Add Column">
          <IconButton onClick={onAddColumn}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ height: '600px', width: '100%'}}>
        <AutoSizer>
          {({ width: containerWidth }: { width: number }) => {
            const { allColumns, allColumnWidths, effectiveTotalWidth, placeholderColumns } = 
              getColumnData(containerWidth);

            return (
              <div style={{ ...styles.container, width: `${effectiveTotalWidth}px` }}>
                <div style={styles.header}>
                  {allColumns.map((column) => (
                    <Tooltip 
                      key={column}
                      title={customColumns[column]?.helperText || ''}
                      placement="top"
                      arrow
                    >
                      <div
                        style={{
                          ...styles.headerCell,
                          width: `${allColumnWidths[column]}px`,
                        }}
                      >
                        {placeholderColumns.includes(column) ? '' : column}
                        {!placeholderColumns.includes(column) && (
                          <Box
                            component="div"
                            sx={{
                              ...styles.resizeHandle,
                              '&:hover': {
                                backgroundColor: '#1976d2',
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleResizeStart(column, e.clientX, allColumnWidths[column]);
                            }}
                          />
                        )}
                      </div>
                    </Tooltip>
                  ))}
                </div>

                <AutoSizer disableHeight>
                  {({ width }: { width: number }) => (
                    <List
                      height={550}
                      itemCount={data.length}
                      itemSize={ROW_HEIGHT}
                      width={width}
                    >
                      {(props) => (
                        <TableRow
                          {...props}
                          data={data}
                          columns={allColumns}
                          columnWidths={allColumnWidths}
                          totalWidth={effectiveTotalWidth}
                          customColumns={customColumns}
                          onUpdateCell={onUpdateCell}
                        />
                      )}
                    </List>
                  )}
                </AutoSizer>
              </div>
            );
          }}
        </AutoSizer>
      </Box>
    </Box>
  );
}; 