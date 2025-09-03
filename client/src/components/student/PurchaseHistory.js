import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { 
  fetchPaymentHistory, 
  selectPaymentHistory, 
  selectPaymentsLoading, 
  selectPaymentsPagination,
  selectPaymentsFilters,
  setFilters,
  resetFilters
} from '../../store/slices/paymentsSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const PurchaseHistory = () => {
  const dispatch = useDispatch();
  const paymentHistory = useSelector(selectPaymentHistory);
  const loading = useSelector(selectPaymentsLoading);
  const pagination = useSelector(selectPaymentsPagination);
  const filters = useSelector(selectPaymentsFilters);
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPaymentHistory({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handleStatusFilter = (status) => {
    const newFilters = status === '' ? { status: '' } : { status };
    dispatch(setFilters(newFilters));
    setCurrentPage(1);
    dispatch(fetchPaymentHistory({ page: 1, ...newFilters }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    dispatch(fetchPaymentHistory({ page, ...filters }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setCurrentPage(1);
    dispatch(fetchPaymentHistory({ page: 1 }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XMarkIcon className="w-5 h-5 text-red-600" />;
      case 'canceled':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />;
      case 'refunded':
        return <ArrowPathIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'canceled':
        return 'bg-orange-100 text-orange-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && paymentHistory.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Purchase History</h3>
          <p className="text-sm text-gray-600 mt-1">
            View all your course purchases and payment history
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={filters.status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="select-sm border-gray-300 rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="canceled">Canceled</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <button
            onClick={handleResetFilters}
            className="btn-outline-sm text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Purchase History List */}
      {paymentHistory.length === 0 ? (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No purchases yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.status ? 'No purchases match the selected filters.' : 'Start exploring courses to make your first purchase.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentHistory.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(payment.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {payment.course?.title || 'Course Title Unavailable'}
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <AcademicCapIcon className="w-4 h-4" />
                          <span>{payment.course?.instructor || 'Instructor Unavailable'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <span className="font-medium text-gray-900">
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                        </div>
                        
                        {payment.paidAt && (
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(payment.paidAt)}</span>
                          </div>
                        )}
                      </div>
                      
                      {payment.paymentMethod && (
                        <div className="mt-3 text-sm text-gray-500">
                          Payment Method: {payment.paymentMethod}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {payment.currency}
                  </div>
                </div>
              </div>
              
              {payment.receiptUrl && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={payment.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Receipt →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="btn-outline-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="btn-outline-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
