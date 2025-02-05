import React from 'react';
import { Box } from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { styles, CONSTANTS } from './styles';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { DataRecord } from '../../types/datatable';
import { CustomColumn } from '../../types/project';

interface TableContentProps {
  data: DataRecord[];
  columns: string[];
  columnWidths: Record<string, number>;
  totalWidth: number;
  customColumns: Record<string, CustomColumn>;
  onUpdateCell: (rowIndex: number, column: string, value: any) => void;
  onResizeStart: (column: string, startX: number, startWidth: number) => void;
  resizing: { column: string; startX: number; startWidth: number; } | null;
}

export const TableContent: React.FC<TableContentProps> = ({
  data,
  columns,
  columnWidths,
  totalWidth,
  customColumns,
  onUpdateCell,
  onResizeStart,
  resizing,
}) => {
  const getPlaceholderColumns = (containerWidth: number) => {
    if (totalWidth >= containerWidth) return [];
    const numPlaceholders = Math.ceil((containerWidth - totalWidth) / CONSTANTS.PLACEHOLDER_COLUMN_WIDTH);
    return Array(numPlaceholders).fill('').map((_, i) => `__placeholder_${i}`);
  };

  return (
    <Box sx={{ height: '600px', width: '100%' }}>
      <AutoSizer>
        {({ width: containerWidth }: { width: number }) => {
          const placeholderColumns = getPlaceholderColumns(containerWidth);
          const allColumns = [...columns, ...placeholderColumns];
          const allColumnWidths = {
            ...columnWidths,
            ...Object.fromEntries(placeholderColumns.map(col => [col, CONSTANTS.PLACEHOLDER_COLUMN_WIDTH]))
          };
          const effectiveTotalWidth = Math.max(containerWidth, totalWidth);

          return (
            <div style={{ ...styles.container, width: `${effectiveTotalWidth}px` }}>
              <TableHeader
                columns={allColumns}
                columnWidths={allColumnWidths}
                customColumns={customColumns}
                placeholderColumns={placeholderColumns}
                onResizeStart={onResizeStart}
              />
              <AutoSizer disableHeight>
                {({ width }: { width: number }) => (
                  <List
                    height={550}
                    itemCount={data.length}
                    itemSize={CONSTANTS.ROW_HEIGHT}
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
  );
}; 