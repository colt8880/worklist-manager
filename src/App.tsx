// src/App.tsx
import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Typography,
  Box
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FileUpload from './components/FileUpload';


// Define types
interface Task {
  id: string;
  title: string;
  status: 'pending' | 'inProgress' | 'completed';
  assignedTo?: string;
}

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

interface UploadedData {
  [key: string]: any;
}

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [uploadedData, setUploadedData] = useState<UploadedData[]>([]);

  const handleFileUpload = (data: UploadedData[]) => {
    setUploadedData(data);
    setActiveStep(1); // Move to next step after successful upload
  };

  const steps = [
    'Upload Dataset',
    'Filter Data',
    'View & Assign Tasks',
    'Update Status',
    'Generate Reports'
  ];

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Worklist Manager
          </Typography>
          
          <Box sx={{ width: '100%', mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              {steps[activeStep]}
            </Typography>
            {activeStep === 0 && (
              <FileUpload onFileUpload={handleFileUpload} />
            )}
            {activeStep > 0 && (
              <Typography color="textSecondary">
                {uploadedData.length} records loaded. Ready for filtering.
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default App;