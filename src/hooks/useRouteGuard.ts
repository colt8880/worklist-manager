import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/store';

interface RouteGuardConfig {
  requireAuth?: boolean;
  redirectTo?: string;
}

export const useRouteGuard = (config: RouteGuardConfig = {}) => {
  const { requireAuth = false, redirectTo = '/' } = config;
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle authentication check
    if (requireAuth && !user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, requireAuth, redirectTo, navigate]);

  return { isAuthenticated: !!user };
}; 