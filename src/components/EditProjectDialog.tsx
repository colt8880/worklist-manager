import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

interface EditProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName: string;
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  open,
  onClose,
  onSave,
  initialName,
}) => {
  const [name, setName] = useState(initialName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Project Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={name}
            placeholder={initialName}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!name.trim()}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 