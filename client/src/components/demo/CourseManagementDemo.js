import React, { useState } from 'react';
import { 
  AcademicCapIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const CourseManagementDemo = () => {
  const [selectedFeature, setSelectedFeature] = useState('overview');

  const features = [
    {
      id: 'overview',
      title: 'Course Management Overview',
      icon: AcademicCapIcon,
      description: 'Complete CRUD operations for course management'
    },
    {
      id: 'create',
      title: 'Create Course',
      icon: PlusIcon,
      description: 'Add new courses with comprehensive form validation'
    },
    {
      id: 'view',
      title: 'View Course Details',
      icon: EyeIcon,
      description: 'Rich course information display with all details'
    },
    {
      id: 'edit',
      title: 'Edit Course',
      icon: PencilIcon,
      description: 'Update course information with pre-populated forms'
    },
    {
      id: 'delete',
      title: 'Delete Course',
      icon: TrashIcon,
      description: 'Safe deletion with confirmation dialogs'
    }
  ];

  const demoContent = {
    overview: (
      <div className="space-y-6">
        <div className="text-center">
          <AcademicCapIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Course Management System
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A comprehensive frontend solution for managing courses with full CRUD operations, 
            advanced filtering, search capabilities, and professional UI components.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-2">📝 Rich Form Validation</h3>
            <p className="text-gray-600 text-sm">
              Comprehensive form with real-time validation, error messages, and smart defaults.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-2">🔍 Advanced Search & Filter</h3>
            <p className="text-gray-600 text-sm">
              Search by title, filter by category/level, and sort by any column.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Data Table</h3>
            <p className="text-gray-600 text-sm">
              Professional data table with pagination, sorting, and responsive design.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-2">🎨 Modal Dialogs</h3>
            <p className="text-gray-600 text-sm">
              Beautiful modal dialogs for create, edit, view, and delete operations.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-2">🔔 Toast Notifications</h3>
            <p className="text-gray-600 text-sm">
              User-friendly notifications for success, error, and loading states.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-2">📱 Responsive Design</h3>
            <p className="text-gray-600 text-sm">
              Fully responsive interface that works on desktop, tablet, and mobile.
            </p>
          </div>
        </div>
      </div>
    ),
    create: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Create Course Features</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Form Sections:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Basic Information:</strong> Title, Instructor, Category, Duration, Level</li>
            <li>• <strong>Pricing & Capacity:</strong> Price, Maximum Students</li>
            <li>• <strong>Schedule:</strong> Start Date, End Date (optional)</li>
            <li>• <strong>Content:</strong> Description, Prerequisites, Learning Outcomes, Syllabus</li>
            <li>• <strong>Status:</strong> Active/Inactive toggle</li>
          </ul>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Validation Rules:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Title: 3-200 characters (required)</li>
            <li>• Description: 10-5000 characters (required)</li>
            <li>• Duration: 1-1000 hours (required)</li>
            <li>• Price: Non-negative number (required)</li>
            <li>• End date must be after start date</li>
          </ul>
        </div>
      </div>
    ),
    view: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Course Details View</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Information Display:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Header:</strong> Course title, level badge, category, status, price</li>
            <li>• <strong>Metadata:</strong> Instructor, duration, dates, enrollment stats</li>
            <li>• <strong>Content:</strong> Full description, prerequisites</li>
            <li>• <strong>Learning Outcomes:</strong> Bulleted list with visual indicators</li>
            <li>• <strong>Syllabus:</strong> Numbered course modules</li>
            <li>• <strong>Statistics:</strong> Enrollment count, capacity usage</li>
          </ul>
        </div>
      </div>
    ),
    edit: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Edit Course Features</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Edit Capabilities:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Pre-populated Forms:</strong> All fields filled with current values</li>
            <li>• <strong>Smart Updates:</strong> Only changed fields are updated</li>
            <li>• <strong>Validation:</strong> Same validation rules as create</li>
            <li>• <strong>Array Handling:</strong> Learning outcomes and syllabus as text areas</li>
            <li>• <strong>Date Formatting:</strong> Proper date field population</li>
          </ul>
        </div>
      </div>
    ),
    delete: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Safe Course Deletion</h3>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h4 className="font-medium text-gray-900 mb-3">Safety Features:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Confirmation Dialog:</strong> Shows course title in warning message</li>
            <li>• <strong>Impact Warning:</strong> Mentions effect on enrolled students</li>
            <li>• <strong>Loading States:</strong> Prevents double-clicks during deletion</li>
            <li>• <strong>Error Handling:</strong> Graceful error messages if deletion fails</li>
            <li>• <strong>Success Feedback:</strong> Toast notification on successful deletion</li>
          </ul>
        </div>
      </div>
    )
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Course Management Frontend Demo
        </h1>
        <p className="text-gray-600">
          Explore the comprehensive course management interface features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Feature Navigation */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <nav className="space-y-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setSelectedFeature(feature.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedFeature === feature.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{feature.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Feature Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {demoContent[selectedFeature]}
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="mt-12 text-center">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Test the Course Management System?
          </h2>
          <p className="text-gray-600 mb-6">
            Access the admin panel to try out all the course management features
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="text-sm text-gray-600">
              <strong>Admin Login:</strong><br />
              Email: admin@learningplatform.com<br />
              Password: admin123
            </div>
            <div className="text-sm text-gray-600">
              <strong>Navigation:</strong><br />
              Admin Panel → Courses<br />
              Full CRUD operations available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagementDemo;