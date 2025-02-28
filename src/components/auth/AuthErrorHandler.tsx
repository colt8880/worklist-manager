import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { clearError } from '../../store/slices/authSlice';

/**
 * AuthErrorHandler component
 * 
 * This component is responsible for clearing auth errors when mounted
 * and when authError changes
 * 
 * @returns null - This component doesn't render anything
 */
const AuthErrorHandler: React.FC = () => {
  const dispatch = useAppDispatch();
  const { authError } = useAppSelector(state => state.auth);
  
  // Clear errors when component mounts
  useEffect(() => {
    console.log('[AuthErrorHandler] Component mounted, clearing errors');
    dispatch(clearError());
  }, [dispatch]);
  
  // Also clear errors when authError changes and is not null
  useEffect(() => {
    if (authError) {
      console.log('[AuthErrorHandler] authError detected, will clear on unmount');
      
      // Return cleanup function to clear error when component unmounts
      return () => {
        console.log('[AuthErrorHandler] Component unmounting, clearing errors');
        dispatch(clearError());
      };
    }
  }, [authError, dispatch]);
  
  // This component doesn't render anything
  return null;
};

export default AuthErrorHandler; 