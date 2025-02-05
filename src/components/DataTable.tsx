import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DataRecord } from '../types';

const ROW_HEIGHT = 52;
const MIN_COLUMN_WIDTH = 100;
const MAX_COLUMN_WIDTH = 400;
const PADDING = 32;
const CHAR_WIDTH = 8;
const HEADER_CHAR_WIDTH = 10;
const PLACEHOLDER_COLUMN_WIDTH = 200; // Width for each placeholder column

const styles = {
  row: {
    display: 'flex',
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
  },
  cell: {
    padding: '16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  header: {
    display: 'flex',
    borderBottom: '2px solid rgba(224, 224, 224, 1)',
    backgroundColor: '#fafafa',
    width: '100%',
  },
  container: {
    overflow: 'hidden',
  }
} as const;

interface DataTableProps {
  data: DataRecord[];
  columns: string[];
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: DataRecord[];
  columns: string[];
  columnWidths: Record<string, number>;
  totalWidth: number;
}

const TableRow: React.FC<RowProps> = ({ index, style, data, columns, columnWidths, totalWidth }) => (
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
        {data[index][column]}
      </div>
    ))}
  </div>
);

export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const calculateColumnWidths = () => {
    const widths: Record<string, number> = {};
    
    columns.forEach(column => {
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

  const columnWidths = useMemo(calculateColumnWidths, [data, columns]);
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
    <Box sx={{ height: '600px', width: '100%'}}>
      <AutoSizer>
        {({ width: containerWidth }: { width: number }) => {
          const { allColumns, allColumnWidths, effectiveTotalWidth, placeholderColumns } = 
            getColumnData(containerWidth);

          return (
            <div style={{ ...styles.container, width: `${effectiveTotalWidth}px` }}>
              <div style={styles.header}>
                {allColumns.map((column) => (
                  <div
                    key={column}
                    style={{
                      ...styles.cell,
                      width: `${allColumnWidths[column]}px`,
                      fontWeight: 'bold',
                    }}
                  >
                    {placeholderColumns.includes(column) ? '' : column}
                  </div>
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