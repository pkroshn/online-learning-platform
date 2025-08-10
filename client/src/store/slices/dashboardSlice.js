import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../utils/api';

// Initial state
const initialState = {
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Fetch dashboard statistics
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getStats();
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch dashboard statistics';
      return rejectWithValue(message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStats: (state) => {
      state.stats = null;
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearStats,
} = dashboardSlice.actions;

// Selectors
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardLastUpdated = (state) => state.dashboard.lastUpdated;

// Derived selectors
export const selectOverviewStats = (state) => state.dashboard.stats?.overview;
export const selectUserStats = (state) => state.dashboard.stats?.users;
export const selectCourseStats = (state) => state.dashboard.stats?.courses;
export const selectEnrollmentStats = (state) => state.dashboard.stats?.enrollments;
export const selectTrends = (state) => state.dashboard.stats?.trends;
export const selectPopularCourses = (state) => state.dashboard.stats?.popular?.courses;
export const selectRecentActivity = (state) => state.dashboard.stats?.recent;
export const selectAnalytics = (state) => state.dashboard.stats?.analytics;
export const selectSystemHealth = (state) => state.dashboard.stats?.systemHealth;

export default dashboardSlice.reducer;