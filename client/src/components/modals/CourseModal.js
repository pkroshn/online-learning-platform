import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CourseForm from '../forms/CourseForm';

const CourseModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  course = null, 
  loading = false,
  mode = 'create' // 'create', 'edit', 'view'
}) => {
  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Create New Course';
      case 'edit': return 'Edit Course';
      case 'view': return 'Course Details';
      default: return 'Course';
    }
  };

  const handleSubmit = (data) => {
    if (mode === 'edit' && course) {
      onSubmit(course.id, data);
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
                    <CourseViewContent course={course} />
                  ) : (
                    <CourseForm
                      course={course}
                      onSubmit={handleSubmit}
                      onCancel={onClose}
                      loading={loading}
                      mode={mode}
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

// Course View Component
const CourseViewContent = ({ course }) => {
  if (!course) return <div>Course not found</div>;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'beginner': return 'level-beginner';
      case 'intermediate': return 'level-intermediate';
      case 'advanced': return 'level-advanced';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
            <div className="flex items-center space-x-3">
              <span className={`badge ${getLevelBadgeClass(course.level)}`}>
                {course.level}
              </span>
              <span className="badge badge-secondary">{course.category}</span>
              <span className={`badge ${course.isActive ? 'badge-success' : 'badge-danger'}`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">${course.price}</div>
            {course.maxStudents && (
              <div className="text-sm text-gray-600">Max: {course.maxStudents} students</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <span className="text-sm text-gray-600">Instructor</span>
            <p className="font-medium">{course.instructor}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Duration</span>
            <p className="font-medium">{course.duration} hours</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Start Date</span>
            <p className="font-medium">{formatDate(course.startDate)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">End Date</span>
            <p className="font-medium">{formatDate(course.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
        {course.shortDescription && (
          <p className="text-gray-700 mb-3 p-3 bg-gray-50 rounded-lg">
            {course.shortDescription}
          </p>
        )}
        <p className="text-gray-700 leading-relaxed">{course.description}</p>
      </div>

      {/* Prerequisites */}
      {course.prerequisites && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
          <p className="text-gray-700">{course.prerequisites}</p>
        </div>
      )}

      {/* Learning Outcomes */}
      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Outcomes</h3>
          <ul className="space-y-2">
            {course.learningOutcomes.map((outcome, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Syllabus */}
      {course.syllabus && course.syllabus.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Syllabus</h3>
          <div className="space-y-2">
            {course.syllabus.map((item, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mr-3 flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrollment Stats */}
      {course.enrollmentCount !== undefined && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Enrollment Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{course.enrollmentCount}</div>
              <div className="text-sm text-blue-600">Total Enrolled</div>
            </div>
            {course.maxStudents && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{course.availableSlots}</div>
                <div className="text-sm text-green-600">Available Slots</div>
              </div>
            )}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {course.maxStudents ? Math.round((course.enrollmentCount / course.maxStudents) * 100) : 0}%
              </div>
              <div className="text-sm text-purple-600">Capacity Used</div>
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span> {formatDate(course.createdAt)}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {formatDate(course.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;