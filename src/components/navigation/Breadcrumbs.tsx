import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../../store/store';

/**
 * Breadcrumbs component provides navigation context to users
 * It shows the current location in the application hierarchy
 * 
 * @returns {JSX.Element} The breadcrumbs navigation component
 */
export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { currentProject } = useAppSelector((state) => state.projects);

  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <MuiBreadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link
        component={RouterLink}
        to="/"
        color="inherit"
        underline="hover"
      >
        Home
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        let label = value;
        if (value === 'projects' && !last) {
          label = 'Projects';
        } else if (currentProject && value === currentProject.id) {
          label = currentProject.name;
        }

        return last ? (
          <Typography color="text.primary" key={to}>
            {label}
          </Typography>
        ) : (
          <Link
            component={RouterLink}
            to={to}
            color="inherit"
            key={to}
            underline="hover"
          >
            {label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}; 