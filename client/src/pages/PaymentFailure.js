import React from 'react';
import { XCircle, RefreshCw, CreditCard, ArrowLeft, HelpCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get failure details from location state (passed from PaymentForm)
  const failureDetails = location.state || {
    courseTitle: 'Advanced React Development',
    amount: 299.00,
    errorMessage: 'Your payment could not be processed',
    errorCode: 'PAYMENT_DECLINED',
    transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleString()
  };

  const handleRetryPayment = () => {
    // Navigate back to payment with course details
    navigate('/payment', {
      state: {
        courseTitle: failureDetails.courseTitle,
        amount: failureDetails.amount,
        retry: true
      }
    });
  };

  const getErrorHelp = (errorCode) => {
    const errorHelp = {
      'PAYMENT_DECLINED': {
        title: 'Card Declined',
        suggestions: [
          'Check that your card details are correct',
          'Ensure you have sufficient funds',
          'Try a different payment method',
          'Contact your bank if the issue persists'
        ]
      },
      'CARD_EXPIRED': {
        title: 'Card Expired',
        suggestions: [
          'Check your card expiry date',
          'Use a different card',
          'Contact your bank for a replacement card'
        ]
      },
      'INSUFFICIENT_FUNDS': {
        title: 'Insufficient Funds',
        suggestions: [
          'Check your account balance',
          'Try a different card or payment method',
          'Add funds to your account'
        ]
      },
      'NETWORK_ERROR': {
        title: 'Network Error',
        suggestions: [
          'Check your internet connection',
          'Try again in a few minutes',
          'Contact support if the problem continues'
        ]
      },
      'DEFAULT': {
        title: 'Payment Error',
        suggestions: [
          'Double-check your payment information',
          'Try a different payment method',
          'Contact our support team for assistance'
        ]
      }
    };

    return errorHelp[errorCode] || errorHelp['DEFAULT'];
  };

  const errorInfo = getErrorHelp(failureDetails.errorCode);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Error Icon and Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600">
            We encountered an issue processing your payment. Please try again.
          </p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-red-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-red-600" />
            What went wrong?
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Course:</span>
              <span className="font-semibold text-gray-900">{failureDetails.courseTitle}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-gray-900">${failureDetails.amount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Error:</span>
              <span className="font-semibold text-red-600">{errorInfo.title}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm text-gray-900">{failureDetails.transactionId}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600">Time:</span>
              <span className="text-gray-900">{failureDetails.timestamp}</span>
            </div>
          </div>

          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">
              {failureDetails.errorMessage}
            </p>
            <p className="text-red-700 text-sm">
              Error Code: {failureDetails.errorCode}
            </p>
          </div>
        </div>

        {/* Troubleshooting Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How to fix this:
          </h3>
          
          <ul className="space-y-3">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Retry Payment Button */}
          <button
            onClick={handleRetryPayment}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center group"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Payment Again
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/courses"
              className="border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>

            <Link
              to="/payment-methods"
              className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center flex items-center justify-center"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Methods
            </Link>
          </div>
        </div>

        {/* Alternative Payment Methods */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">
            Alternative Payment Options
          </h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• PayPal - Quick and secure payment</p>
            <p>• Bank Transfer - Direct from your account</p>
            <p>• Digital Wallets - Apple Pay, Google Pay</p>
          </div>
          <Link
            to="/payment-options"
            className="inline-block mt-4 text-blue-700 font-medium hover:text-blue-900 text-sm"
          >
            View all payment options →
          </Link>
        </div>

        {/* Support Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Still having trouble? We're here to help!
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
              to="/payment-help"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Payment Help
            </Link>
            <span className="text-gray-300">•</span>
            <a
              href="tel:+1-800-123-4567"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Call: 1-800-123-4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;