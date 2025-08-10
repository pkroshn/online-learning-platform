import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  users: [],
  instructors: [],
  currentUser: null,
  stats: null,
  loading: false,
  instructorsLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
};

// Fetch instructors
export const fetchInstructors = createAsyncThunk(
  'users/fetchInstructors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getInstructors();
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch instructors';
      return rejectWithValue(message);
    }
  }
);

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { filters } = getState().users;
      const queryParams = { ...filters, ...params };
      
      // Map status filter to isActive for backend compatibility
      if (queryParams.status) {
        queryParams.isActive = queryParams.status === 'active';
        delete queryParams.status;
      }
      
      const response = await usersAPI.getAll(queryParams);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getById(id);
      return response.data.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch user';
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await usersAPI.create(userData);
      
      // Refresh users list
      dispatch(fetchUsers());
      
      return response.data.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create user';
      return rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await usersAPI.update(id, data);
      
      // Refresh users list
      dispatch(fetchUsers());
      
      return response.data.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user';
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await usersAPI.delete(id);
      
      // Refresh users list
      dispatch(fetchUsers());
      
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      return rejectWithValue(message);
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await usersAPI.toggleStatus(id);
      toast.success(response.data.message);
      
      // Refresh users list
      dispatch(fetchUsers());
      
      return response.data.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle user status';
      return rejectWithValue(message);
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  'users/resetUserPassword',
  async ({ id, newPassword }, { rejectWithValue }) => {
    try {
      await usersAPI.resetPassword(id, { newPassword });
      toast.success('Password reset successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      return rejectWithValue(message);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'users/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getStats();
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch user stats';
      return rejectWithValue(message);
    }
  }
);

// Users slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        role: '',
        isActive: '',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // The API response structure is: { success: true, data: { users: [...], pagination: {...} } }
        state.users = action.payload.data?.users || [];
        state.pagination = action.payload.data?.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Instructors
      .addCase(fetchInstructors.pending, (state) => {
        state.instructorsLoading = true;
        state.error = null;
      })
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        state.instructorsLoading = false;
        state.instructors = action.payload;
        state.error = null;
      })
      .addCase(fetchInstructors.rejected, (state, action) => {
        state.instructorsLoading = false;
        state.error = action.payload;
      })
      
      // Fetch User by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle User Status
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        state.error = null;
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reset User Password
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch User Stats
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentUser,
  clearCurrentUser,
} = usersSlice.actions;

// Selectors
export const selectUsers = (state) => state.users.users;
export const selectInstructors = (state) => state.users.instructors;
export const selectCurrentUser = (state) => state.users.currentUser;
export const selectUserStats = (state) => state.users.stats;
export const selectUsersLoading = (state) => state.users.loading;
export const selectInstructorsLoading = (state) => state.users.instructorsLoading;
export const selectUsersError = (state) => state.users.error;
export const selectUsersPagination = (state) => state.users.pagination;
export const selectUsersFilters = (state) => state.users.filters;

export default usersSlice.reducer;