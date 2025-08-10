import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  AcademicCapIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const EnrollmentForm = ({ 
  enrollment = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  mode = 'create', // 'create' or 'edit'
  users = [],
  courses = []
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      userId: '',
      courseId: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      progress: 0,
      completionDate: '',
      notes: ''
    }
  });

  // Populate form when editing
  useEffect(() => {
    if (enrollment && mode === 'edit') {
      reset({
        userId: enrollment.userId || '',
        courseId: enrollment.courseId || '',
        enrollmentDate: enrollment.enrollmentDate ? enrollment.enrollmentDate.split('T')[0] : '',
        status: enrollment.status || 'active',
        progress: enrollment.progress || 0,
        completionDate: enrollment.completionDate ? enrollment.completionDate.split('T')[0] : '',
        notes: enrollment.notes || ''
      });
    }
  }, [enrollment, mode, reset]);

  const onFormSubmit = (data) => {
    // Process form data
    const processedData = {
      ...data,
      progress: parseInt(data.progress) || 0,
      enrollmentDate: data.enrollmentDate || null,
      completionDate: data.completionDate || null
    };

    onSubmit(processedData);
  };

  const statuses = [
    { value: 'active', label: 'Active', description: 'Student is currently enrolled' },
    { value: 'completed', label: 'Completed', description: 'Course has been completed' },
    { value: 'dropped', label: 'Dropped', description: 'Student dropped the course' },
    { value: 'suspended', label: 'Suspended', description: 'Enrollment is temporarily suspended' }
  ];

  const watchedStatus = watch('status');
  const watchedProgress = watch('progress');

  // Auto-set completion date when status is completed
  useEffect(() => {
    if (watchedStatus === 'completed' && !watch('completionDate')) {
      setValue('completionDate', new Date().toISOString().split('T')[0]);
    } else if (watchedStatus !== 'completed') {
      setValue('completionDate', '');
    }
  }, [watchedStatus, setValue, watch]);

  // Auto-set progress to 100 when status is completed
  useEffect(() => {
    if (watchedStatus === 'completed' && watchedProgress < 100) {
      setValue('progress', 100);
    }
  }, [watchedStatus, watchedProgress, setValue]);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Student and Course Selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <AcademicCapIcon className="h-5 w-5 mr-2" />
          Enrollment Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <UserIcon className="h-4 w-4 mr-2" />
              Student *
            </label>
            <select
              className={`input ${errors.userId ? 'input-error' : ''}`}
              {...register('userId', { required: 'Student is required' })}
              disabled={mode === 'edit'} // Don't allow changing student in edit mode
            >
              <option value="">Select a student</option>
              {users.filter(user => user.role === 'student').map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {errors.userId && <p className="form-error">{errors.userId.message}</p>}
          </div>

          <div>
            <label className="label">
              <AcademicCapIcon className="h-4 w-4 mr-2" />
              Course *
            </label>
            <select
              className={`input ${errors.courseId ? 'input-error' : ''}`}
              {...register('courseId', { required: 'Course is required' })}
              disabled={mode === 'edit'} // Don't allow changing course in edit mode
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} - {course.instructor} (${course.price})
                </option>
              ))}
            </select>
            {errors.courseId && <p className="form-error">{errors.courseId.message}</p>}
          </div>
        </div>
      </div>

      {/* Enrollment Status and Progress */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Status & Progress
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Status *
            </label>
            <select
              className={`input ${errors.status ? 'input-error' : ''}`}
              {...register('status', { required: 'Status is required' })}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label} - {status.description}
                </option>
              ))}
            </select>
            {errors.status && <p className="form-error">{errors.status.message}</p>}
          </div>

          <div>
            <label className="label">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Progress (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className={`input ${errors.progress ? 'input-error' : ''}`}
              placeholder="0"
              {...register('progress', {
                required: 'Progress is required',
                min: { value: 0, message: 'Progress must be 0 or greater' },
                max: { value: 100, message: 'Progress cannot exceed 100%' }
              })}
            />
            {errors.progress && <p className="form-error">{errors.progress.message}</p>}
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, watchedProgress || 0))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Important Dates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Enrollment Date *
            </label>
            <input
              type="date"
              className={`input ${errors.enrollmentDate ? 'input-error' : ''}`}
              {...register('enrollmentDate', {
                required: 'Enrollment date is required'
              })}
            />
            {errors.enrollmentDate && <p className="form-error">{errors.enrollmentDate.message}</p>}
          </div>

          <div>
            <label className="label">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Completion Date
            </label>
            <input
              type="date"
              className={`input ${errors.completionDate ? 'input-error' : ''}`}
              disabled={watchedStatus !== 'completed'}
              {...register('completionDate', {
                validate: (value) => {
                  const enrollmentDate = watch('enrollmentDate');
                  if (value && enrollmentDate && new Date(value) < new Date(enrollmentDate)) {
                    return 'Completion date must be after enrollment date';
                  }
                  if (watchedStatus === 'completed' && !value) {
                    return 'Completion date is required when status is completed';
                  }
                  return true;
                }
              })}
            />
            {errors.completionDate && <p className="form-error">{errors.completionDate.message}</p>}
            {watchedStatus !== 'completed' && (
              <p className="text-xs text-gray-500 mt-1">
                Available only when status is "Completed"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">
          <ClockIcon className="h-4 w-4 mr-2" />
          Notes (Optional)
        </label>
        <textarea
          rows={4}
          className={`input ${errors.notes ? 'input-error' : ''}`}
          placeholder="Add any additional notes about this enrollment..."
          {...register('notes', {
            maxLength: { value: 1000, message: 'Notes must not exceed 1000 characters' }
          })}
        />
        {errors.notes && <p className="form-error">{errors.notes.message}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            mode === 'create' ? 'Create Enrollment' : 'Update Enrollment'
          )}
        </button>
      </div>
    </form>
  );
};

export default EnrollmentForm;