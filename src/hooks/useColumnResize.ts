import { useState, useEffect } from 'react';
import { CONSTANTS } from '../components/DataTable/styles';

export const useColumnResize = () => {
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
    const newWidth = Math.max(
      CONSTANTS.MIN_COLUMN_WIDTH,
      Math.min(CONSTANTS.MAX_COLUMN_WIDTH, resizing.startWidth + diff)
    );
    setCustomWidths(prev => ({ ...prev, [resizing.column]: newWidth }));
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing]);

  return { customWidths, handleResizeStart, resizing };
}; 