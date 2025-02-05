import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DataRecord } from '../types';

const ROW_HEIGHT = 52;

interface DataTableProps {
  data: DataRecord[];
  columns: string[];
}

// Add this type for AutoSizer
interface AutoSizerProps {
  width: number;
  height?: number;
}

export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const calculateColumnWidths = () => {
    const widths: Record<string, number> = {};
    
    columns.forEach(column => {
      let maxWidth = column.length * 10;
      
      data.forEach(row => {
        const cellContent = String(row[column]);
        const contentLength = cellContent.length * 8;
        maxWidth = Math.max(maxWidth, contentLength);
      });

      maxWidth = Math.max(100, Math.min(400, maxWidth + 32));
      widths[column] = maxWidth;
    });

    return widths;
  };

  const columnWidths = useMemo(calculateColumnWidths, [data, columns]);
  const totalWidth = useMemo(() => 
    columns.reduce((sum, column) => sum + columnWidths[column], 0),
    [columns, columnWidths]
  );

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={{
      ...style,
      display: 'flex',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
      backgroundColor: index % 2 ? '#fafafa' : '#ffffff',
      width: `${totalWidth}px`,
    }}>
      {columns.map((column) => (
        <div
          key={column}
          style={{
            width: `${columnWidths[column]}px`,
            padding: '16px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {data[index][column]}
        </div>
      ))}
    </div>
  );

  return (
    <Box sx={{ height: '600px', width: '100%', overflow: 'auto' }}>
      <div style={{ width: `${totalWidth}px`, overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          borderBottom: '2px solid rgba(224, 224, 224, 1)',
          backgroundColor: '#fafafa',
          width: '100%',
        }}>
          {columns.map((column) => (
            <div
              key={column}
              style={{
                width: `${columnWidths[column]}px`,
                padding: '16px',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </Box>
  );
}; 