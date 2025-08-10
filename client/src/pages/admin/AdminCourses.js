import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  selectCourses,
  selectCoursesLoading,
  selectCoursesPagination,
  selectCoursesFilters,
  setFilters
} from '../../store/slices/coursesSlice';
import CourseTable from '../../components/tables/CourseTable';
import CourseModal from '../../components/modals/CourseModal';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import toast from 'react-hot-toast';

const AdminCourses = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const loading = useSelector(selectCoursesLoading);
  const pagination = useSelector(selectCoursesPagination);
  const filters = useSelector(selectCoursesFilters);

  // Modal states
  const [courseModal, setCourseModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'view'
    course: null
  });
  
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    course: null
  });

  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Handle course creation
  const handleCreateCourse = () => {
    setCourseModal({
      isOpen: true,
      mode: 'create',
      course: null
    });
  };

  // Handle course viewing
  const handleViewCourse = (course) => {
    setCourseModal({
      isOpen: true,
      mode: 'view',
      course
    });
  };

  // Handle course editing
  const handleEditCourse = (course) => {
    setCourseModal({
      isOpen: true,
      mode: 'edit',
      course
    });
  };

  // Handle course deletion
  const handleDeleteCourse = (course) => {
    setDeleteModal({
      isOpen: true,
      course
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setCourseModal({
      isOpen: false,
      mode: 'create',
      course: null
    });
    setModalLoading(false);
  };

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    setDeleteModal({
      isOpen: false,
      course: null
    });
    setModalLoading(false);
  };

  // Handle course form submission
  const handleCourseSubmit = async (courseData) => {
    setModalLoading(true);
    try {
      await dispatch(createCourse(courseData)).unwrap();
      toast.success('Course created successfully!');
      handleModalClose();
      // Refresh the courses list
      dispatch(fetchCourses());
    } catch (error) {
      console.error('Failed to create course:', error);
      toast.error(error.message || 'Failed to create course');
      setModalLoading(false);
    }
  };

  // Handle course update submission
  const handleCourseUpdate = async (courseId, courseData) => {
    setModalLoading(true);
    try {
      await dispatch(updateCourse({ id: courseId, data: courseData })).unwrap();
      toast.success('Course updated successfully!');
      handleModalClose();
      // Refresh the courses list
      dispatch(fetchCourses());
    } catch (error) {
      console.error('Failed to update course:', error);
      toast.error(error.message || 'Failed to update course');
      setModalLoading(false);
    }
  };

  // Handle course deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModal.course) return;
    
    setModalLoading(true);
    try {
      await dispatch(deleteCourse(deleteModal.course.id)).unwrap();
      toast.success('Course deleted successfully!');
      handleDeleteModalClose();
      // Refresh the courses list
      dispatch(fetchCourses());
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error(error.message || 'Failed to delete course');
      setModalLoading(false);
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(fetchCourses({ 
      page: newFilters.page || 1,
      ...newFilters 
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(fetchCourses({ page }));
  };

  return (
    <div className="space-y-8">
      {/* Course Table */}
      <CourseTable
        courses={courses}
        loading={loading}
        onView={handleViewCourse}
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
        onCreate={handleCreateCourse}
        pagination={pagination}
        onPageChange={handlePageChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Course Modal */}
      <CourseModal
        isOpen={courseModal.isOpen}
        onClose={handleModalClose}
        onSubmit={courseModal.mode === 'edit' ? handleCourseUpdate : handleCourseSubmit}
        course={courseModal.course}
        loading={modalLoading}
        mode={courseModal.mode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Course"
        message={
          deleteModal.course 
            ? `Are you sure you want to delete "${deleteModal.course.title}"? This action cannot be undone and will affect all enrolled students.`
            : "Are you sure you want to delete this course?"
        }
        confirmText="Delete Course"
        loading={modalLoading}
      />
    </div>
  );
};

export default AdminCourses;