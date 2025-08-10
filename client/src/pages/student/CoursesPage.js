import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  AcademicCapIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { 
  fetchCourses, 
  selectCourses, 
  selectCoursesLoading, 
  selectCoursesPagination,
  setFilters,
  selectCoursesFilters
} from '../../store/slices/coursesSlice';
import { 
  fetchMyEnrollments,
  selectEnrollments
} from '../../store/slices/enrollmentsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CoursesPage = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const loading = useSelector(selectCoursesLoading);
  const pagination = useSelector(selectCoursesPagination);
  const filters = useSelector(selectCoursesFilters);
  const enrollments = useSelector(selectEnrollments);

  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [selectedCategory, setSelectedCategory] = useState(filters.category);
  const [selectedLevel, setSelectedLevel] = useState(filters.level);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(setFilters({
      search: searchTerm,
      category: selectedCategory,
      level: selectedLevel,
    }));
    dispatch(fetchCourses({ page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLevel('');
    dispatch(setFilters({
      search: '',
      category: '',
      level: '',
    }));
    dispatch(fetchCourses({ page: 1 }));
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'beginner': return 'level-beginner';
      case 'intermediate': return 'level-intermediate';
      case 'advanced': return 'level-advanced';
      default: return 'badge-secondary';
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading courses..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
        <p className="text-gray-600 mt-2">
          Discover and enroll in courses that match your learning goals.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input min-w-[150px]"
          >
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
            <option value="Marketing">Marketing</option>
            <option value="Data Science">Data Science</option>
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="input min-w-[150px]"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="btn-primary"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button
              onClick={clearFilters}
              className="btn-outline"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
          <button onClick={clearFilters} className="btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-shadow">
              {/* Course Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <AcademicCapIcon className="h-16 w-16 text-white opacity-80" />
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${getLevelBadgeClass(course.level)}`}>
                    {course.level}
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    ${course.price}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.shortDescription || course.description}
                </p>

                {/* Course Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 mr-2" />
                    {course.instructor}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {course.duration} hours
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    {course.category}
                  </div>
                </div>

                {/* Enrollment Info */}
                {course.enrollmentCount !== undefined && (
                  <div className="text-sm text-gray-600 mb-4">
                    {course.enrollmentCount} students enrolled
                    {course.maxStudents && (
                      <span> • {course.availableSlots} spots left</span>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <Link
                  to={`/courses/${course.id}`}
                  className="btn-primary w-full text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => dispatch(fetchCourses({ page: pagination.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => dispatch(fetchCourses({ page: pagination.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;