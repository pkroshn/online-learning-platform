import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { 
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  IdentificationIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';
import { selectAvailableRoles } from '../../store/slices/settingsSlice';

const UserForm = ({ 
  user = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  mode = 'create' // 'create' or 'edit'
}) => {
  const availableRoles = useSelector(selectAvailableRoles);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      dateOfBirth: '',
      role: 'student',
      isActive: true,
      address: '',
      city: '',
      country: '',
      profileImage: '',
      bio: '',
      emergencyContact: '',
      emergencyPhone: ''
    }
  });

  // Populate form when editing
  useEffect(() => {
    if (user && mode === 'edit') {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        role: user.role || 'student',
        isActive: user.isActive !== false,
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || '',
        // Don't populate password fields for edit
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, mode, reset]);

  const onFormSubmit = (data) => {
    // Process form data
    const processedData = {
      ...data,
      dateOfBirth: data.dateOfBirth || null
    };

    // Remove password fields if empty (for edit mode)
    if (mode === 'edit' && !data.password) {
      delete processedData.password;
      delete processedData.confirmPassword;
    }

    onSubmit(processedData);
  };

  const roles = [
    { value: 'student', label: 'Student', description: 'Can enroll in courses and access student portal' },
    { value: 'admin', label: 'Admin', description: 'Full access to admin panel and all features' },
    { value: 'instructor', label: 'Instructor', description: 'Can create and manage courses' }
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
    'Japan', 'South Korea', 'India', 'China', 'Brazil', 'Mexico', 'Spain', 'Italy',
    'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Austria',
    'Belgium', 'Ireland', 'New Zealand', 'Singapore', 'Other'
  ];

  const password = watch('password');

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <UserIcon className="h-5 w-5 mr-2" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <IdentificationIcon className="h-4 w-4 mr-2" />
              First Name *
            </label>
            <input
              type="text"
              className={`input ${errors.firstName ? 'input-error' : ''}`}
              placeholder="Enter first name"
              {...register('firstName', {
                required: 'First name is required',
                minLength: { value: 2, message: 'First name must be at least 2 characters' },
                maxLength: { value: 50, message: 'First name must not exceed 50 characters' },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: 'First name can only contain letters and spaces'
                }
              })}
            />
            {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
          </div>

          <div>
            <label className="label">
              <IdentificationIcon className="h-4 w-4 mr-2" />
              Last Name *
            </label>
            <input
              type="text"
              className={`input ${errors.lastName ? 'input-error' : ''}`}
              placeholder="Enter last name"
              {...register('lastName', {
                required: 'Last name is required',
                minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                maxLength: { value: 50, message: 'Last name must not exceed 50 characters' },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: 'Last name can only contain letters and spaces'
                }
              })}
            />
            {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
          </div>

          <div>
            <label className="label">
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="user@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">
              <PhoneIcon className="h-4 w-4 mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              className={`input ${errors.phone ? 'input-error' : ''}`}
              placeholder="+1 (555) 123-4567"
              {...register('phone', {
                pattern: {
                  value: /^[\+]?[1-9][\d]{0,15}$/,
                  message: 'Please enter a valid phone number'
                }
              })}
            />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="label">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              User Role *
            </label>
            <select
              className={`input ${errors.role ? 'input-error' : ''}`}
              {...register('role', {
                required: 'Please select a user role'
              })}
            >
              <option value="">Select a role...</option>
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {errors.role && <p className="form-error">{errors.role.message}</p>}
          </div>

          <div>
            <label className="label">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Date of Birth
            </label>
            <input
              type="date"
              className={`input ${errors.dateOfBirth ? 'input-error' : ''}`}
              max={new Date().toISOString().split('T')[0]}
              {...register('dateOfBirth', {
                validate: (value) => {
                  if (value) {
                    const birthDate = new Date(value);
                    const today = new Date();
                    const age = today.getFullYear() - birthDate.getFullYear();
                    if (age < 13) {
                      return 'User must be at least 13 years old';
                    }
                  }
                  return true;
                }
              })}
            />
            {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth.message}</p>}
          </div>

          <div>
            <label className="label">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Role *
            </label>
            <select
              className={`input ${errors.role ? 'input-error' : ''}`}
              {...register('role', { required: 'Role is required' })}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
            {errors.role && <p className="form-error">{errors.role.message}</p>}
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <KeyIcon className="h-5 w-5 mr-2" />
          {mode === 'edit' ? 'Change Password (Optional)' : 'Password *'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              Password {mode === 'create' && '*'}
            </label>
            <input
              type="password"
              className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder={mode === 'edit' ? 'Leave blank to keep current password' : 'Enter password'}
              {...register('password', {
                required: mode === 'create' ? 'Password is required' : false,
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                }
              })}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">
              Confirm Password {mode === 'create' && '*'}
            </label>
            <input
              type="password"
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Confirm password"
              {...register('confirmPassword', {
                required: (mode === 'create' || password) ? 'Please confirm your password' : false,
                validate: (value) => {
                  if (password && value !== password) {
                    return 'Passwords do not match';
                  }
                  return true;
                }
              })}
            />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2" />
          Address Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">
              <BuildingOfficeIcon className="h-4 w-4 mr-2" />
              Street Address
            </label>
            <input
              type="text"
              className={`input ${errors.address ? 'input-error' : ''}`}
              placeholder="Enter street address"
              {...register('address')}
            />
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>

          <div>
            <label className="label">City</label>
            <input
              type="text"
              className={`input ${errors.city ? 'input-error' : ''}`}
              placeholder="Enter city"
              {...register('city')}
            />
            {errors.city && <p className="form-error">{errors.city.message}</p>}
          </div>

          <div>
            <label className="label">Country</label>
            <select
              className={`input ${errors.country ? 'input-error' : ''}`}
              {...register('country')}
            >
              <option value="">Select country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {errors.country && <p className="form-error">{errors.country.message}</p>}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <PhoneIcon className="h-5 w-5 mr-2" />
          Emergency Contact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Emergency Contact Name</label>
            <input
              type="text"
              className={`input ${errors.emergencyContact ? 'input-error' : ''}`}
              placeholder="Full name"
              {...register('emergencyContact')}
            />
            {errors.emergencyContact && <p className="form-error">{errors.emergencyContact.message}</p>}
          </div>

          <div>
            <label className="label">Emergency Contact Phone</label>
            <input
              type="tel"
              className={`input ${errors.emergencyPhone ? 'input-error' : ''}`}
              placeholder="+1 (555) 123-4567"
              {...register('emergencyPhone', {
                pattern: {
                  value: /^[\+]?[1-9][\d]{0,15}$/,
                  message: 'Please enter a valid phone number'
                }
              })}
            />
            {errors.emergencyPhone && <p className="form-error">{errors.emergencyPhone.message}</p>}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div>
          <label className="label">
            <UserCircleIcon className="h-4 w-4 mr-2" />
            Profile Image URL
          </label>
          <input
            type="url"
            className={`input ${errors.profileImage ? 'input-error' : ''}`}
            placeholder="https://example.com/profile-image.jpg"
            {...register('profileImage', {
              pattern: {
                value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                message: 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)'
              }
            })}
          />
          {errors.profileImage && <p className="form-error">{errors.profileImage.message}</p>}
        </div>

        <div>
          <label className="label">Bio / About</label>
          <textarea
            rows={4}
            className={`input ${errors.bio ? 'input-error' : ''}`}
            placeholder="Tell us about yourself..."
            {...register('bio', {
              maxLength: { value: 1000, message: 'Bio must not exceed 1000 characters' }
            })}
          />
          {errors.bio && <p className="form-error">{errors.bio.message}</p>}
        </div>
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
          User account is active and can login
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
            mode === 'create' ? 'Create User' : 'Update User'
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;