import { configureStore, Middleware, Action } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import uiReducer from './slices/uiSlice';

// Debug middleware to log state changes
const debugMiddleware: Middleware = store => next => action => {
  if (typeof action === 'object' && action !== null && 'type' in action) {
    console.log('[Redux] Action:', (action as Action).type);
  } else {
    console.log('[Redux] Action:', action);
  }
  
  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();
  
  // Check if authError changed
  if (prevState.auth.authError !== nextState.auth.authError) {
    console.log('[Redux] authError changed:', {
      from: prevState.auth.authError,
      to: nextState.auth.authError
    });
  }
  
  return result;
};

// Configure specific persistence for the auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['authError', 'isLoading', 'lastAction'], // Don't persist these fields
  debug: true, // Enable debug mode for redux-persist
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  projects: projectsReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(debugMiddleware),
});

export const persistor = persistStore(store);

// Manually clear persisted error state on startup
const state = store.getState();
if (state.auth.authError) {
  console.log('[Redux] Clearing persisted authError on startup:', state.auth.authError);
  store.dispatch({ type: 'auth/clearError' });
}

export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 