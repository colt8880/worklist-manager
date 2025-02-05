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

  return (
    <Box sx={{ height: '600px', width: '100%', overflow: 'auto' }}>
      <div style={{ ...styles.container, width: `${totalWidth}px` }}>
        <div style={styles.header}>
          {columns.map((column) => (
            <div
              key={column}
              style={{
                ...styles.cell,
                width: `${columnWidths[column]}px`,
                fontWeight: 'bold',
              }}
            >
              {column}
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
                  columns={columns}
                  columnWidths={columnWidths}
                  totalWidth={totalWidth}
                />
              )}
            </List>
          )}
        </AutoSizer>
      </div>
    </Box>
  );
}; 