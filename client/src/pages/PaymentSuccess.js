import React from 'react';
import { CheckCircle, Download, ArrowRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  
  // Get payment details from location state (passed from PaymentForm)
  const paymentDetails = location.state || {
    courseTitle: 'Advanced React Development',
    amount: 299.00,
    email: 'user@example.com',
    transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9),
    paymentDate: new Date().toLocaleDateString()
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon and Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. You now have access to your course.
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Download className="w-5 h-5 mr-2 text-blue-600" />
            Payment Details
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Course:</span>
              <span className="font-semibold text-gray-900">{paymentDetails.courseTitle}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold text-green-600">${paymentDetails.amount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm text-gray-900">{paymentDetails.transactionId}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Payment Date:</span>
              <span className="text-gray-900">{paymentDetails.paymentDate}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-900">{paymentDetails.email}</span>
            </div>
          </div>

          {/* Confirmation Email Notice */}
          <div className="bg-blue-50 rounded-lg p-4 mt-6">
            <div className="flex items-start">
              <div className="w-5 h-5 text-blue-600 mt-0.5 mr-3">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Confirmation Email Sent</h3>
                <p className="text-sm text-blue-700 mt-1">
                  A receipt and course access details have been sent to <strong>{paymentDetails.email}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Start Course Button */}
          <Link
            to="/my-courses"
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center group"
          >
            Start Learning Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/courses"
              className="border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center"
            >
              Browse More Courses
            </Link>

            <Link
              to="/dashboard"
              className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help or have questions?
          </p>
          <div className="space-x-4">
            <Link
              to="/support"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Contact Support
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/faq"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;