import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

// Course Settings Component
export const CourseSettings = ({ form, onSave, loading }) => (
  <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">Default Course Duration (hours)</label>
        <input
          type="number"
          className="input"
          min="1"
          {...form.register('defaultDuration')}
        />
      </div>
      <div>
        <label className="label">Max File Upload Size (MB)</label>
        <input
          type="number"
          className="input"
          min="1"
          max="100"
          {...form.register('maxFileUploadSize')}
        />
      </div>
    </div>

    <div>
      <label className="label">Default Currency</label>
      <select className="input w-32" {...form.register('defaultCurrency')}>
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
        <option value="GBP">GBP (£)</option>
        <option value="CAD">CAD ($)</option>
      </select>
    </div>

    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="allowGuestPreview"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('allowGuestPreview')}
        />
        <label htmlFor="allowGuestPreview" className="text-sm font-medium text-gray-700">
          Allow Guest Course Preview
        </label>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="autoEnrollment"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('autoEnrollment')}
        />
        <label htmlFor="autoEnrollment" className="text-sm font-medium text-gray-700">
          Enable Auto-Enrollment
        </label>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="certificateGeneration"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('certificateGeneration')}
        />
        <label htmlFor="certificateGeneration" className="text-sm font-medium text-gray-700">
          Generate Completion Certificates
        </label>
      </div>
    </div>

    <div className="flex justify-end">
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <><LoadingSpinner size="sm" />Saving...</> : 'Save Course Settings'}
      </button>
    </div>
  </form>
);

// Notification Settings Component
export const NotificationSettings = ({ form, onSave, loading, onTestEmail }) => (
  <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="emailNotifications"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('emailNotifications')}
        />
        <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
          Enable Email Notifications
        </label>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="enrollmentNotifications"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('enrollmentNotifications')}
        />
        <label htmlFor="enrollmentNotifications" className="text-sm font-medium text-gray-700">
          Enrollment Notifications
        </label>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="completionNotifications"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('completionNotifications')}
        />
        <label htmlFor="completionNotifications" className="text-sm font-medium text-gray-700">
          Course Completion Notifications
        </label>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="reminderNotifications"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('reminderNotifications')}
        />
        <label htmlFor="reminderNotifications" className="text-sm font-medium text-gray-700">
          Course Reminder Notifications
        </label>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="adminNotifications"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('adminNotifications')}
        />
        <label htmlFor="adminNotifications" className="text-sm font-medium text-gray-700">
          Admin System Notifications
        </label>
      </div>
    </div>

    <div className="border-t pt-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">SMTP Configuration</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">SMTP Host</label>
          <input
            type="text"
            className="input"
            placeholder="smtp.example.com"
            {...form.register('smtpHost')}
          />
        </div>
        <div>
          <label className="label">SMTP Port</label>
          <input
            type="number"
            className="input"
            {...form.register('smtpPort')}
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="label">SMTP Username</label>
        <input
          type="text"
          className="input"
          {...form.register('smtpUser')}
        />
      </div>
      <div className="mt-4 flex items-center space-x-3">
        <input
          type="checkbox"
          id="smtpSecure"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('smtpSecure')}
        />
        <label htmlFor="smtpSecure" className="text-sm font-medium text-gray-700">
          Use SSL/TLS
        </label>
      </div>
    </div>

    <div className="flex justify-between">
      <button
        type="button"
        onClick={onTestEmail}
        disabled={loading}
        className="btn-outline"
      >
        {loading ? <><LoadingSpinner size="sm" />Testing...</> : 'Test Email'}
      </button>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <><LoadingSpinner size="sm" />Saving...</> : 'Save Notification Settings'}
      </button>
    </div>
  </form>
);

// Security Settings Component
export const SecuritySettings = ({ form, onSave, loading }) => (
  <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">Max Login Attempts</label>
        <input
          type="number"
          className="input"
          min="3"
          max="10"
          {...form.register('loginAttempts')}
        />
      </div>
      <div>
        <label className="label">Lockout Duration (minutes)</label>
        <input
          type="number"
          className="input"
          min="5"
          {...form.register('lockoutDuration')}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">Password Expiry (days)</label>
        <input
          type="number"
          className="input"
          min="30"
          {...form.register('passwordExpiry')}
        />
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="twoFactorAuth"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('twoFactorAuth')}
        />
        <label htmlFor="twoFactorAuth" className="text-sm font-medium text-gray-700">
          Enable Two-Factor Authentication
        </label>
      </div>
    </div>

    <div className="border-t pt-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Rate Limiting</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Requests per Window</label>
          <input
            type="number"
            className="input"
            min="10"
            {...form.register('rateLimitRequests')}
          />
        </div>
        <div>
          <label className="label">Window Duration (minutes)</label>
          <input
            type="number"
            className="input"
            min="1"
            {...form.register('rateLimitWindow')}
          />
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <><LoadingSpinner size="sm" />Saving...</> : 'Save Security Settings'}
      </button>
    </div>
  </form>
);

