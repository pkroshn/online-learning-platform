import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  AcademicCapIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { fetchCourseById, selectCurrentCourse, selectCoursesLoading } from '../../store/slices/coursesSlice';
import { enrollInCourse, selectEnrollmentsLoading } from '../../store/slices/enrollmentsSlice';
import { paymentAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CourseDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const course = useSelector(selectCurrentCourse);
  const coursesLoading = useSelector(selectCoursesLoading);
  const enrollmentLoading = useSelector(selectEnrollmentsLoading);
  const [buyLoading, setBuyLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
    }
  }, [dispatch, id]);

  const handleEnroll = () => {
    dispatch(enrollInCourse(id));
  };

  const handleBuyCourse = async () => {
    if (!course || course.price <= 0) return;
    
    setBuyLoading(true);
    try {
      const response = await paymentAPI.createCheckoutSession(course.id);
      if (response.data.success && response.data.data.sessionUrl) {
        // Check if this is an existing payment session
        if (response.data.data.message && response.data.data.message.includes('already exists')) {
          // Show confirmation dialog for existing payment
          const shouldContinue = window.confirm(
            'You have a payment in progress for this course. Would you like to continue with your existing payment?'
          );
          
          if (shouldContinue) {
            // Redirect to existing Stripe checkout session
            window.location.href = response.data.data.sessionUrl;
          } else {
            // User wants to cancel existing payment and start fresh
            try {
              await paymentAPI.cancelPendingPayment(course.id);
              // Retry creating a new checkout session
              const newResponse = await paymentAPI.createCheckoutSession(course.id);
              if (newResponse.data.success && newResponse.data.data.sessionUrl) {
                window.location.href = newResponse.data.data.sessionUrl;
              }
            } catch (cancelError) {
              console.error('Error canceling pending payment:', cancelError);
              alert('Failed to cancel existing payment. Please try again.');
            }
          }
        } else {
          // New payment session - redirect to Stripe checkout
          window.location.href = response.data.data.sessionUrl;
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Error handling is done by the API interceptor
    } finally {
      setBuyLoading(false);
    }
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'beginner': return 'level-beginner';
      case 'intermediate': return 'level-intermediate';
      case 'advanced': return 'level-advanced';
      default: return 'badge-secondary';
    }
  };

  if (coursesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading course details..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
        <p className="text-gray-600">The course you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <AcademicCapIcon className="h-24 w-24 text-white opacity-80" />
        </div>
        
        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className={`badge ${getLevelBadgeClass(course.level)}`}>
                {course.level}
              </span>
              <span className="badge badge-secondary">{course.category}</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">${course.price}</div>
              {course.price > 0 && <div className="text-sm text-gray-600">One-time payment</div>}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <UserIcon className="h-5 w-5 mr-2" />
              <span>{course.instructor}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span>{course.duration} hours</span>
            </div>
            <div className="flex items-center text-gray-600">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              <span>{course.enrollmentCount || 0} students</span>
            </div>
          </div>

          {/* Enrollment/Purchase Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {course.isEnrolled ? (
                <span className="flex items-center text-green-600 font-medium">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Already Enrolled
                </span>
              ) : course.price > 0 ? (
                // Paid course - show Buy Course button
                <button
                  onClick={handleBuyCourse}
                  disabled={buyLoading}
                  className="btn-primary btn-lg flex items-center"
                >
                  {buyLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="h-5 w-5 mr-2" />
                      Buy Course - ${course.price}
                    </>
                  )}
                </button>
              ) : (
                // Free course - show Enroll Now button
                <button
                  onClick={handleEnroll}
                  disabled={enrollmentLoading}
                  className="btn-primary btn-lg"
                >
                  {enrollmentLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Now - Free'
                  )}
                </button>
              )}
            </div>
            
            {course.maxStudents && (
              <div className="text-sm text-gray-600">
                {course.availableSlots} of {course.maxStudents} spots available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Description */}
      <div className="bg-white rounded-xl shadow-soft p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Course</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{course.description}</p>
        </div>
      </div>

      {/* Prerequisites */}
      {course.prerequisites && (
        <div className="bg-white rounded-xl shadow-soft p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prerequisites</h2>
          <p className="text-gray-700">{course.prerequisites}</p>
        </div>
      )}

      {/* Learning Outcomes */}
      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What You'll Learn</h2>
          <ul className="space-y-2">
            {course.learningOutcomes.map((outcome, index) => (
              <li key={index} className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Syllabus */}
      {course.syllabus && course.syllabus.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Course Syllabus</h2>
          <div className="space-y-3">
            {course.syllabus.map((item, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="bg-primary-100 text-primary-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;