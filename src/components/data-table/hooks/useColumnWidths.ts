import { useMemo } from 'react';
import { CONSTANTS } from '../styles';
import { DataRecord } from '../../../types/datatable';

export const useColumnWidths = (
  data: DataRecord[],
  columns: string[],
  customWidths: Record<string, number>
) => {
  const columnWidths = useMemo(() => {
    const widths: Record<string, number> = {};
    
    columns.forEach(column => {
      if (customWidths[column]) {
        widths[column] = customWidths[column];
        return;
      }

      let maxWidth = column.length * CONSTANTS.HEADER_CHAR_WIDTH;
      data.forEach(row => {
        const cellContent = String(row[column] || '');
        const contentLength = cellContent.length * CONSTANTS.CHAR_WIDTH;
        maxWidth = Math.max(maxWidth, contentLength);
      });

      maxWidth = Math.max(
        CONSTANTS.MIN_COLUMN_WIDTH,
        Math.min(CONSTANTS.MAX_COLUMN_WIDTH, maxWidth + CONSTANTS.PADDING)
      );
      widths[column] = maxWidth;
    });

    return widths;
  }, [data, columns, customWidths]);

  const totalWidth = useMemo(() => 
    columns.reduce((sum, column) => sum + columnWidths[column], 0),
    [columns, columnWidths]
  );

  return { columnWidths, totalWidth };
}; 