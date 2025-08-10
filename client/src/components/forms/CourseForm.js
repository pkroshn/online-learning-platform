import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { 
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  TagIcon,
  CalendarIcon,
  DocumentTextIcon,
  ListBulletIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';
import { selectAvailableCurrencies, selectDefaultCurrency } from '../../store/slices/settingsSlice';
import { selectInstructors, selectInstructorsLoading, fetchInstructors } from '../../store/slices/usersSlice';

const CourseForm = ({ 
  course = null, 
  onSubmit, 
  onCancel,
  loading = false,
  mode = 'create' // 'create' or 'edit'
}) => {
  const dispatch = useDispatch();
  const availableCurrencies = useSelector(selectAvailableCurrencies);
  const defaultCurrency = useSelector(selectDefaultCurrency);
  const instructors = useSelector(selectInstructors);
  const instructorsLoading = useSelector(selectInstructorsLoading);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      shortDescription: '',
      instructorId: '',
      duration: '',
      level: 'beginner',
      category: '',
      price: '',
      currency: defaultCurrency,
      maxStudents: '',
      prerequisites: '',
      startDate: '',
      endDate: '',
      learningOutcomes: '',
      syllabus: '',
      isActive: true
    }
  });

  // Fetch instructors when component mounts
  useEffect(() => {
    dispatch(fetchInstructors());
  }, [dispatch]);

  // Populate form when editing
  useEffect(() => {
    if (course && mode === 'edit') {
      reset({
        title: course.title || '',
        description: course.description || '',
        shortDescription: course.shortDescription || '',
        instructorId: course.instructorId || course.instructor || '',
        duration: course.duration || '',
        level: course.level || 'beginner',
        category: course.category || '',
        price: course.price || '',
        currency: course.currency || defaultCurrency,
        maxStudents: course.maxStudents || '',
        prerequisites: course.prerequisites || '',
        startDate: course.startDate ? course.startDate.split('T')[0] : '',
        endDate: course.endDate ? course.endDate.split('T')[0] : '',
        learningOutcomes: Array.isArray(course.learningOutcomes) 
          ? course.learningOutcomes.join('\n') 
          : course.learningOutcomes || '',
        syllabus: Array.isArray(course.syllabus) 
          ? course.syllabus.join('\n') 
          : course.syllabus || '',
        isActive: course.isActive !== false
      });
    }
  }, [course, mode, reset]);

  const onFormSubmit = (data) => {
    // Process form data
    const processedData = {
      ...data,
      duration: parseInt(data.duration),
      price: parseFloat(data.price) || 0,
      maxStudents: data.maxStudents ? parseInt(data.maxStudents) : null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      learningOutcomes: data.learningOutcomes 
        ? data.learningOutcomes.split('\n').filter(item => item.trim()) 
        : [],
      syllabus: data.syllabus 
        ? data.syllabus.split('\n').filter(item => item.trim()) 
        : []
    };

    onSubmit(processedData);
  };

  const categories = [
    'Programming',
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Design',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Language',
    'Other'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <AcademicCapIcon className="h-5 w-5 mr-2" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Course Title *
            </label>
            <input
              type="text"
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Enter course title"
              {...register('title', {
                required: 'Course title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                maxLength: { value: 200, message: 'Title must not exceed 200 characters' }
              })}
            />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">
              <UserIcon className="h-4 w-4 mr-2" />
              Instructor *
            </label>
            <select
              className={`input ${errors.instructorId ? 'input-error' : ''}`}
              {...register('instructorId', {
                required: 'Please select an instructor'
              })}
              disabled={instructorsLoading}
            >
              <option value="">
                {instructorsLoading ? 'Loading instructors...' : 'Select an instructor...'}
              </option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.label} ({instructor.role})
                </option>
              ))}
            </select>
            {errors.instructorId && <p className="form-error">{errors.instructorId.message}</p>}
            {instructorsLoading && (
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Loading instructors...</span>
              </div>
            )}
          </div>

          <div>
            <label className="label">
              <TagIcon className="h-4 w-4 mr-2" />
              Category *
            </label>
            <select
              className={`input ${errors.category ? 'input-error' : ''}`}
              {...register('category', { required: 'Category is required' })}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="form-error">{errors.category.message}</p>}
          </div>

          <div>
            <label className="label">
              <ClockIcon className="h-4 w-4 mr-2" />
              Duration (hours) *
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              className={`input ${errors.duration ? 'input-error' : ''}`}
              placeholder="Course duration"
              {...register('duration', {
                required: 'Duration is required',
                min: { value: 1, message: 'Duration must be at least 1 hour' },
                max: { value: 1000, message: 'Duration must not exceed 1000 hours' }
              })}
            />
            {errors.duration && <p className="form-error">{errors.duration.message}</p>}
          </div>

          <div>
            <label className="label">Level *</label>
            <select
              className={`input ${errors.level ? 'input-error' : ''}`}
              {...register('level', { required: 'Level is required' })}
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            {errors.level && <p className="form-error">{errors.level.message}</p>}
          </div>
        </div>
      </div>

      {/* Pricing and Capacity */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 mr-2" />
          Pricing & Capacity
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              Price *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`input ${errors.price ? 'input-error' : ''}`}
              placeholder="0.00"
              {...register('price', {
                required: 'Price is required',
                min: { value: 0, message: 'Price must be 0 or greater' }
              })}
            />
            {errors.price && <p className="form-error">{errors.price.message}</p>}
          </div>

          <div>
            <label className="label">Currency *</label>
            <select
              className={`input ${errors.currency ? 'input-error' : ''}`}
              {...register('currency', {
                required: 'Please select a currency'
              })}
            >
              {availableCurrencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.symbol} {currency.label} ({currency.value})
                </option>
              ))}
            </select>
            {errors.currency && <p className="form-error">{errors.currency.message}</p>}
          </div>

          <div>
            <label className="label">Maximum Students (Optional)</label>
            <input
              type="number"
              min="1"
              className={`input ${errors.maxStudents ? 'input-error' : ''}`}
              placeholder="Unlimited"
              {...register('maxStudents', {
                min: { value: 1, message: 'Must be at least 1 student' }
              })}
            />
            {errors.maxStudents && <p className="form-error">{errors.maxStudents.message}</p>}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Schedule (Optional)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              className={`input ${errors.startDate ? 'input-error' : ''}`}
              {...register('startDate')}
            />
            {errors.startDate && <p className="form-error">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              className={`input ${errors.endDate ? 'input-error' : ''}`}
              {...register('endDate', {
                validate: (value) => {
                  const startDate = watch('startDate');
                  if (startDate && value && new Date(value) <= new Date(startDate)) {
                    return 'End date must be after start date';
                  }
                  return true;
                }
              })}
            />
            {errors.endDate && <p className="form-error">{errors.endDate.message}</p>}
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="space-y-4">
        <div>
          <label className="label">Short Description</label>
          <textarea
            rows={2}
            className={`input ${errors.shortDescription ? 'input-error' : ''}`}
            placeholder="Brief course description (max 500 characters)"
            {...register('shortDescription', {
              maxLength: { value: 500, message: 'Short description must not exceed 500 characters' }
            })}
          />
          {errors.shortDescription && <p className="form-error">{errors.shortDescription.message}</p>}
        </div>

        <div>
          <label className="label">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Detailed Description *
          </label>
          <textarea
            rows={5}
            className={`input ${errors.description ? 'input-error' : ''}`}
            placeholder="Detailed course description"
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' },
              maxLength: { value: 5000, message: 'Description must not exceed 5000 characters' }
            })}
          />
          {errors.description && <p className="form-error">{errors.description.message}</p>}
        </div>

        <div>
          <label className="label">Prerequisites</label>
          <textarea
            rows={3}
            className={`input ${errors.prerequisites ? 'input-error' : ''}`}
            placeholder="Course prerequisites and requirements"
            {...register('prerequisites')}
          />
          {errors.prerequisites && <p className="form-error">{errors.prerequisites.message}</p>}
        </div>
      </div>

      {/* Learning Outcomes */}
      <div>
        <label className="label">
          <LightBulbIcon className="h-4 w-4 mr-2" />
          Learning Outcomes
        </label>
        <textarea
          rows={4}
          className={`input ${errors.learningOutcomes ? 'input-error' : ''}`}
          placeholder="Enter each learning outcome on a new line"
          {...register('learningOutcomes')}
        />
        <p className="text-xs text-gray-500 mt-1">Enter each outcome on a separate line</p>
        {errors.learningOutcomes && <p className="form-error">{errors.learningOutcomes.message}</p>}
      </div>

      {/* Syllabus */}
      <div>
        <label className="label">
          <ListBulletIcon className="h-4 w-4 mr-2" />
          Course Syllabus
        </label>
        <textarea
          rows={6}
          className={`input ${errors.syllabus ? 'input-error' : ''}`}
          placeholder="Enter each topic/module on a new line"
          {...register('syllabus')}
        />
        <p className="text-xs text-gray-500 mt-1">Enter each topic or module on a separate line</p>
        {errors.syllabus && <p className="form-error">{errors.syllabus.message}</p>}
      </div>

      {/* Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          {...register('isActive')}
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Course is active and available for enrollment
        </label>
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
            mode === 'create' ? 'Create Course' : 'Update Course'
          )}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;