import React from 'react';
import { Checkbox, Select, MenuItem, TextField } from '@mui/material';
import { CustomColumn } from '../../types/project';

interface CellRendererProps {
  rowIndex: number;
  column: string;
  value: any;
  customColumn?: CustomColumn;
  onUpdateCell: (rowIndex: number, column: string, value: any) => void;
}

export const CellRenderer: React.FC<CellRendererProps> = ({
  rowIndex,
  column,
  value,
  customColumn,
  onUpdateCell,
}) => {
  if (!customColumn) return value;

  switch (customColumn.type) {
    case 'checkbox':
      return (
        <Checkbox
          checked={!!value}
          onChange={(e) => onUpdateCell(rowIndex, column, e.target.checked)}
        />
      );
    case 'select':
      return (
        <Select
          value={value || ''}
          onChange={(e) => onUpdateCell(rowIndex, column, e.target.value)}
          size="small"
          fullWidth
        >
          {customColumn.options?.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      );
    case 'text':
      return (
        <TextField
          value={value || ''}
          onChange={(e) => onUpdateCell(rowIndex, column, e.target.value)}
          size="small"
          fullWidth
          sx={{ '& .MuiInputBase-root': { height: '32px' }}}
        />
      );
    default:
      return value;
  }
}; 