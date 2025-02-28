import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationState {
  message: string;
  type: NotificationType;
  open: boolean;
  retryAction?: () => void;
  retryLabel?: string;
}

interface DialogState {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
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
    isRegisterOpen: false,
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
        message: action.payload.message,
        type: action.payload.type,
        open: true,
        retryAction: action.payload.retryAction,
        retryLabel: action.payload.retryLabel,
      };
    },
    hideNotification: (state) => {
      state.notification.open = false;
      state.notification.retryAction = undefined;
      state.notification.retryLabel = undefined;
    },
    setLoginDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.dialog.isLoginOpen = action.payload;
    },
    setRegisterDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.dialog.isRegisterOpen = action.payload;
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
  setRegisterDialogOpen,
  setNewProjectDialogOpen,
} = uiSlice.actions;

export default uiSlice.reducer; 