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

// Define types for Papa.parse callbacks
interface ParseResult {
  data: any[];
  errors: { message: string }[];
  meta: any;
}

interface ParseError {
  message: string;
  [key: string]: any;
}

/**
 * FileUpload component that handles CSV file uploads with progress tracking
 * 
 * @param onFileUpload - Callback function to handle the uploaded data
 * @returns React component for file uploading with progress bar
 */
const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [bytesProcessed, setBytesProcessed] = useState(0);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('No file selected');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);
    setFileSize(file.size);
    setBytesProcessed(0);

    // Create a FileReader to track progress
    const fileReader = new FileReader();
    
    // Track progress during file reading
    fileReader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progressPercent = Math.round((event.loaded / event.total) * 50);
        setProgress(progressPercent); // First 50% is file reading
      }
    };

    fileReader.onload = (event) => {
      const csvData = event.target?.result as string;
      
      // We'll collect all data here
      const allData: any[] = [];
      let parseErrors: any[] = [];
      
      // Parse the CSV data with progress tracking
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: 'greedy',
        step: (results, parser) => {
          // Update progress based on row count
          if (results.data && typeof results.data === 'object') {
            allData.push(results.data);
            
            // Calculate progress (50-95% range for parsing)
            const parseProgress = Math.min(95, 50 + Math.round((allData.length / (csvData.length / 100)) * 45));
            setProgress(parseProgress);
          }
          
          if (results.errors && results.errors.length > 0) {
            parseErrors = parseErrors.concat(results.errors);
          }
        },
        complete: () => {
          if (parseErrors.length > 0) {
            setError(`Error parsing CSV file: ${parseErrors[0].message}`);
            setUploading(false);
            return;
          }

          if (!allData || allData.length === 0) {
            setError('No data found in file');
            setUploading(false);
            return;
          }

          // Ensure the first row is an object with properties
          const firstRow = allData[0];
          if (typeof firstRow !== 'object' || firstRow === null) {
            setError('Invalid CSV format: First row is not a valid object');
            setUploading(false);
            return;
          }

          // Now we can safely get the headers
          const headers = Object.keys(firstRow);
          const invalidRows = allData.some(row => 
            typeof row === 'object' && row !== null && 
            !headers.every(header => Object.prototype.hasOwnProperty.call(row, header))
          );

          if (invalidRows) {
            setError('Invalid CSV format: Some rows are missing columns');
            setUploading(false);
            return;
          }

          try {
            // Set progress to 95% before calling onFileUpload
            setProgress(95);
            
            // Process the data
            onFileUpload(allData as DataRecord[]);
            
            // Complete the progress
            setProgress(100);
            setUploading(false);
          } catch (err) {
            setError('Failed to process file data');
            setUploading(false);
          }
        },
        error: (error: ParseError) => {
          setError(`Error reading file: ${error.message}`);
          setUploading(false);
        }
      });
    };

    fileReader.onerror = () => {
      setError('Error reading the file');
      setUploading(false);
    };

    // Start reading the file
    fileReader.readAsText(file);
  }, [onFileUpload]);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{
              height: 10,
              borderRadius: 5,
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundColor: '#1AA962',
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {progress < 100 ? 'Processing...' : 'Complete!'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {progress}%
            </Typography>
          </Box>
          {fileSize > 0 && (
            <Typography variant="caption" color="textSecondary">
              File size: {formatFileSize(fileSize)}
            </Typography>
          )}
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