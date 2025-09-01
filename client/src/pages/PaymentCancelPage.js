import React from 'react';
import { Link } from 'react-router-dom';
import { XCircleIcon, ArrowLeftIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const PaymentCancelPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Cancel Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircleIcon className="w-8 h-8 text-red-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <CreditCardIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-medium text-blue-900 mb-1">What happened?</h3>
              <p className="text-sm text-blue-700">
                You cancelled the payment process before it was completed. 
                Your course enrollment has not been processed.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/courses"
            className="btn-primary w-full flex items-center justify-center"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Courses
          </Link>
          
          <Link
            to="/my-courses"
            className="btn-secondary w-full"
          >
            View My Courses
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If you experienced any issues during payment, please contact our support team.
            We're here to help!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
