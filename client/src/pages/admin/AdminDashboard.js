import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  EyeIcon,
  PlusIcon,
  UserPlusIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BarChart, LineChart, DonutChart, ProgressRing } from '../../components/charts/SimpleCharts';
import {
  fetchDashboardStats,
  selectDashboardStats,
  selectDashboardLoading,
  selectDashboardError,
  selectDashboardLastUpdated
} from '../../store/slices/dashboardSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const stats = useSelector(selectDashboardStats);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastUpdated = useSelector(selectDashboardLastUpdated);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDashboardStats());
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 btn-primary btn-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your learning platform
            {lastUpdated && (
              <span className="text-sm ml-2">
                • Last updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-outline btn-sm"
        >
                      <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overview?.totalCourses || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overview?.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overview?.totalEnrollments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overview?.completionRate || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.overview?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trends */}
        {stats?.trends?.enrollmentTrends && (
          <LineChart
            title="Enrollment Trends (Last 6 Months)"
            data={stats.trends.enrollmentTrends.map(trend => ({
              label: formatDate(trend.month),
              value: trend.enrollments
            }))}
            className="shadow-soft"
          />
        )}

        {/* User Roles Distribution */}
        {stats?.analytics?.roleStats && (
          <DonutChart
            title="User Roles Distribution"
            data={stats.analytics.roleStats.map(role => ({
              label: role.role.charAt(0).toUpperCase() + role.role.slice(1),
              value: role.count
            }))}
            className="shadow-soft"
          />
        )}
      </div>

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <ProgressRing
              percentage={stats?.systemHealth?.activeUsersPercentage || 0}
              title="Active Users"
              subtitle={`${stats?.users?.active || 0} of ${stats?.users?.total || 0}`}
              color="green"
            />
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Courses with Enrollments</span>
                <span className="font-medium">{stats?.systemHealth?.coursesWithEnrollments || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Enrollments/Course</span>
                <span className="font-medium">{stats?.systemHealth?.averageEnrollmentsPerCourse || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/admin/courses"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Create New Course</span>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <UserPlusIcon className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Add New User</span>
            </Link>
            <Link
              to="/admin/enrollments"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <EyeIcon className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">View Enrollments</span>
            </Link>
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Courses</h3>
          <div className="space-y-3">
            {stats?.popular?.courses?.slice(0, 4).map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <BookOpenIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500">{course.instructor}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {course.enrollmentCount}
                </span>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No courses yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Enrollments</h3>
          <div className="space-y-3">
            {stats?.recent?.enrollments?.slice(0, 5).map((enrollment, index) => (
              <div key={enrollment.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {enrollment.user?.firstName} {enrollment.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{enrollment.course?.title}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(enrollment.enrollmentDate)}
                </span>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent enrollments</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {stats?.recent?.users?.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'instructor' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
        </div>
      </div>

      {/* Course Categories */}
      {stats?.analytics?.categoryStats && stats.analytics.categoryStats.length > 0 && (
        <BarChart
          title="Course Categories Distribution"
          data={stats.analytics.categoryStats.map(category => ({
            label: category.category,
            value: category.count
          }))}
          className="shadow-soft"
        />
      )}
    </div>
  );
};

export default AdminDashboard;