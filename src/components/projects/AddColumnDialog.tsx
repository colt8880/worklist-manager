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
    type: 'text',
    helperText: '',
    options: [],
  });
  const [optionsText, setOptionsText] = useState('');

  const handleSave = () => {
    if (column.name.trim() && !existingColumns.includes(column.name)) {
      const finalColumn = {
        ...column,
        options: optionsText.split(',').map(opt => opt.trim()).filter(Boolean)
      };
      onAdd(finalColumn);
      setColumn({ name: '', type: 'text', helperText: '', options: [] });
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
          <FormControl fullWidth>
            <InputLabel>Column Type</InputLabel>
            <Select
              value={column.type}
              label="Column Type"
              onChange={(e) => setColumn({ ...column, type: e.target.value as ColumnType })}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
              <MenuItem value="select">Select List</MenuItem>
            </Select>
          </FormControl>
          {column.type === 'select' && (
            <TextField
              label="Options"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              helperText="Enter options separated by commas"
              fullWidth
            />
          )}
          <TextField
            label="Helper Text"
            value={column.helperText}
            onChange={(e) => setColumn({ ...column, helperText: e.target.value })}
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