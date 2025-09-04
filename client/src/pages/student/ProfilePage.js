import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  KeyIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { selectUser, updateProfile, changePassword, selectAuthLoading } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PurchaseHistory from '../../components/student/PurchaseHistory';

const ProfilePage = () => {
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm();

  const onUpdateProfile = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
    } catch (error) {
      // Error handled by slice
    }
  };

  const onChangePassword = async (data) => {
    try {
      await dispatch(changePassword(data)).unwrap();
      resetPasswordForm();
    } catch (error) {
      // Error handled by slice
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'password', name: 'Change Password', icon: KeyIcon },
    { id: 'purchases', name: 'Purchase History', icon: CurrencyDollarIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account information and preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-soft p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-10 w-10 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <UserIcon className="h-4 w-4 mr-2" />
                  First Name
                </label>
                <input
                  type="text"
                  className={`input ${profileErrors.firstName ? 'input-error' : ''}`}
                  {...registerProfile('firstName', {
                    required: 'First name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' }
                  })}
                />
                {profileErrors.firstName && (
                  <p className="form-error">{profileErrors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="label">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Last Name
                </label>
                <input
                  type="text"
                  className={`input ${profileErrors.lastName ? 'input-error' : ''}`}
                  {...registerProfile('lastName', {
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' }
                  })}
                />
                {profileErrors.lastName && (
                  <p className="form-error">{profileErrors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="label">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                className={`input ${profileErrors.phone ? 'input-error' : ''}`}
                placeholder="+1 (555) 123-4567"
                {...registerProfile('phone', {
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Invalid phone number format'
                  }
                })}
              />
              {profileErrors.phone && (
                <p className="form-error">{profileErrors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="label">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Date of Birth
              </label>
              <input
                type="date"
                className="input"
                {...registerProfile('dateOfBirth')}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-6">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                className={`input ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                {...registerPassword('currentPassword', {
                  required: 'Current password is required'
                })}
              />
              {passwordErrors.currentPassword && (
                <p className="form-error">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className={`input ${passwordErrors.newPassword ? 'input-error' : ''}`}
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain uppercase, lowercase, and number'
                  }
                })}
              />
              {passwordErrors.newPassword && (
                <p className="form-error">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className={`input ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                {...registerPassword('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value, { newPassword }) =>
                    value === newPassword || 'Passwords do not match'
                })}
              />
              {passwordErrors.confirmPassword && (
                <p className="form-error">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Purchase History Tab */}
        {activeTab === 'purchases' && (
          <PurchaseHistory />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;