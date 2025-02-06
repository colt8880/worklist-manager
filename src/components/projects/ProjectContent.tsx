import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileUpload from '../common/FileUpload';
import { DataTable } from '../data-table/DataTable';
import { DataRecord } from '../../types/datatable';
import { AddColumnDialog } from './AddColumnDialog';
import { CustomColumn } from '../../types/project';

interface ProjectContentProps {
  data: DataRecord[];
  columns: string[];
  onDataUpdate: (data: DataRecord[], columns: string[]) => void;
  onClearData: () => void;
  customColumns: Record<string, CustomColumn>;
  onAddCustomColumn: (column: CustomColumn) => void;
  onUpdateData: (data: DataRecord[]) => void;
  currentProject?: { name: string };
  onBackToProjects: () => void;
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
  onBackToProjects,
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
            customColumns={customColumns}
            onUpdateCell={(rowIndex, column, value) => {
              const newData = [...data];
              newData[rowIndex] = { ...newData[rowIndex], [column]: value };
              onUpdateData(newData);
            }}
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