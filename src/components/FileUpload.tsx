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
import Papa from 'papaparse';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size exceeds 100MB limit');
      setUploading(false);
      return;
    }

    try {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError('Error parsing CSV file');
            console.error('Parse errors:', results.errors);
          } else {
            onFileUpload(results.data);
          }
          setUploading(false);
          setProgress(100);
        },
        error: (error) => {
          setError(`Error reading file: ${error.message}`);
          setUploading(false);
        },
        step: (results, parser) => {
          // Update progress based on rows processed
          const progress = Math.round((results.meta.cursor / file.size) * 100);
          setProgress(Math.min(progress, 99)); // Cap at 99% until complete
        }
      });
    } catch (err) {
      setError('Error processing file');
      setUploading(false);
    }
  }, [onFileUpload]);

  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
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