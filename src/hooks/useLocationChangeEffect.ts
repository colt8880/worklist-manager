import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../store/store';
import { setCurrentPage } from '../store/slices/authSlice';

/**
 * Custom hook that tracks location changes and updates the current page in the store
 * 
 * This hook no longer handles error clearing, as that's now managed by the individual pages
 */
export const useLocationChangeEffect = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only process when the path actually changes
    if (prevPathRef.current !== location.pathname) {
      const prevPath = prevPathRef.current;
      const currentPath = location.pathname;
      
      console.log('[useLocationChangeEffect] Path changed from', prevPath, 'to', currentPath);
      
      // Track the current page
      dispatch(setCurrentPage(currentPath));
      
      // Update the previous path
      prevPathRef.current = currentPath;
    }
  }, [location.pathname, dispatch]);
}; 