import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  sidebarOpen: false,
  theme: localStorage.getItem('theme') || 'light',
  notifications: [],
  loading: {
    global: false,
    components: {},
  },
  modals: {
    createCourse: false,
    editCourse: false,
    createUser: false,
    editUser: false,
    createEnrollment: false,
    editEnrollment: false,
    confirmDelete: false,
  },
  alerts: [],
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
    },
    
    // Loading states
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action) => {
      const { component, loading } = action.payload;
      state.loading.components[component] = loading;
    },
    clearComponentLoading: (state, action) => {
      delete state.loading.components[action.payload];
    },
    
    // Modals
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    
    // Alerts
    addAlert: (state, action) => {
      const alert = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.alerts.push(alert);
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const {
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  
  // Theme
  setTheme,
  toggleTheme,
  
  // Loading
  setGlobalLoading,
  setComponentLoading,
  clearComponentLoading,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  
  // Alerts
  addAlert,
  removeAlert,
  clearAlerts,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectGlobalLoading = (state) => state.ui.loading.global;
export const selectComponentLoading = (component) => (state) => 
  state.ui.loading.components[component] || false;
export const selectModals = (state) => state.ui.modals;
export const selectModalOpen = (modal) => (state) => state.ui.modals[modal] || false;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) => 
  state.ui.notifications.filter(n => !n.read);
export const selectAlerts = (state) => state.ui.alerts;

export default uiSlice.reducer;