// Analytics Settings Component
export const AnalyticsSettings = ({ form, onSave, loading }) => (
  <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="trackUserActivity"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('trackUserActivity')}
        />
        <label htmlFor="trackUserActivity" className="text-sm font-medium text-gray-700">
          Track User Activity
        </label>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="anonymizeData"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('anonymizeData')}
        />
        <label htmlFor="anonymizeData" className="text-sm font-medium text-gray-700">
          Anonymize User Data
        </label>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">Data Retention (days)</label>
        <input
          type="number"
          className="input"
          min="30"
          {...form.register('dataRetentionDays')}
        />
      </div>
      <div>
        <label className="label">Export Format</label>
        <select className="input" {...form.register('exportFormat')}>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="xlsx">Excel</option>
        </select>
      </div>
    </div>

    <div>
      <label className="label">Reporting Frequency</label>
      <select className="input w-48" {...form.register('reportingFrequency')}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
      </select>
    </div>

    <div className="flex justify-end">
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <><LoadingSpinner size="sm" />Saving...</> : 'Save Analytics Settings'}
      </button>
    </div>
  </form>
);

// Enhanced User Settings with Role Management
export const EnhancedUserSettings = ({ form, onSave, loading, availableRoles, onAddRole, onUpdateRole, onRemoveRole }) => {
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ value: '', label: '', description: '' });

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (editingRole) {
      onUpdateRole(editingRole.value, roleForm);
      setEditingRole(null);
    } else {
      onAddRole(roleForm);
    }
    setRoleForm({ value: '', label: '', description: '' });
    setShowRoleForm(false);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({ ...role });
    setShowRoleForm(true);
  };

  const handleCancelRole = () => {
    setShowRoleForm(false);
    setEditingRole(null);
    setRoleForm({ value: '', label: '', description: '' });
  };

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
      {/* Basic User Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowRegistration"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...form.register('allowRegistration')}
            />
            <label htmlFor="allowRegistration" className="text-sm font-medium text-gray-700">
              Allow User Registration
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="requireEmailVerification"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...form.register('requireEmailVerification')}
            />
            <label htmlFor="requireEmailVerification" className="text-sm font-medium text-gray-700">
              Require Email Verification
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="label">Default User Role</label>
            <select className="input" {...form.register('defaultRole')}>
              {availableRoles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Max Students Per Course</label>
            <input
              type="number"
              className="input"
              min="1"
              {...form.register('maxStudentsPerCourse')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="label">Password Minimum Length</label>
            <input
              type="number"
              className="input"
              min="4"
              max="20"
              {...form.register('passwordMinLength')}
            />
          </div>
          <div>
            <label className="label">Session Timeout (minutes)</label>
            <input
              type="number"
              className="input"
              min="5"
              {...form.register('sessionTimeout')}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-3">
          <input
            type="checkbox"
            id="allowProfilePictures"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            {...form.register('allowProfilePictures')}
          />
          <label htmlFor="allowProfilePictures" className="text-sm font-medium text-gray-700">
            Allow Profile Pictures
          </label>
        </div>
      </div>

      {/* Role Management */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">User Roles Management</h4>
          <button
            type="button"
            onClick={() => setShowRoleForm(true)}
            className="btn-outline btn-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Role
          </button>
        </div>

        {/* Role Form */}
        {showRoleForm && (
          <div className="bg-white p-4 rounded-lg border mb-4">
            <h5 className="font-medium text-gray-900 mb-3">
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </h5>
            <form onSubmit={handleRoleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Role Value (unique identifier)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., moderator"
                    value={roleForm.value}
                    onChange={(e) => setRoleForm({...roleForm, value: e.target.value})}
                    disabled={editingRole} // Don't allow changing value when editing
                    required
                  />
                </div>
                <div>
                  <label className="label">Display Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Moderator"
                    value={roleForm.label}
                    onChange={(e) => setRoleForm({...roleForm, label: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows="2"
                  placeholder="Describe what this role can do..."
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary btn-sm">
                  {editingRole ? 'Update' : 'Add'} Role
                </button>
                <button type="button" onClick={handleCancelRole} className="btn-outline btn-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Roles List */}
        <div className="space-y-2">
          {availableRoles.map((role) => (
            <div key={role.value} className="bg-white p-3 rounded-lg border flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">{role.label}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {role.value}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleEditRole(role)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit role"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                {!['student', 'admin'].includes(role.value) && (
                  <button
                    type="button"
                    onClick={() => onRemoveRole(role.value)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete role"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <><LoadingSpinner size="sm" />Saving...</> : 'Save User Settings'}
        </button>
      </div>
    </form>
  );
};