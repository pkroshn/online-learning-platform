import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  selectEnrollments,
  selectEnrollmentsLoading,
  selectEnrollmentsPagination,
  selectEnrollmentsFilters,
  setFilters
} from '../../store/slices/enrollmentsSlice';
import { fetchUsers, selectUsers } from '../../store/slices/usersSlice';
import { fetchCourses, selectCourses } from '../../store/slices/coursesSlice';
import EnrollmentTable from '../../components/tables/EnrollmentTable';
import EnrollmentModal from '../../components/modals/EnrollmentModal';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import toast from 'react-hot-toast';

const AdminEnrollments = () => {
  const dispatch = useDispatch();
  const enrollments = useSelector(selectEnrollments);
  const loading = useSelector(selectEnrollmentsLoading);
  const pagination = useSelector(selectEnrollmentsPagination);
  const filters = useSelector(selectEnrollmentsFilters);
  const users = useSelector(selectUsers);
  const courses = useSelector(selectCourses);

  // Modal states
  const [enrollmentModal, setEnrollmentModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'view'
    enrollment: null
  });
  
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    enrollment: null
  });

  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchEnrollments());
    dispatch(fetchUsers());
    dispatch(fetchCourses());
  }, [dispatch]);

  // Handle enrollment creation
  const handleCreateEnrollment = () => {
    setEnrollmentModal({
      isOpen: true,
      mode: 'create',
      enrollment: null
    });
  };

  // Handle enrollment viewing
  const handleViewEnrollment = (enrollment) => {
    setEnrollmentModal({
      isOpen: true,
      mode: 'view',
      enrollment
    });
  };

  // Handle enrollment editing
  const handleEditEnrollment = (enrollment) => {
    setEnrollmentModal({
      isOpen: true,
      mode: 'edit',
      enrollment
    });
  };

  // Handle enrollment deletion
  const handleDeleteEnrollment = (enrollment) => {
    setDeleteModal({
      isOpen: true,
      enrollment
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setEnrollmentModal({
      isOpen: false,
      mode: 'create',
      enrollment: null
    });
    setModalLoading(false);
  };

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    setDeleteModal({
      isOpen: false,
      enrollment: null
    });
    setModalLoading(false);
  };

  // Handle enrollment form submission
  const handleEnrollmentSubmit = async (enrollmentData) => {
    setModalLoading(true);
    try {
      await dispatch(createEnrollment(enrollmentData)).unwrap();
      toast.success('Enrollment created successfully!');
      handleModalClose();
      // The createEnrollment thunk already refreshes the list
    } catch (error) {
      toast.error(error.message || 'Failed to create enrollment');
      setModalLoading(false);
    }
  };

  // Handle enrollment update submission
  const handleEnrollmentUpdate = async (enrollmentId, enrollmentData) => {
    setModalLoading(true);
    try {
      await dispatch(updateEnrollment({ id: enrollmentId, data: enrollmentData })).unwrap();
      toast.success('Enrollment updated successfully!');
      handleModalClose();
      // The updateEnrollment thunk already refreshes the list
    } catch (error) {
      toast.error(error.message || 'Failed to update enrollment');
      setModalLoading(false);
    }
  };

  // Handle enrollment deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModal.enrollment) return;
    
    setModalLoading(true);
    try {
      await dispatch(deleteEnrollment(deleteModal.enrollment.id)).unwrap();
      toast.success('Enrollment deleted successfully!');
      handleDeleteModalClose();
      // The deleteEnrollment thunk already refreshes the list
    } catch (error) {
      toast.error(error.message || 'Failed to delete enrollment');
      setModalLoading(false);
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(fetchEnrollments({ 
      page: newFilters.page || 1,
      ...newFilters 
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(fetchEnrollments({ page }));
  };

  return (
    <div className="space-y-8">
      {/* Enrollment Table */}
      <EnrollmentTable
        enrollments={enrollments}
        loading={loading}
        onView={handleViewEnrollment}
        onEdit={handleEditEnrollment}
        onDelete={handleDeleteEnrollment}
        onCreate={handleCreateEnrollment}
        pagination={pagination}
        onPageChange={handlePageChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        users={users}
        courses={courses}
      />

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={enrollmentModal.isOpen}
        onClose={handleModalClose}
        onSubmit={enrollmentModal.mode === 'edit' ? handleEnrollmentUpdate : handleEnrollmentSubmit}
        enrollment={enrollmentModal.enrollment}
        loading={modalLoading}
        mode={enrollmentModal.mode}
        users={users}
        courses={courses}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Enrollment"
        message={
          deleteModal.enrollment 
            ? `Are you sure you want to delete this enrollment? This action cannot be undone.`
            : "Are you sure you want to delete this enrollment?"
        }
        confirmText="Delete Enrollment"
        loading={modalLoading}
      />
    </div>
  );
};

export default AdminEnrollments;