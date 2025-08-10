import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import UserForm from '../forms/UserForm';

const UserModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user = null, 
  loading = false,
  mode = 'create' // 'create', 'edit', 'view'
}) => {
  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Create New User';
      case 'edit': return 'Edit User';
      case 'view': return 'User Details';
      default: return 'User';
    }
  };

  const handleSubmit = (data) => {
    if (mode === 'edit' && user) {
      onSubmit(user.id, data);
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
                    <UserViewContent user={user} />
                  ) : (
                    <UserForm
                      user={user}
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

// User View Component
const UserViewContent = ({ user }) => {
  if (!user) return <div>User not found</div>;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-danger';
      case 'instructor': return 'badge-warning';
      case 'student': return 'badge-primary';
      default: return 'badge-secondary';
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center ${user.profileImage ? 'hidden' : 'flex'}`}
          >
            <span className="text-2xl font-bold text-primary-600">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </span>
              <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="text-gray-600 space-y-1">
            <p className="flex items-center">
              <span className="font-medium">Email:</span>
              <span className="ml-2">{user.email}</span>
            </p>
            {user.phone && (
              <p className="flex items-center">
                <span className="font-medium">Phone:</span>
                <span className="ml-2">{user.phone}</span>
              </p>
            )}
            <p className="flex items-center">
              <span className="font-medium">Member since:</span>
              <span className="ml-2">{formatDate(user.createdAt)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-3">
            {user.dateOfBirth && (
              <div>
                <span className="text-sm text-gray-600">Date of Birth:</span>
                <p className="font-medium">
                  {formatDate(user.dateOfBirth)}
                  {calculateAge(user.dateOfBirth) && (
                    <span className="text-gray-500 ml-2">
                      (Age: {calculateAge(user.dateOfBirth)})
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {(user.address || user.city || user.country) && (
              <div>
                <span className="text-sm text-gray-600">Address:</span>
                <div className="font-medium">
                  {user.address && <p>{user.address}</p>}
                  {(user.city || user.country) && (
                    <p>{[user.city, user.country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          {user.emergencyContact || user.emergencyPhone ? (
            <div className="space-y-3">
              {user.emergencyContact && (
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <p className="font-medium">{user.emergencyContact}</p>
                </div>
              )}
              {user.emergencyPhone && (
                <div>
                  <span className="text-sm text-gray-600">Phone:</span>
                  <p className="font-medium">{user.emergencyPhone}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No emergency contact information provided</p>
          )}
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
          <p className="text-gray-700 leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {user.enrollmentStats?.total || user.enrollmentCount || 0}
          </div>
          <div className="text-sm text-gray-600">Total Enrollments</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {user.enrollmentStats?.completed || user.completedCourses || 0}
          </div>
          <div className="text-sm text-gray-600">Completed Courses</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {user.enrollmentStats?.active || 0}
          </div>
          <div className="text-sm text-gray-600">Active Enrollments</div>
        </div>
      </div>

      {/* Account Details */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">User ID:</span>
            <p className="font-medium">{user.id}</p>
          </div>
          <div>
            <span className="text-gray-600">Account Status:</span>
            <p className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <p className="font-medium">{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <p className="font-medium">{formatDate(user.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;