import React from 'react';
import { Box, Button } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { DataTable } from './DataTable';
import FileUpload from './FileUpload';
import { DataRecord } from '../types';

interface ProjectContentProps {
  data: DataRecord[];
  columns: string[];
  onDataUpdate: (data: DataRecord[], columns: string[]) => void;
  onClearData: () => void;
}

export const ProjectContent: React.FC<ProjectContentProps> = ({
  data,
  columns,
  onDataUpdate,
  onClearData,
}) => {
  const handleFilterClick = () => {
    console.log('Filter button clicked');
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
            <Button
              variant="contained"
              startIcon={<FilterAltIcon />}
              onClick={handleFilterClick}
            >
              Filter Data
            </Button>
            <Button variant="outlined" onClick={onClearData}>
              Upload New File
            </Button>
          </Box>
          <DataTable data={data} columns={columns} />
        </>
      )}
    </>
  );
}; 