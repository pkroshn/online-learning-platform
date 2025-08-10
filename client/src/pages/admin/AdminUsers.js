import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  selectUsers,
  selectUsersLoading,
  selectUsersPagination,
  selectUsersFilters,
  setFilters
} from '../../store/slices/usersSlice';
import UserTable from '../../components/tables/UserTable';
import UserModal from '../../components/modals/UserModal';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const pagination = useSelector(selectUsersPagination);
  const filters = useSelector(selectUsersFilters);

  // Modal states
  const [userModal, setUserModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'view'
    user: null
  });
  
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null
  });

  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Handle user creation
  const handleCreateUser = () => {
    setUserModal({
      isOpen: true,
      mode: 'create',
      user: null
    });
  };

  // Handle user viewing
  const handleViewUser = (user) => {
    setUserModal({
      isOpen: true,
      mode: 'view',
      user
    });
  };

  // Handle user editing
  const handleEditUser = (user) => {
    setUserModal({
      isOpen: true,
      mode: 'edit',
      user
    });
  };

  // Handle user deletion
  const handleDeleteUser = (user) => {
    setDeleteModal({
      isOpen: true,
      user
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setUserModal({
      isOpen: false,
      mode: 'create',
      user: null
    });
    setModalLoading(false);
  };

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    setDeleteModal({
      isOpen: false,
      user: null
    });
    setModalLoading(false);
  };

  // Handle user form submission
  const handleUserSubmit = async (userData) => {
    setModalLoading(true);
    try {
      await dispatch(createUser(userData)).unwrap();
      toast.success('User created successfully!');
      handleModalClose();
      // The createUser thunk already refreshes the list
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
      setModalLoading(false);
    }
  };

  // Handle user update submission
  const handleUserUpdate = async (userId, userData) => {
    setModalLoading(true);
    try {
      await dispatch(updateUser({ id: userId, data: userData })).unwrap();
      toast.success('User updated successfully!');
      handleModalClose();
      // The updateUser thunk already refreshes the list
    } catch (error) {
      toast.error(error.message || 'Failed to update user');
      setModalLoading(false);
    }
  };

  // Handle user deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;
    
    setModalLoading(true);
    try {
      await dispatch(deleteUser(deleteModal.user.id)).unwrap();
      toast.success('User deleted successfully!');
      handleDeleteModalClose();
      // The deleteUser thunk already refreshes the list
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
      setModalLoading(false);
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(fetchUsers({ 
      page: newFilters.page || 1,
      ...newFilters 
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(fetchUsers({ page }));
  };

  return (
    <div className="space-y-8">
      {/* User Table */}
      <UserTable
        users={users}
        loading={loading}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onCreate={handleCreateUser}
        pagination={pagination}
        onPageChange={handlePageChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* User Modal */}
      <UserModal
        isOpen={userModal.isOpen}
        onClose={handleModalClose}
        onSubmit={userModal.mode === 'edit' ? handleUserUpdate : handleUserSubmit}
        user={userModal.user}
        loading={modalLoading}
        mode={userModal.mode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={
          deleteModal.user 
            ? `Are you sure you want to delete "${deleteModal.user.firstName} ${deleteModal.user.lastName}"? This action cannot be undone and will remove all associated data including enrollments.`
            : "Are you sure you want to delete this user?"
        }
        confirmText="Delete User"
        loading={modalLoading}
      />
    </div>
  );
};

export default AdminUsers;