import React, { useMemo, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
  onAddColumn,
  onUpdateCell,
}) => {
  const { customWidths, handleResizeStart, resizing } = useColumnResize();
  const { columnWidths, totalWidth } = useColumnWidths(data, columns, customWidths);

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Add Column">
          <IconButton onClick={onAddColumn}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
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