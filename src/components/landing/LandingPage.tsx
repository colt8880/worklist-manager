import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppSelector } from '../../store/store';

const FeatureIcon = styled(CheckCircleIcon)(({ theme }) => ({
  color: theme.palette.success.main,
  marginRight: theme.spacing(1),
}));

/**
 * LandingPage component displays the main landing page for unauthenticated users
 * 
 * @returns {JSX.Element} The landing page component
 */
const LandingPage: React.FC = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { user, authError } = useAppSelector((state) => state.auth);

  // If user is logged in and there's no auth error, redirect to projects
  React.useEffect(() => {
    if (user && !authError) {
      navigate('/projects');
    }
  }, [user, authError, navigate]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('error', (e) => {
        console.error('Video error:', e);
      });
      video.addEventListener('loadeddata', () => {
        console.log('Video loaded successfully');
      });
    }
  }, []);

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100vw', 
      left: '50%', 
      right: '50%', 
      marginLeft: '-50vw', 
      marginRight: '-50vw',
      ...(user && { mt: '-24px' }) // Compensate for Layout padding when logged in
    }}>
      {/* Video Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '100%',
          maxHeight: '600px',
          overflow: 'hidden',
          zIndex: 0,
          bgcolor: 'background.default',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.7))',
            pointerEvents: 'none',
          }
        }}
      >
        <video
          ref={videoRef}
          className="landing-video"
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => console.error('[Landing] Video playback error:', {
            error: e,
            src: e.currentTarget.src
          })}
        >
          <source
            src={process.env.PUBLIC_URL + '/assets/videos/data-background.mp4'}
            type="video/mp4"
            onError={(e) => console.error('[Landing] Video source error:', {
              error: e,
              src: e.currentTarget.src
            })}
          />
        </video>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ 
            textAlign: 'center', 
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 0,
            ...(user && { pt: '64px' }) // Add padding-top when logged in
          }}>
            <Typography
              component="h1"
              variant="h2"
              gutterBottom
              sx={{ 
                fontWeight: 800, 
                mb: 3,
                color: 'primary.main',
                letterSpacing: '-0.5px',
                fontSize: { xs: '2.5rem', md: '3.75rem' }
              }}
            >
              Transform Your Workflow
            </Typography>
            <Typography 
              variant="h5" 
              color="text.primary" 
              paragraph 
              sx={{ 
                mb: 4,
                maxWidth: '800px',
                mx: 'auto',
                fontWeight: 500,
                color: 'rgba(0, 0, 0, 0.87)',
                textShadow: '0 1px 4px rgba(255,255,255,0.5)'
              }}
            >
              Effortlessly manage, organize, and collaborate on your operational data with our intuitive worklist management solution.
              Say goodbye to spreadsheet chaos and hello to streamlined productivity.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleRegisterClick}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 20px 0 rgba(0,0,0,0.15)'
                }
              }}
            >
              Get Started Free
            </Button>
          </Box>

          {/* Features Section - Now with white background */}
          <Box sx={{ 
            py: 5,
            width: '100%',
            mt: 0
          }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, height: '100%', textAlign: 'center' }}>
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
                <Paper elevation={0} sx={{ p: 2, height: '100%', textAlign: 'center' }}>
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
                <Paper elevation={0} sx={{ p: 2, height: '100%', textAlign: 'center' }}>
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
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 