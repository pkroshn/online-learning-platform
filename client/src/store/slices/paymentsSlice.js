import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  paymentHistory: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
};

// Async thunks
export const fetchPaymentHistory = createAsyncThunk(
  'payments/fetchPaymentHistory',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const filters = state.payments.filters;
      
      // Merge filters with any passed params
      const queryParams = {
        ...filters,
        ...params,
      };

      const response = await paymentAPI.getPaymentHistory(queryParams);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch payment history';
      return rejectWithValue(message);
    }
  }
);

// Payments slice
const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
    },
    clearPaymentHistory: (state) => {
      state.paymentHistory = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payment History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload.payments;
        state.pagination = {
          currentPage: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          totalItems: action.payload.pagination.total,
          itemsPerPage: action.payload.pagination.limit,
        };
        state.error = null;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const {
  clearError,
  setFilters,
  resetFilters,
  clearPaymentHistory,
} = paymentsSlice.actions;

// Selectors
export const selectPaymentHistory = (state) => state.payments.paymentHistory;
export const selectPaymentsLoading = (state) => state.payments.loading;
export const selectPaymentsError = (state) => state.payments.error;
export const selectPaymentsPagination = (state) => state.payments.pagination;
export const selectPaymentsFilters = (state) => state.payments.filters;

export default paymentsSlice.reducer;
