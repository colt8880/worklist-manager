import React, { useMemo, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { DataTableProps } from '../../types/datatable';
import { styles, CONSTANTS } from './styles';
import { useColumnResize } from '../../hooks/useColumnResize';
import { useColumnWidths } from '../../hooks/useColumnWidths';
import { TableHeader } from './TableHeader';
import { TableContent } from './TableContent';

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  customColumns,
  onUpdateCell,
}) => {
  const { customWidths, handleResizeStart, resizing } = useColumnResize();
  const { columnWidths, totalWidth } = useColumnWidths(data, columns, customWidths);

  return (
    <Box>
      <TableContent
        data={data}
        columns={columns}
        columnWidths={columnWidths}
        totalWidth={totalWidth}
        customColumns={customColumns}
        onUpdateCell={onUpdateCell}
        onResizeStart={handleResizeStart}
        resizing={resizing}
      />
    </Box>
  );
}; 