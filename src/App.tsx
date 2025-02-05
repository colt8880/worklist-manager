// src/App.tsx
import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography,
  Box,
  Alert,
  Button,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileUpload from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { DataRecord } from './types';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const App: React.FC = () => {
  const [data, setData] = useState<DataRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const handleFileUpload = (uploadedData: DataRecord[]) => {
    try {
      if (!Array.isArray(uploadedData) || uploadedData.length === 0) {
        throw new Error('No data found in the uploaded file');
      }

      const detectedColumns = Object.keys(uploadedData[0]);

      if (detectedColumns.length === 0) {
        throw new Error('No columns detected in the file');
      }

      setColumns(detectedColumns);
      setData(uploadedData);
      setError(null);
      setSuccess(`Successfully loaded ${uploadedData.length} records`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setData([]);
      setColumns([]);
      setSuccess(null);
    }
  };

  const handleFilterClick = () => {
    console.log('Filter button clicked');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          {/* Header */}
          <Typography variant="h4" component="h1" gutterBottom>
            Worklist Manager
          </Typography>
          
          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Main Content */}
          {data.length === 0 ? (
            <FileUpload onFileUpload={handleFileUpload} />
          ) : (
            <>
              {/* Tools Section */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<FilterAltIcon />}
                  onClick={handleFilterClick}
                >
                  Filter Data
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setData([]);
                    setColumns([]);
                    setSuccess(null);
                  }}
                >
                  Upload New File
                </Button>
              </Box>

              {/* Virtualized Table */}
              <DataTable data={data} columns={columns} />
            </>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default App;