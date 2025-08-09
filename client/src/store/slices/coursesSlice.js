import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { coursesAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  courses: [],
  currentCourse: null,
  categories: [],
  stats: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {
    search: '',
    category: '',
    level: '',
    instructor: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { filters } = getState().courses;
      const queryParams = { ...filters, ...params };
      
      const response = await coursesAPI.getAll(queryParams);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch courses';
      return rejectWithValue(message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await coursesAPI.getById(id);
      return response.data.data.course;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch course';
      return rejectWithValue(message);
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { rejectWithValue, dispatch }) => {
    try {
      const response = await coursesAPI.create(courseData);
      toast.success('Course created successfully!');
      
      // Refresh courses list
      dispatch(fetchCourses());
      
      return response.data.data.course;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create course';
      return rejectWithValue(message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await coursesAPI.update(id, data);
      toast.success('Course updated successfully!');
      
      // Refresh courses list
      dispatch(fetchCourses());
      
      return response.data.data.course;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update course';
      return rejectWithValue(message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await coursesAPI.delete(id);
      toast.success('Course deleted successfully!');
      
      // Refresh courses list
      dispatch(fetchCourses());
      
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete course';
      return rejectWithValue(message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'courses/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await coursesAPI.getCategories();
      return response.data.data.categories;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch categories';
      return rejectWithValue(message);
    }
  }
);

export const fetchCourseStats = createAsyncThunk(
  'courses/fetchCourseStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await coursesAPI.getStats();
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch course stats';
      return rejectWithValue(message);
    }
  }
);

// Courses slice
const coursesSlice = createSlice({
  name: 'courses',
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
        category: '',
        level: '',
        instructor: '',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
    },
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        state.error = null;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(course => course.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      
      // Fetch Course Stats
      .addCase(fetchCourseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentCourse,
  clearCurrentCourse,
} = coursesSlice.actions;

// Selectors
export const selectCourses = (state) => state.courses.courses;
export const selectCurrentCourse = (state) => state.courses.currentCourse;
export const selectCategories = (state) => state.courses.categories;
export const selectCourseStats = (state) => state.courses.stats;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectCoursesError = (state) => state.courses.error;
export const selectCoursesPagination = (state) => state.courses.pagination;
export const selectCoursesFilters = (state) => state.courses.filters;

export default coursesSlice.reducer;