import { configureStore } from '@reduxjs/toolkit';
import gmailReducer from './slices/gmailSlice';

export const store = configureStore({
  reducer: {
    gmail: gmailReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;