// src/App.tsx
import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Typography,
  Box,
  Alert
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FileUpload from './components/FileUpload';

// Define interfaces for our data types
interface Task {
  id?: string;
  title: string;
  status: 'pending' | 'inProgress' | 'completed';
  assignedTo?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface UploadedData {
  [key: string]: any;
}

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Define the steps for our workflow
const WORKFLOW_STEPS = [
  'Upload Dataset',
  'Filter Data',
  'View & Assign Tasks',
  'Update Status',
  'Generate Reports'
] as const;

const App: React.FC = () => {
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedData, setUploadedData] = useState<UploadedData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = (data: UploadedData[]) => {
    try {
      // Basic validation
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data found in the uploaded file');
      }

      const firstRow = data[0];
      if (!firstRow || Object.keys(firstRow).length === 0) {
        throw new Error('Invalid data structure in file');
      }

      // Store the data and move to next step
      setUploadedData(data);
      setError(null);
      setSuccess(`Successfully loaded ${data.length} records`);
      setActiveStep(1);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setUploadedData([]);
      setSuccess(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          {/* Header */}
          <Typography variant="h4" component="h1" gutterBottom>
            Worklist Manager
          </Typography>
          
          {/* Stepper */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {WORKFLOW_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              {WORKFLOW_STEPS[activeStep]}
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

            {/* Step Content */}
            {activeStep === 0 && (
              <FileUpload onFileUpload={handleFileUpload} />
            )}

            {activeStep === 1 && uploadedData.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography color="textSecondary">
                  Ready to proceed with data filtering
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default App;