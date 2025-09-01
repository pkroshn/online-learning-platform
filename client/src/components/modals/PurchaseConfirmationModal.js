import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  CheckCircleIcon, 
  AcademicCapIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const PurchaseConfirmationModal = ({ 
  isOpen, 
  onClose, 
  purchaseData = null,
  loading = false,
  error = null,
  onViewCourse,
  onViewMyCourses,
  onBrowseMore
}) => {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-yellow-600" />;
      case 'failed':
        return <XMarkIcon className="w-6 h-6 text-red-600" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'succeeded':
        return 'Payment Successful';
      case 'pending':
        return 'Payment Processing';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Payment Status Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="relative px-6 py-4 border-b border-gray-200">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner size="lg" text="Processing payment..." />
                    </div>
                  ) : error ? (
                    <div className="text-center py-6">
                      <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <XMarkIcon className="w-6 h-6 text-red-600" />
                      </div>
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-2">
                        Payment Error
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mb-4">
                        {error}
                      </p>
                      <button
                        onClick={onClose}
                        className="btn-primary"
                      >
                        Close
                      </button>
                    </div>
                  ) : purchaseData ? (
                    <>
                      {/* Success Icon and Status */}
                      <div className="text-center mb-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                          {getStatusIcon(purchaseData.status)}
                        </div>
                        <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900 mb-2">
                          {getStatusText(purchaseData.status)}
                        </Dialog.Title>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(purchaseData.status)}`}>
                          {purchaseData.status.toUpperCase()}
                        </div>
                      </div>

                      {/* Course Details */}
                      {purchaseData.course && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center mb-3">
                            <AcademicCapIcon className="w-5 h-5 text-primary-600 mr-2" />
                            <h4 className="font-medium text-gray-900">
                              {purchaseData.course.title}
                            </h4>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Course ID: {purchaseData.course.id}</p>
                            {purchaseData.course.instructor && (
                              <p>Instructor: {purchaseData.course.instructor}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Payment Details */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <CurrencyDollarIcon className="w-5 h-5 text-blue-600 mr-2" />
                          Payment Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(purchaseData.amount, purchaseData.currency)}
                            </span>
                          </div>
                          {purchaseData.paymentId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment ID:</span>
                              <span className="font-medium text-gray-900">
                                {purchaseData.paymentId}
                              </span>
                            </div>
                          )}
                          {purchaseData.paidAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium text-gray-900">
                                {formatDate(purchaseData.paidAt)}
                              </span>
                            </div>
                          )}
                          {purchaseData.paymentMethod && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Method:</span>
                              <span className="font-medium text-gray-900 capitalize">
                                {purchaseData.paymentMethod}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {purchaseData.status === 'succeeded' && purchaseData.courseId && onViewCourse && (
                          <button
                            onClick={() => onViewCourse(purchaseData.courseId)}
                            className="btn-primary w-full flex items-center justify-center"
                          >
                            <AcademicCapIcon className="w-5 h-5 mr-2" />
                            Start Learning
                            <ArrowRightIcon className="w-5 h-5 ml-2" />
                          </button>
                        )}
                        
                        {onViewMyCourses && (
                          <button
                            onClick={onViewMyCourses}
                            className="btn-secondary w-full"
                          >
                            View My Courses
                          </button>
                        )}
                        
                        {onBrowseMore && (
                          <button
                            onClick={onBrowseMore}
                            className="text-primary-600 hover:text-primary-700 font-medium w-full"
                          >
                            Browse More Courses
                          </button>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          {purchaseData.status === 'succeeded' ? (
                            "A confirmation email has been sent to your registered email address. If you have any questions, please contact our support team."
                          ) : (
                            "Please wait while we process your payment. You will receive a confirmation email once the payment is completed."
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No purchase data available</p>
                      <button
                        onClick={onClose}
                        className="btn-primary mt-4"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PurchaseConfirmationModal;
