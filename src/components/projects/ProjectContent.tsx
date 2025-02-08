import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
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
  onUpdateData: (rowIndex: number, column: string, value: any) => void;
  currentProject?: Project;
  setCurrentProject: (project: Project) => void;
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFileUpload = (uploadedData: DataRecord[]) => {
    if (uploadedData.length > 0) {
      const detectedColumns = Object.keys(uploadedData[0]);
      onDataUpdate(uploadedData, detectedColumns);
    }
  };

  const handleColumnOrderChange = async (newOrder: string[]) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        columnOrder: newOrder,
        updatedAt: new Date().toISOString()
      };

      try {
        await projectService.saveProject(userId, updatedProject);
        setCurrentProject(updatedProject);
      } catch (error) {
        console.error('Failed to save column order:', error);
      }
    }
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
              <MenuItem onClick={() => {
                handleMenuClose();
                onClearData();
              }}>
                Upload New File
              </MenuItem>
            </Menu>
          </Box>
          <DataTable
            data={data}
            columns={columns}
            customColumns={currentProject?.customColumns || {}}
            onUpdateCell={onUpdateData}
            onColumnOrderChange={handleColumnOrderChange}
            columnOrder={currentProject?.columnOrder}
          />
          <AddColumnDialog
            open={isAddColumnDialogOpen}
            onClose={() => setIsAddColumnDialogOpen(false)}
            onAdd={onAddCustomColumn}
            existingColumns={columns}
          />
        </>
      )}
    </>
  );
}; 