import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileUpload from '../common/FileUpload';
import { DataTable } from '../data-table/DataTable';
import { DataRecord } from '../../types/datatable';
import { AddColumnDialog } from './AddColumnDialog';
import { CustomColumn } from '../../types/project';
import { projectService } from '../../services/projectService';
import { Project } from '../../types/project';

interface ProjectContentProps {
  data: DataRecord[];
  columns: string[];
  onDataUpdate: (data: DataRecord[], columns: string[]) => void;
  onClearData: () => void;
  customColumns: Record<string, CustomColumn>;
  onAddCustomColumn: (column: CustomColumn) => void;
  onUpdateData: (rowId: string | number, column: string, value: any) => void;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  onBackToProjects: () => void;
  userId: string;
}

export const ProjectContent: React.FC<ProjectContentProps> = ({
  data,
  columns,
  onDataUpdate,
  onClearData,
  customColumns,
  onAddCustomColumn,
  onUpdateData,
  currentProject,
  setCurrentProject,
  onBackToProjects,
  userId,
}) => {
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isConfirmUploadOpen, setIsConfirmUploadOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFileUpload = async (uploadedData: DataRecord[]) => {
    try {
      if (uploadedData.length > 0) {
        const detectedColumns = Object.keys(uploadedData[0]);
        await onDataUpdate(uploadedData, detectedColumns);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDeleteColumn = async (columnName: string) => {
    if (currentProject) {
      try {
        // Remove column from customColumns if it exists
        const { [columnName]: deletedColumn, ...remainingCustomColumns } = currentProject.customColumns || {};
        
        // Remove column from columns array
        const updatedColumns = columns.filter(col => col !== columnName);
        
        // Remove column data from all records
        const updatedData = data.map(record => {
          const { [columnName]: deletedValue, ...remainingData } = record;
          return remainingData;
        });

        const updatedProject = {
          ...currentProject,
          customColumns: remainingCustomColumns,
          columns: updatedColumns,
          data: updatedData,
          updatedAt: new Date().toISOString()
        };

        // Save to database
        const savedProject = await projectService.saveProject(userId, updatedProject);
        
        // Update local state
        setCurrentProject(savedProject);
        onDataUpdate(updatedData, updatedColumns);
      } catch (error) {
        console.error('Failed to delete column:', error);
      }
    }
  };

  const handleUploadNewFile = () => {
    handleMenuClose();
    setIsConfirmUploadOpen(true);
  };

  const handleConfirmUpload = () => {
    setIsConfirmUploadOpen(false);
    onClearData();
  };

  return (
    <>
      {data.length === 0 ? (
        <FileUpload onFileUpload={handleFileUpload} />
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={onBackToProjects}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" component="h2">
                {currentProject?.name}
              </Typography>
            </Box>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => {
                handleMenuClose();
                setIsAddColumnDialogOpen(true);
              }}>
                Add Column
              </MenuItem>
              <MenuItem onClick={handleUploadNewFile}>
                Upload New File
              </MenuItem>
            </Menu>
          </Box>
          <DataTable
            data={data}
            columns={columns}
            customColumns={currentProject?.customColumns || {}}
            onUpdateCell={onUpdateData}
            onDeleteColumn={handleDeleteColumn}
          />
          <AddColumnDialog
            open={isAddColumnDialogOpen}
            onClose={() => setIsAddColumnDialogOpen(false)}
            onAdd={onAddCustomColumn}
            existingColumns={columns}
          />
          <Dialog
            open={isConfirmUploadOpen}
            onClose={() => setIsConfirmUploadOpen(false)}
          >
            <DialogTitle>Confirm New Upload</DialogTitle>
            <DialogContent>
              <Typography>
                Uploading a new file will delete all existing data in this project. Are you sure you want to continue?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsConfirmUploadOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmUpload} 
                color="error" 
                variant="contained"
              >
                Upload New File
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
}; 