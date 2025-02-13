import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const LandingPage: React.FC = () => {
  return (
    <Box sx={{ pt: 8, pb: 6 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            component="h1"
            variant="h2"
            color="primary"
            gutterBottom
            sx={{ fontWeight: 700, mb: 3 }}
          >
            Transform Your Data Workflow
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Effortlessly manage, organize, and collaborate on your data with our intuitive worklist management solution.
            Say goodbye to spreadsheet chaos and hello to streamlined productivity.
          </Typography>
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
              <TableChartIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Dynamic Data Tables
              </Typography>
              <Typography color="text.secondary">
                Create and customize tables with powerful features like sorting, filtering, and custom column types.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
              <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Easy Data Import
              </Typography>
              <Typography color="text.secondary">
                Import your existing data with just a few clicks. Support for various file formats to get you started quickly.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
              <CheckCircleIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Real-time Updates
              </Typography>
              <Typography color="text.secondary">
                Changes are saved automatically and instantly accessible. Never worry about losing your work again.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="text.primary" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography color="text.secondary" paragraph sx={{ mb: 3 }}>
            Join thousands of users who have already transformed their data management workflow.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}; 