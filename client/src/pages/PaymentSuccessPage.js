import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircleIcon, AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { paymentAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await paymentAPI.getPaymentStatus(sessionId);
        if (response.data.success) {
          setPaymentData(response.data.data);
        } else {
          setError('Failed to fetch payment details');
        }
      } catch (error) {
        console.error('Error fetching payment status:', error);
        setError('Failed to verify payment status');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verifying payment..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. You are now enrolled in the course.
        </p>

        {/* Course Details */}
        {paymentData?.payment?.course && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-3">
              <AcademicCapIcon className="w-6 h-6 text-primary-600 mr-2" />
              <h3 className="font-semibold text-gray-900">
                {paymentData.payment.course.title}
              </h3>
            </div>
            <div className="text-sm text-gray-600">
              <p>Amount: ${paymentData.payment.amount}</p>
              <p>Payment ID: {paymentData.payment.id}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/courses/${paymentData?.payment?.courseId}`}
            className="btn-primary w-full flex items-center justify-center"
          >
            <AcademicCapIcon className="w-5 h-5 mr-2" />
            Start Learning
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
          
          <Link
            to="/my-courses"
            className="btn-secondary w-full"
          >
            View My Courses
          </Link>
          
          <Link
            to="/courses"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Browse More Courses
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            A confirmation email has been sent to your registered email address.
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
