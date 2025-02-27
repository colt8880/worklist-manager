import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { ColumnType, CustomColumn } from '../../types/project';

interface AddColumnDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (column: CustomColumn) => void;
  existingColumns: string[];
}

export const AddColumnDialog: React.FC<AddColumnDialogProps> = ({
  open,
  onClose,
  onAdd,
  existingColumns,
}) => {
  const [column, setColumn] = useState<CustomColumn>({
    name: '',
    type: 'string',
    headerName: '',
    description: '',
    options: [],
    flex: 1,
    minWidth: 150,
    editable: true,
  });
  const [optionsText, setOptionsText] = useState('');

  const handleSave = () => {
    if (column.name.trim() && !existingColumns.includes(column.name)) {
      const finalColumn = {
        ...column,
        headerName: column.headerName || column.name,
        options: column.type === 'singleSelect' ? optionsText.split(',').map(opt => opt.trim()).filter(Boolean) : undefined,
        valueOptions: column.type === 'singleSelect' ? optionsText.split(',').map(opt => opt.trim()).filter(Boolean) : undefined,
      };
      onAdd(finalColumn);
      setColumn({
        name: '',
        type: 'string',
        headerName: '',
        description: '',
        options: [],
        flex: 1,
        minWidth: 150,
        editable: true,
      });
      setOptionsText('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Column</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Column Name"
            value={column.name}
            onChange={(e) => setColumn({ ...column, name: e.target.value })}
            error={existingColumns.includes(column.name)}
            helperText={existingColumns.includes(column.name) ? 'Column name already exists' : ''}
            required
          />
          <TextField
            label="Column Header"
            value={column.headerName || ''}
            onChange={(e) => setColumn({ ...column, headerName: e.target.value })}
            helperText="Display name for the column (optional)"
          />
          <FormControl fullWidth>
            <InputLabel>Column Type</InputLabel>
            <Select
              value={column.type}
              label="Column Type"
              onChange={(e) => setColumn({ ...column, type: e.target.value as ColumnType })}
            >
              <MenuItem value="string">Text</MenuItem>
              <MenuItem value="boolean">Checkbox</MenuItem>
              <MenuItem value="singleSelect">Select List</MenuItem>
            </Select>
          </FormControl>
          {column.type === 'singleSelect' && (
            <TextField
              label="Options"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              helperText="Enter options separated by commas"
              fullWidth
            />
          )}
          <TextField
            label="Description"
            value={column.description || ''}
            onChange={(e) => setColumn({ ...column, description: e.target.value })}
            helperText="Tooltip text shown on hover (optional)"
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!column.name.trim() || existingColumns.includes(column.name)}
        >
          Add Column
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 