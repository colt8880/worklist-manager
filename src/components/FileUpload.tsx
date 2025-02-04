// src/components/FileUpload.tsx
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
import Papa, { ParseResult } from 'papaparse';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
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
    console.log('Starting to parse file:', file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results: ParseResult<any>) => {
        console.log('Parse complete. Results:', results);
        console.log('Data:', results.data);
        console.log('Errors:', results.errors);
        console.log('Meta:', results.meta);

        if (results.errors.length > 0) {
          console.error('Parse errors:', results.errors);
          setError(`Error parsing CSV file: ${results.errors[0].message}`);
          setUploading(false);
          return;
        }

        if (!results.data || results.data.length === 0) {
          console.error('No data found in parsed results');
          setError('No data found in file');
          setUploading(false);
          return;
        }

        console.log('First row of data:', results.data[0]);
        console.log('Number of rows:', results.data.length);
        console.log('Fields:', results.meta.fields);

        onFileUpload(results.data);
        setUploading(false);
        setProgress(100);
      },
      error: (error: any) => {
        console.error('Papa parse error:', error);
        setError(`Error reading file: ${error.message}`);
        setUploading(false);
      },
      beforeFirstChunk: (chunk: string) => {
        console.log('First chunk of file:', chunk);
        return chunk;
      }
    });
  }, [onFileUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length) {
      const fakeEvent = {
        target: {
          files: files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        textAlign: 'center',
        border: '2px dashed #ccc',
        backgroundColor: '#fafafa'
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
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