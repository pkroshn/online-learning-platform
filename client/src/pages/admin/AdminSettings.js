import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import {
  CogIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { CourseSettings, NotificationSettings, SecuritySettings, AnalyticsSettings, EnhancedUserSettings } from '../../components/admin/SettingsComponents';
import { EnhancedCourseSettings } from '../../components/admin/CurrencyManagement';
import {
  selectAllSettings,
  selectAvailableRoles,
  selectAvailableCurrencies,
  updatePlatformSettings,
  updateUserSettings,
  updateCourseSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  updateAnalyticsSettings,
  addUserRole,
  updateUserRole,
  removeUserRole,
  addCurrency,
  updateCurrency,
  removeCurrency
} from '../../store/slices/settingsSlice';

const AdminSettings = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('platform');
  const [loading, setLoading] = useState(false);
  
  // Get settings from Redux store
  const settings = useSelector(selectAllSettings);
  const availableRoles = useSelector(selectAvailableRoles);
  const availableCurrencies = useSelector(selectAvailableCurrencies);

  // Forms for each category
  const platformForm = useForm({ defaultValues: settings.platform });
  const usersForm = useForm({ defaultValues: settings.users });
  const coursesForm = useForm({ defaultValues: settings.courses });
  const notificationsForm = useForm({ defaultValues: settings.notifications });
  const securityForm = useForm({ defaultValues: settings.security });
  const analyticsForm = useForm({ defaultValues: settings.analytics });

  const tabs = [
    { id: 'platform', name: 'Platform', icon: BuildingOfficeIcon, form: platformForm },
    { id: 'users', name: 'Users', icon: UserGroupIcon, form: usersForm },
    { id: 'courses', name: 'Courses', icon: AcademicCapIcon, form: coursesForm },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, form: notificationsForm },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon, form: securityForm },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, form: analyticsForm }
  ];

  // Update forms when settings change
  useEffect(() => {
    platformForm.reset(settings.platform);
    usersForm.reset(settings.users);
    coursesForm.reset(settings.courses);
    notificationsForm.reset(settings.notifications);
    securityForm.reset(settings.security);
    analyticsForm.reset(settings.analytics);
  }, [settings, platformForm, usersForm, coursesForm, notificationsForm, securityForm, analyticsForm]);

  const saveSettings = async (category, data) => {
    setLoading(true);
    try {
      // Simulate API call - in real implementation, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dispatch the appropriate Redux action based on category
      switch (category) {
        case 'platform':
          dispatch(updatePlatformSettings(data));
          break;
        case 'users':
          dispatch(updateUserSettings(data));
          break;
        case 'courses':
          dispatch(updateCourseSettings(data));
          break;
        case 'notifications':
          dispatch(updateNotificationSettings(data));
          break;
        case 'security':
          dispatch(updateSecuritySettings(data));
          break;
        case 'analytics':
          dispatch(updateAnalyticsSettings(data));
          break;
        default:
          break;
      }
      
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully!`);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Test email sent successfully!');
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'platform-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Settings exported successfully! Check your site header to see live changes.');
  };

  // Role management handlers
  const handleAddRole = (roleData) => {
    dispatch(addUserRole(roleData));
    toast.success(`Role "${roleData.label}" added successfully!`);
  };

  const handleUpdateRole = (oldValue, newRoleData) => {
    dispatch(updateUserRole({ oldValue, newRole: newRoleData }));
    toast.success(`Role "${newRoleData.label}" updated successfully!`);
  };

  const handleRemoveRole = (roleValue) => {
    const role = availableRoles.find(r => r.value === roleValue);
    dispatch(removeUserRole(roleValue));
    toast.success(`Role "${role?.label}" removed successfully!`);
  };

  // Currency management handlers
  const handleAddCurrency = (currencyData) => {
    dispatch(addCurrency(currencyData));
    toast.success(`Currency "${currencyData.label}" added successfully!`);
  };

  const handleUpdateCurrency = (oldValue, newCurrencyData) => {
    dispatch(updateCurrency({ oldValue, newCurrency: newCurrencyData }));
    toast.success(`Currency "${newCurrencyData.label}" updated successfully!`);
  };

  const handleRemoveCurrency = (currencyValue) => {
    const currency = availableCurrencies.find(c => c.value === currencyValue);
    dispatch(removeCurrency(currencyValue));
    toast.success(`Currency "${currency?.label}" removed successfully!`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">Configure your learning platform settings and preferences.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportSettings}
            className="btn-outline"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Export Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
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

        {/* Settings Content */}
        <div className="p-6">
          {activeTab === 'platform' && <PlatformSettings form={platformForm} onSave={(data) => saveSettings('platform', data)} loading={loading} />}
          {activeTab === 'users' && (
            <EnhancedUserSettings 
              form={usersForm} 
              onSave={(data) => saveSettings('users', data)} 
              loading={loading}
              availableRoles={availableRoles}
              onAddRole={handleAddRole}
              onUpdateRole={handleUpdateRole}
              onRemoveRole={handleRemoveRole}
            />
          )}
          {activeTab === 'courses' && (
            <EnhancedCourseSettings 
              form={coursesForm} 
              onSave={(data) => saveSettings('courses', data)} 
              loading={loading}
              availableCurrencies={availableCurrencies}
              onAddCurrency={handleAddCurrency}
              onUpdateCurrency={handleUpdateCurrency}
              onRemoveCurrency={handleRemoveCurrency}
            />
          )}
          {activeTab === 'notifications' && <NotificationSettings form={notificationsForm} onSave={(data) => saveSettings('notifications', data)} loading={loading} onTestEmail={handleTestEmail} />}
          {activeTab === 'security' && <SecuritySettings form={securityForm} onSave={(data) => saveSettings('security', data)} loading={loading} />}
          {activeTab === 'analytics' && <AnalyticsSettings form={analyticsForm} onSave={(data) => saveSettings('analytics', data)} loading={loading} />}
        </div>
      </div>
    </div>
  );
};

// Platform Settings Component
const PlatformSettings = ({ form, onSave, loading }) => (
  <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">
          <GlobeAltIcon className="h-4 w-4 mr-2" />
          Site Name
        </label>
        <input
          type="text"
          className="input"
          {...form.register('siteName', { required: 'Site name is required' })}
        />
      </div>
      <div>
        <label className="label">
          <EnvelopeIcon className="h-4 w-4 mr-2" />
          Contact Email
        </label>
        <input
          type="email"
          className="input"
          {...form.register('contactEmail', { required: 'Contact email is required' })}
        />
      </div>
    </div>

    <div>
      <label className="label">Site Description</label>
      <textarea
        rows={3}
        className="input"
        {...form.register('siteDescription')}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">Support Phone</label>
        <input
          type="tel"
          className="input"
          {...form.register('supportPhone')}
        />
      </div>
      <div>
        <label className="label">Timezone</label>
        <select className="input" {...form.register('timezone')}>
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">Language</label>
        <select className="input" {...form.register('language')}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="maintenanceMode"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...form.register('maintenanceMode')}
        />
        <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
          Maintenance Mode
        </label>
      </div>
    </div>

    <div className="flex justify-end">
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <><LoadingSpinner size="sm" />Saving...</> : 'Save Platform Settings'}
      </button>
    </div>
  </form>
);

// User Settings Component  
const UserSettings = ({ form, onSave, loading }) => (
  <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
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

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">Default User Role</label>
        <select className="input" {...form.register('defaultRole')}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
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

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

    <div className="flex items-center space-x-3">
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

    <div className="flex justify-end">
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <><LoadingSpinner size="sm" />Saving...</> : 'Save User Settings'}
      </button>
    </div>
  </form>
);

export default AdminSettings;