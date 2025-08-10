import { createSlice } from '@reduxjs/toolkit';

// Initial platform settings
const initialState = {
  platform: {
    siteName: 'EduPlatform',
    siteDescription: 'Your premier destination for online education',
    contactEmail: 'admin@eduplatform.com',
    supportPhone: '+1 (555) 123-4567',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false
  },
  users: {
    allowRegistration: true,
    requireEmailVerification: true,
    defaultRole: 'student',
    maxStudentsPerCourse: 50,
    passwordMinLength: 6,
    sessionTimeout: 30,
    allowProfilePictures: true,
    availableRoles: [
      { value: 'student', label: 'Student', description: 'Can enroll in courses and view content' },
      { value: 'instructor', label: 'Instructor', description: 'Can create and manage courses' },
      { value: 'admin', label: 'Administrator', description: 'Full system access and management' }
    ]
  },
  courses: {
    defaultDuration: 40,
    allowGuestPreview: true,
    autoEnrollment: false,
    certificateGeneration: true,
    maxFileUploadSize: 10,
    defaultCurrency: 'USD',
    availableCurrencies: [
      { value: 'USD', label: 'US Dollar', symbol: '$' },
      { value: 'EUR', label: 'Euro', symbol: '€' },
      { value: 'GBP', label: 'British Pound', symbol: '£' },
      { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
      { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
      { value: 'JPY', label: 'Japanese Yen', symbol: '¥' }
    ]
  },
  notifications: {
    emailNotifications: true,
    enrollmentNotifications: true,
    completionNotifications: true,
    reminderNotifications: true,
    adminNotifications: true,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpSecure: true
  },
  security: {
    twoFactorAuth: false,
    loginAttempts: 5,
    lockoutDuration: 15,
    passwordExpiry: 90,
    rateLimitRequests: 100,
    rateLimitWindow: 15
  },
  analytics: {
    trackUserActivity: true,
    anonymizeData: false,
    dataRetentionDays: 365,
    exportFormat: 'csv',
    reportingFrequency: 'weekly'
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updatePlatformSettings: (state, action) => {
      state.platform = { ...state.platform, ...action.payload };
    },
    updateUserSettings: (state, action) => {
      state.users = { ...state.users, ...action.payload };
    },
    updateCourseSettings: (state, action) => {
      state.courses = { ...state.courses, ...action.payload };
    },
    updateNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updateSecuritySettings: (state, action) => {
      state.security = { ...state.security, ...action.payload };
    },
    updateAnalyticsSettings: (state, action) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },
    updateAllSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetSettings: () => initialState,
    toggleMaintenanceMode: (state) => {
      state.platform.maintenanceMode = !state.platform.maintenanceMode;
    },
    // Role management actions
    addUserRole: (state, action) => {
      const newRole = action.payload;
      if (!state.users.availableRoles.find(role => role.value === newRole.value)) {
        state.users.availableRoles.push(newRole);
      }
    },
    updateUserRole: (state, action) => {
      const { oldValue, newRole } = action.payload;
      const index = state.users.availableRoles.findIndex(role => role.value === oldValue);
      if (index !== -1) {
        state.users.availableRoles[index] = newRole;
        // Update default role if it was the one being updated
        if (state.users.defaultRole === oldValue) {
          state.users.defaultRole = newRole.value;
        }
      }
    },
    removeUserRole: (state, action) => {
      const roleValue = action.payload;
      // Don't allow removing essential roles
      if (['student', 'admin'].includes(roleValue)) return;
      
      state.users.availableRoles = state.users.availableRoles.filter(role => role.value !== roleValue);
      // Reset default role if the removed role was default
      if (state.users.defaultRole === roleValue) {
        state.users.defaultRole = 'student';
      }
    },
    // Currency management actions
    addCurrency: (state, action) => {
      const newCurrency = action.payload;
      if (!state.courses.availableCurrencies.find(currency => currency.value === newCurrency.value)) {
        state.courses.availableCurrencies.push(newCurrency);
      }
    },
    updateCurrency: (state, action) => {
      const { oldValue, newCurrency } = action.payload;
      const index = state.courses.availableCurrencies.findIndex(currency => currency.value === oldValue);
      if (index !== -1) {
        state.courses.availableCurrencies[index] = newCurrency;
        // Update default currency if it was the one being updated
        if (state.courses.defaultCurrency === oldValue) {
          state.courses.defaultCurrency = newCurrency.value;
        }
      }
    },
    removeCurrency: (state, action) => {
      const currencyValue = action.payload;
      // Don't allow removing USD as it's the base currency
      if (currencyValue === 'USD') return;
      
      state.courses.availableCurrencies = state.courses.availableCurrencies.filter(currency => currency.value !== currencyValue);
      // Reset default currency if the removed currency was default
      if (state.courses.defaultCurrency === currencyValue) {
        state.courses.defaultCurrency = 'USD';
      }
    }
  }
});

export const {
  updatePlatformSettings,
  updateUserSettings,
  updateCourseSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  updateAnalyticsSettings,
  updateAllSettings,
  resetSettings,
  toggleMaintenanceMode,
  addUserRole,
  updateUserRole,
  removeUserRole,
  addCurrency,
  updateCurrency,
  removeCurrency
} = settingsSlice.actions;

// Selectors
export const selectPlatformSettings = (state) => state.settings.platform;
export const selectUserSettings = (state) => state.settings.users;
export const selectCourseSettings = (state) => state.settings.courses;
export const selectNotificationSettings = (state) => state.settings.notifications;
export const selectSecuritySettings = (state) => state.settings.security;
export const selectAnalyticsSettings = (state) => state.settings.analytics;
export const selectAllSettings = (state) => state.settings;

// Specific selectors for commonly used values
export const selectSiteName = (state) => state.settings.platform.siteName;
export const selectSiteDescription = (state) => state.settings.platform.siteDescription;
export const selectContactEmail = (state) => state.settings.platform.contactEmail;
export const selectMaintenanceMode = (state) => state.settings.platform.maintenanceMode;
export const selectAllowRegistration = (state) => state.settings.users.allowRegistration;

// Role and Currency selectors
export const selectAvailableRoles = (state) => state.settings.users.availableRoles;
export const selectDefaultRole = (state) => state.settings.users.defaultRole;
export const selectAvailableCurrencies = (state) => state.settings.courses.availableCurrencies;
export const selectDefaultCurrency = (state) => state.settings.courses.defaultCurrency;

export default settingsSlice.reducer;