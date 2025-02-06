import { Components, Theme } from '@mui/material/styles';

export const components: Components<Theme> = {
  MuiPaper: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        borderRadius: 12,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
      } as const,
    },
  },
}; 