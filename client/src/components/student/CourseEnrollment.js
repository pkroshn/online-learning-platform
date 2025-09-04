import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { enrollInCourse } from '../../store/slices/enrollmentsSlice';
import { selectUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const CourseEnrollment = ({ course, enrollments = [], onEnrollmentUpdate }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);

  // Check if user is already enrolled in this course
  const existingEnrollment = enrollments.find(
    enrollment => enrollment.courseId === course.id && enrollment.userId === user?.id
  );

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll in courses');
      return;
    }

    setLoading(true);
    try {
      await dispatch(enrollInCourse(course.id)).unwrap();
      toast.success(`Successfully enrolled in ${course.title}!`);
      if (onEnrollmentUpdate) {
        onEnrollmentUpdate();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  const getEnrollmentStatus = () => {
    if (!existingEnrollment) return null;
    
    switch (existingEnrollment.status) {
      case 'active':
        return {
          icon: CheckCircleIcon,
          text: 'Enrolled',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'completed':
        return {
          icon: CheckCircleIcon,
          text: 'Completed',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'dropped':
        return {
          icon: XCircleIcon,
          text: 'Dropped',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'suspended':
        return {
          icon: XCircleIcon,
          text: 'Suspended',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      default:
        return null;
    }
  };

  const enrollmentStatus = getEnrollmentStatus();

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'beginner': return 'level-beginner';
      case 'intermediate': return 'level-intermediate';
      case 'advanced': return 'level-advanced';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-lg transition-shadow">
      {/* Course Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
        <AcademicCapIcon className="h-16 w-16 text-white opacity-80" />
      </div>

      <div className="p-6">
        {/* Course Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {course.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`badge ${getLevelBadgeClass(course.level)}`}>
                {course.level}
              </span>
              <span className="badge badge-secondary">{course.category}</span>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-primary-600">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <UserIcon className="h-4 w-4 mr-2" />
            <span>{course.instructor}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>{course.duration} hours</span>
          </div>
        </div>

        {/* Course Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {course.shortDescription || course.description}
        </p>

        {/* Enrollment Status or Action */}
        <div className="flex items-center justify-between">
          {enrollmentStatus ? (
            <div className={`flex items-center px-3 py-2 rounded-lg border ${enrollmentStatus.bgColor} ${enrollmentStatus.borderColor}`}>
              <enrollmentStatus.icon className={`h-5 w-5 mr-2 ${enrollmentStatus.color}`} />
              <span className={`font-medium ${enrollmentStatus.color}`}>
                {enrollmentStatus.text}
              </span>
              {existingEnrollment.progress !== undefined && (
                <span className={`ml-2 text-sm ${enrollmentStatus.color}`}>
                  ({existingEnrollment.progress}%)
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Enrolling...
                </>
              ) : (
                <>
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Enroll Now
                </>
              )}
            </button>
          )}
        </div>

        {/* Progress Bar for Active Enrollments */}
        {existingEnrollment && existingEnrollment.status === 'active' && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{existingEnrollment.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${existingEnrollment.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEnrollment;