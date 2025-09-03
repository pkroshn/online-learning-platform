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
import LoadingSpinner from '../common/LoadingSpinner';
import PurchaseConfirmationModal from '../modals/PurchaseConfirmationModal';
import usePurchaseConfirmation from '../../hooks/usePurchaseConfirmation';

const CourseDetailWithModal = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const course = useSelector(selectCurrentCourse);
  const coursesLoading = useSelector(selectCoursesLoading);
  const enrollmentLoading = useSelector(selectEnrollmentsLoading);
  const [buyLoading, setBuyLoading] = useState(false);
  
  // Use the purchase confirmation hook
  const {
    modalState,
    showSuccess,
    showPending,
    showFailed,
    showLoading,
    showError,
    handleViewCourse,
    handleViewMyCourses,
    handleBrowseMore
  } = usePurchaseConfirmation();

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
    showLoading(); // Show loading modal
    
    try {
      const response = await paymentAPI.createCheckoutSession(course.id);
      if (response.data.success && response.data.data.sessionUrl) {
        // Check if this is an existing payment session
        if (response.data.data.message && response.data.data.message.includes('already exists')) {
          // For demo purposes, show a message about existing payment
          showError('You have a payment in progress for this course. Please complete your existing payment or cancel it to start a new one.');
        } else {
          // For demo purposes, we'll show a success modal instead of redirecting
          // In a real implementation, you would redirect to Stripe checkout
          // window.location.href = response.data.data.sessionUrl;
          
          // Simulate successful payment data
          const purchaseData = {
            status: 'succeeded',
            amount: course.price,
            currency: 'USD',
            paymentId: `PAY-${Date.now()}`,
            paidAt: new Date().toISOString(),
            paymentMethod: 'card',
            courseId: course.id,
            course: {
              id: course.id,
              title: course.title,
              instructor: course.instructor || 'Course Instructor'
            }
          };
          
          showSuccess(purchaseData);
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      showError('Failed to process payment. Please try again.');
    } finally {
      setBuyLoading(false);
    }
  };

  // Demo function to show different modal states
  const showDemoModal = (type) => {
    const demoData = {
      status: type,
      amount: course?.price || 99.99,
      currency: 'USD',
      paymentId: `PAY-DEMO-${Date.now()}`,
      paidAt: new Date().toISOString(),
      paymentMethod: 'card',
      courseId: course?.id || 1,
      course: {
        id: course?.id || 1,
        title: course?.title || 'Demo Course',
        instructor: course?.instructor || 'Demo Instructor'
      }
    };

    switch (type) {
      case 'succeeded':
        showSuccess(demoData);
        break;
      case 'pending':
        showPending(demoData);
        break;
      case 'failed':
        showFailed(demoData);
        break;
      default:
        showSuccess(demoData);
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
          
          <div className="flex items-center space-x-6 text-gray-600 mb-6">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              <span>{course.instructor || 'Course Instructor'}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span>{course.duration || '8 weeks'}</span>
            </div>
            <div className="flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              <span>{course.level}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {course.isEnrolled ? (
                <span className="flex items-center text-green-600 font-medium">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Enrolled
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

      {/* Demo Modal Buttons */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Purchase Confirmation Modal</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => showDemoModal('succeeded')}
            className="btn-success"
          >
            Show Success Modal
          </button>
          <button
            onClick={() => showDemoModal('pending')}
            className="btn-secondary"
          >
            Show Pending Modal
          </button>
          <button
            onClick={() => showDemoModal('failed')}
            className="btn-danger"
          >
            Show Failed Modal
          </button>
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

      {/* Purchase Confirmation Modal */}
      <PurchaseConfirmationModal
        isOpen={modalState.isOpen}
        onClose={modalState.closeModal}
        purchaseData={modalState.purchaseData}
        loading={modalState.loading}
        error={modalState.error}
        onViewCourse={handleViewCourse}
        onViewMyCourses={handleViewMyCourses}
        onBrowseMore={handleBrowseMore}
      />
    </div>
  );
};

export default CourseDetailWithModal;
