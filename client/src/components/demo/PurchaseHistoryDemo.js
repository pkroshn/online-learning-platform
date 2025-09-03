import React, { useState } from 'react';
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

const PurchaseHistoryDemo = () => {
  const [activeTab, setActiveTab] = useState('demo');

  // Sample payment history data
  const samplePayments = [
    {
      id: 1,
      status: 'succeeded',
      amount: 99.99,
      currency: 'USD',
      paidAt: '2024-01-15T10:30:00Z',
      paymentMethod: 'Credit Card',
      course: {
        id: 1,
        title: 'Advanced JavaScript Development',
        instructor: 'Dr. Sarah Johnson'
      }
    },
    {
      id: 2,
      status: 'pending',
      amount: 149.99,
      currency: 'USD',
      paymentMethod: 'PayPal',
      course: {
        id: 2,
        title: 'React Masterclass',
        instructor: 'Mike Chen'
      }
    },
    {
      id: 3,
      status: 'failed',
      amount: 79.99,
      currency: 'USD',
      paymentMethod: 'Credit Card',
      course: {
        id: 3,
        title: 'Python for Data Science',
        instructor: 'Alex Rodriguez'
      }
    },
    {
      id: 4,
      status: 'refunded',
      amount: 199.99,
      currency: 'USD',
      paidAt: '2024-01-10T14:20:00Z',
      refundedAt: '2024-01-12T09:15:00Z',
      paymentMethod: 'Credit Card',
      course: {
        id: 4,
        title: 'Machine Learning Fundamentals',
        instructor: 'Dr. Emily Watson'
      }
    }
  ];

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

  const tabs = [
    { id: 'demo', name: 'Demo', icon: CurrencyDollarIcon },
    { id: 'code', name: 'Code Example', icon: AcademicCapIcon },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Purchase History Component Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A comprehensive component for displaying user purchase history with filtering, 
          pagination, and beautiful status indicators.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Demo Tab */}
      {activeTab === 'demo' && (
        <div className="space-y-6">
          {/* Component Demo */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Purchase History Component</h3>
              <p className="text-sm text-gray-600 mt-1">
                Interactive demo with sample data showing different payment statuses
              </p>
            </div>
            <div className="card-body">
              {/* Filters */}
              <div className="flex items-center space-x-3 mb-6">
                <select className="select-sm border-gray-300 rounded-md text-sm">
                  <option value="">All Statuses</option>
                  <option value="succeeded">Succeeded</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="canceled">Canceled</option>
                  <option value="refunded">Refunded</option>
                </select>
                
                <button className="btn-outline-sm text-sm">
                  Reset
                </button>
              </div>

              {/* Purchase History List */}
              <div className="space-y-4">
                {samplePayments.map((payment) => (
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
                              {payment.course.title}
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <AcademicCapIcon className="w-4 h-4" />
                                <span>{payment.course.instructor}</span>
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
                            
                            <div className="mt-3 text-sm text-gray-500">
                              Payment Method: {payment.paymentMethod}
                            </div>
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
                  </div>
                ))}
              </div>

              {/* Pagination Demo */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center text-sm text-gray-700">
                  <span>Showing 1 to 4 of 4 results</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="btn-outline-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-700">
                    Page 1 of 1
                  </span>
                  
                  <button className="btn-outline-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h4 className="text-lg font-semibold text-gray-900">Features</h4>
              </div>
              <div className="card-body">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Status-based filtering</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Pagination support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Responsive design</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Status indicators</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Currency formatting</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4 className="text-lg font-semibold text-gray-900">Status Types</h4>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Succeeded - Payment completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-600">Pending - Payment processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XMarkIcon className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-600">Failed - Payment failed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowPathIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Refunded - Payment refunded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {activeTab === 'code' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Usage Example</h3>
            <p className="text-sm text-gray-600 mt-1">
              How to integrate the PurchaseHistory component in your application
            </p>
          </div>
          <div className="card-body">
            <div className="prose prose-sm max-w-none">
              <h4>Basic Usage:</h4>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import PurchaseHistory from '../components/student/PurchaseHistory';

const ProfilePage = () => {
  return (
    <div>
      <h1>User Profile</h1>
      <PurchaseHistory />
    </div>
  );
};`}
              </pre>

              <h4>With Redux Integration:</h4>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPaymentHistory } from '../store/slices/paymentsSlice';
import PurchaseHistory from '../components/student/PurchaseHistory';

const ProfilePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  return (
    <div>
      <h1>User Profile</h1>
      <PurchaseHistory />
    </div>
  );
};`}
              </pre>

              <h4>Component Props:</h4>
              <p>The component automatically fetches data from Redux store and doesn't require props.</p>
              
              <h4>Redux Store Requirements:</h4>
              <ul>
                <li>payments slice with paymentHistory, loading, pagination, and filters</li>
                <li>fetchPaymentHistory async thunk</li>
                <li>setFilters and resetFilters actions</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistoryDemo;
