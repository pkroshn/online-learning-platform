import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import EnrollmentForm from '../forms/EnrollmentForm';

const EnrollmentModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  enrollment = null, 
  loading = false,
  mode = 'create', // 'create', 'edit', 'view'
  users = [],
  courses = []
}) => {
  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Create New Enrollment';
      case 'edit': return 'Edit Enrollment';
      case 'view': return 'Enrollment Details';
      default: return 'Enrollment';
    }
  };

  const handleSubmit = (data) => {
    if (mode === 'edit' && enrollment) {
      onSubmit(enrollment.id, data);
    } else if (mode === 'create') {
      onSubmit(data);
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {getTitle()}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                  {mode === 'view' ? (
                    <EnrollmentViewContent enrollment={enrollment} users={users} courses={courses} />
                  ) : (
                    <EnrollmentForm
                      enrollment={enrollment}
                      onSubmit={handleSubmit}
                      onCancel={onClose}
                      loading={loading}
                      mode={mode}
                      users={users}
                      courses={courses}
                    />
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

// Enrollment View Component
const EnrollmentViewContent = ({ enrollment, users = [], courses = [] }) => {
  if (!enrollment) return <div>Enrollment not found</div>;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'badge-primary';
      case 'completed': return 'badge-success';
      case 'dropped': return 'badge-danger';
      case 'suspended': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Find related user and course
  const student = users.find(user => user.id === enrollment.userId);
  const course = courses.find(course => course.id === enrollment.courseId);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Enrollment Details
            </h2>
            <div className="flex items-center space-x-3">
              <span className={`badge ${getStatusBadgeClass(enrollment.status)}`}>
                {enrollment.status?.charAt(0).toUpperCase() + enrollment.status?.slice(1)}
              </span>
              <span className="text-gray-500">ID: {enrollment.id}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{enrollment.progress}%</div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(enrollment.progress)}`}
            style={{ width: `${enrollment.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Student and Course Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Info */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
          {student ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Name:</span>
                <p className="font-medium">{student.firstName} {student.lastName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium">{student.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Role:</span>
                <p className="font-medium capitalize">{student.role}</p>
              </div>
              {student.phone && (
                <div>
                  <span className="text-sm text-gray-600">Phone:</span>
                  <p className="font-medium">{student.phone}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">Student information not available</p>
          )}
        </div>

        {/* Course Info */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
          {course ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Title:</span>
                <p className="font-medium">{course.title}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Instructor:</span>
                <p className="font-medium">{course.instructor}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Category:</span>
                <p className="font-medium">{course.category}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Level:</span>
                <p className="font-medium capitalize">{course.level}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Duration:</span>
                <p className="font-medium">{course.duration} hours</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Price:</span>
                <p className="font-medium">${course.price}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">Course information not available</p>
          )}
        </div>
      </div>

      {/* Enrollment Timeline */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="font-medium">Enrollment Date</p>
              <p className="text-sm text-gray-600">{formatDate(enrollment.enrollmentDate)}</p>
            </div>
          </div>
          
          {enrollment.completionDate && (
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Completion Date</p>
                <p className="text-sm text-gray-600">{formatDate(enrollment.completionDate)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-3 h-3 bg-gray-400 rounded-full"></div>
            <div>
              <p className="font-medium">Last Updated</p>
              <p className="text-sm text-gray-600">{formatDate(enrollment.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {enrollment.notes && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <p className="text-gray-700 leading-relaxed">{enrollment.notes}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {enrollment.progress}%
          </div>
          <div className="text-sm text-gray-600">Progress</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {enrollment.status === 'completed' ? '✓' : 
             enrollment.status === 'active' ? '▶' : 
             enrollment.status === 'dropped' ? '✗' : '⏸'}
          </div>
          <div className="text-sm text-gray-600">Status</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {enrollment.completionDate ? 
              Math.ceil((new Date(enrollment.completionDate) - new Date(enrollment.enrollmentDate)) / (1000 * 60 * 60 * 24)) 
              : Math.ceil((new Date() - new Date(enrollment.enrollmentDate)) / (1000 * 60 * 60 * 24))
            }
          </div>
          <div className="text-sm text-gray-600">Days</div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;