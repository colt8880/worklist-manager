import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  LinearProgress,
  Alert,
  Paper 
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import Papa from 'papaparse';
import { DataRecord } from '../../types/datatable';

interface FileUploadProps {
  onFileUpload: (data: DataRecord[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('No file selected');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV file: ${results.errors[0].message}`);
          setUploading(false);
          return;
        }

        if (!results.data || results.data.length === 0 || !Array.isArray(results.data)) {
          setError('No data found in file');
          setUploading(false);
          return;
        }

        // Ensure the first row is an object with properties
        const firstRow = results.data[0];
        if (typeof firstRow !== 'object' || firstRow === null) {
          setError('Invalid CSV format: First row is not a valid object');
          setUploading(false);
          return;
        }

        // Now we can safely get the headers
        const headers = Object.keys(firstRow);
        const invalidRows = results.data.some(row => 
          typeof row === 'object' && row !== null && 
          !headers.every(header => Object.prototype.hasOwnProperty.call(row, header))
        );

        if (invalidRows) {
          setError('Invalid CSV format: Some rows are missing columns');
          setUploading(false);
          return;
        }

        try {
          onFileUpload(results.data as DataRecord[]);
          setUploading(false);
          setProgress(100);
        } catch (err) {
          setError('Failed to process file data');
          setUploading(false);
        }
      },
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
        setUploading(false);
      }
    });
  }, [onFileUpload]);

  return (
    <Paper 
      sx={{ 
        p: 4, 
        textAlign: 'center',
        border: '2px dashed rgba(132, 172, 206, 0.3)',
        backgroundColor: 'rgba(132, 172, 206, 0.05)',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#1AA962',
          backgroundColor: 'rgba(26, 169, 98, 0.05)',
        }
      }}
    >
      <Box sx={{ mb: 2 }}>
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUpload />}
            disabled={uploading}
            sx={{
              backgroundColor: '#1AA962',
              '&:hover': {
                backgroundColor: '#158c51',
              }
            }}
          >
            Upload CSV File
          </Button>
        </label>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Drag and drop a CSV file here or click to select
        </Typography>
      </Box>

      {uploading && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Processing: {progress}%
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default FileUpload; 