import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { styles } from './styles';
import { CustomColumn } from '../../types/project';

interface TableHeaderProps {
  columns: string[];
  columnWidths: Record<string, number>;
  customColumns: Record<string, CustomColumn>;
  placeholderColumns: string[];
  onResizeStart: (column: string, startX: number, startWidth: number) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  columnWidths,
  customColumns,
  placeholderColumns,
  onResizeStart,
}) => (
  <div style={styles.header}>
    {columns.map((column) => (
      <Tooltip 
        key={column}
        title={customColumns[column]?.helperText || ''}
        placement="top"
        arrow
      >
        <div
          style={{
            ...styles.headerCell,
            width: `${columnWidths[column]}px`,
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
                onResizeStart(column, e.clientX, columnWidths[column]);
              }}
            />
          )}
        </div>
      </Tooltip>
    ))}
  </div>
); 