import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import coursesSlice from './slices/coursesSlice';
import enrollmentsSlice from './slices/enrollmentsSlice';
import usersSlice from './slices/usersSlice';
import uiSlice from './slices/uiSlice';
import settingsSlice from './slices/settingsSlice';
import dashboardSlice from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: coursesSlice,
    enrollments: enrollmentsSlice,
    users: usersSlice,
    ui: uiSlice,
    settings: settingsSlice,
    dashboard: dashboardSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;