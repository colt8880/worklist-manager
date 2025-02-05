// src/components/VirtualizedTable.tsx
import React, { useMemo, useRef } from 'react';
import {
  Box,
  Tooltip
} from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface DynamicData {
  [key: string]: any;
}

interface CellProps {
  content: string;
  width: number;
  isHeader?: boolean;
}

const Cell: React.FC<CellProps> = ({ content, width, isHeader }) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const [isOverflowed, setIsOverflowed] = React.useState(false);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (cellRef.current) {
        const lineHeight = parseInt(getComputedStyle(cellRef.current).lineHeight);
        const maxHeight = lineHeight * 2; // Two lines of text
        setIsOverflowed(cellRef.current.scrollHeight > maxHeight);
      }
    };
    checkOverflow();
  }, [content]);

  const cellContent = (
    <div
      ref={cellRef}
      style={{
        width: `${width}px`,
        padding: '16px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        lineHeight: '1.2em',
        maxHeight: '2.4em', // 2 lines * 1.2em line-height
        fontWeight: isHeader ? 'bold' : 'normal',
        whiteSpace: 'normal', // Allow text to wrap
      }}
    >
      {content}
    </div>
  );

  return isOverflowed ? (
    <Tooltip title={content} placement="top">
      {cellContent}
    </Tooltip>
  ) : cellContent;
};

const ROW_HEIGHT = 80; // Increased height to accommodate two lines

const VirtualizedTable: React.FC<{
  data: DynamicData[];
  columns: string[];
}> = ({ data, columns }) => {
  const calculateColumnWidths = () => {
    const widths: { [key: string]: number } = {};
    
    columns.forEach(column => {
      // Start with the header length
      let maxWidth = column.length * 10;
      
      // Check content length in each row
      data.forEach(row => {
        const cellContent = String(row[column]);
        const contentLength = cellContent.length * 8;
        maxWidth = Math.max(maxWidth, contentLength);
      });

      // Set minimum and maximum widths
      maxWidth = Math.max(100, Math.min(400, maxWidth + 32));
      widths[column] = maxWidth;
    });

    return widths;
  };

  const columnWidths = useMemo(calculateColumnWidths, [data, columns]);
  const totalWidth = columns.reduce((sum, column) => sum + columnWidths[column], 0);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={{
      ...style,
      display: 'flex',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
      backgroundColor: index % 2 ? '#fafafa' : '#ffffff',
      width: `${totalWidth}px`,
    }}>
      {columns.map((column) => (
        <Cell
          key={column}
          content={String(data[index][column])}
          width={columnWidths[column]}
        />
      ))}
    </div>
  );

  return (
    <Box sx={{ height: '600px', width: '100%', overflow: 'auto' }}>
      <div style={{ width: `${totalWidth}px`, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid rgba(224, 224, 224, 1)',
          backgroundColor: '#fafafa',
          width: '100%',
        }}>
          {columns.map((column) => (
            <Cell
              key={column}
              content={column}
              width={columnWidths[column]}
              isHeader
            />
          ))}
        </div>

        {/* Scrollable Content */}
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

export default VirtualizedTable;