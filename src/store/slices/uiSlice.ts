import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationState {
  message: string;
  type: NotificationType;
  open: boolean;
  retryAction?: () => void;
  retryLabel?: string;
}

interface DialogState {
  isLoginOpen: boolean;
  isNewProjectOpen: boolean;
}

interface UIState {
  notification: NotificationState;
  dialog: DialogState;
}

const initialState: UIState = {
  notification: {
    message: '',
    type: 'info',
    open: false,
  },
  dialog: {
    isLoginOpen: false,
    isNewProjectOpen: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type: NotificationType;
        retryAction?: () => void;
        retryLabel?: string;
      }>
    ) => {
      state.notification = {
        ...action.payload,
        open: true,
      };
    },
    hideNotification: (state) => {
      state.notification.open = false;
    },
    setLoginDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.dialog.isLoginOpen = action.payload;
    },
    setNewProjectDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.dialog.isNewProjectOpen = action.payload;
    },
  },
});

export const {
  showNotification,
  hideNotification,
  setLoginDialogOpen,
  setNewProjectDialogOpen,
} = uiSlice.actions;

export default uiSlice.reducer; 