import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enrollmentsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  enrollments: [],
  myEnrollments: [],
  currentEnrollment: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

// Async thunks
export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchEnrollments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await enrollmentsAPI.getAll(params);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch enrollments';
      return rejectWithValue(message);
    }
  }
);

export const fetchMyEnrollments = createAsyncThunk(
  'enrollments/fetchMyEnrollments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await enrollmentsAPI.getMy(params);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch your enrollments';
      return rejectWithValue(message);
    }
  }
);

export const fetchEnrollmentById = createAsyncThunk(
  'enrollments/fetchEnrollmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await enrollmentsAPI.getById(id);
      return response.data.data.enrollment;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch enrollment';
      return rejectWithValue(message);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'enrollments/enrollInCourse',
  async (courseId, { rejectWithValue, dispatch }) => {
    try {
      const response = await enrollmentsAPI.enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      
      // Refresh my enrollments
      dispatch(fetchMyEnrollments());
      
      return response.data.data.enrollment;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to enroll in course';
      return rejectWithValue(message);
    }
  }
);

export const createEnrollment = createAsyncThunk(
  'enrollments/createEnrollment',
  async (enrollmentData, { rejectWithValue, dispatch }) => {
    try {
      const response = await enrollmentsAPI.create(enrollmentData);
      toast.success('Enrollment created successfully!');
      
      // Refresh enrollments list
      dispatch(fetchEnrollments());
      
      return response.data.data.enrollment;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create enrollment';
      return rejectWithValue(message);
    }
  }
);

export const updateEnrollment = createAsyncThunk(
  'enrollments/updateEnrollment',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await enrollmentsAPI.update(id, data);
      toast.success('Enrollment updated successfully!');
      
      // Refresh enrollments list
      dispatch(fetchEnrollments());
      
      return response.data.data.enrollment;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update enrollment';
      return rejectWithValue(message);
    }
  }
);

export const deleteEnrollment = createAsyncThunk(
  'enrollments/deleteEnrollment',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await enrollmentsAPI.delete(id);
      toast.success('Enrollment deleted successfully!');
      
      // Refresh enrollments list
      dispatch(fetchEnrollments());
      
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete enrollment';
      return rejectWithValue(message);
    }
  }
);

export const fetchEnrollmentStats = createAsyncThunk(
  'enrollments/fetchEnrollmentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await enrollmentsAPI.getStats();
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch enrollment stats';
      return rejectWithValue(message);
    }
  }
);

// Enrollments slice
const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentEnrollment: (state, action) => {
      state.currentEnrollment = action.payload;
    },
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Enrollments
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload.enrollments;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch My Enrollments
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.myEnrollments = action.payload.enrollments;
        state.error = null;
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Enrollment by ID
      .addCase(fetchEnrollmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEnrollment = action.payload;
        state.error = null;
      })
      .addCase(fetchEnrollmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Enroll in Course
      .addCase(enrollInCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Enrollment
      .addCase(createEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEnrollment.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Enrollment
      .addCase(updateEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEnrollment = action.payload;
        state.error = null;
      })
      .addCase(updateEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Enrollment
      .addCase(deleteEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = state.enrollments.filter(enrollment => enrollment.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Enrollment Stats
      .addCase(fetchEnrollmentStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentEnrollment,
  clearCurrentEnrollment,
} = enrollmentsSlice.actions;

// Selectors
export const selectEnrollments = (state) => state.enrollments.enrollments;
export const selectMyEnrollments = (state) => state.enrollments.myEnrollments;
export const selectCurrentEnrollment = (state) => state.enrollments.currentEnrollment;
export const selectEnrollmentStats = (state) => state.enrollments.stats;
export const selectEnrollmentsLoading = (state) => state.enrollments.loading;
export const selectEnrollmentsError = (state) => state.enrollments.error;
export const selectEnrollmentsPagination = (state) => state.enrollments.pagination;

export default enrollmentsSlice.reducer;