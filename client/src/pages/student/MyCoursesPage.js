import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { fetchMyEnrollments, selectMyEnrollments, selectEnrollmentsLoading } from '../../store/slices/enrollmentsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyCoursesPage = () => {
  const dispatch = useDispatch();
  const enrollments = useSelector(selectMyEnrollments);
  const loading = useSelector(selectEnrollmentsLoading);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'dropped': return 'status-dropped';
      case 'suspended': return 'status-suspended';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading your courses..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">
          Track your progress and continue learning.
        </p>
      </div>

      {/* Course List */}
      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-4">Start your learning journey by enrolling in courses</p>
          <Link to="/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
              {/* Course Thumbnail */}
              <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <AcademicCapIcon className="h-12 w-12 text-white opacity-80" />
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${getStatusBadgeClass(enrollment.status)}`}>
                    {enrollment.status}
                  </span>
                  <span className="text-sm text-gray-600">
                    {enrollment.progress}% Complete
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {enrollment.course.title}
                </h3>

                {/* Course Meta */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 mr-2" />
                    {enrollment.course.instructor}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {enrollment.course.duration} hours
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Enrollment Info */}
                <div className="text-xs text-gray-500 mb-4">
                  Enrolled on {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  {enrollment.completionDate && (
                    <span> • Completed on {new Date(enrollment.completionDate).toLocaleDateString()}</span>
                  )}
                </div>

                {/* Action Button */}
                <Link
                  to={`/courses/${enrollment.course.id}`}
                  className="btn-primary w-full text-center"
                >
                  {enrollment.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;