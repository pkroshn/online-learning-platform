import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const usePurchaseConfirmation = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    loading: false,
    error: null,
    purchaseData: null
  });
  
  const navigate = useNavigate();

  const openModal = useCallback((data, loading = false, error = null) => {
    setModalState({
      isOpen: true,
      loading,
      error,
      purchaseData: data
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      loading: false,
      error: null,
      purchaseData: null
    });
  }, []);

  const showSuccess = useCallback((purchaseData) => {
    openModal(purchaseData, false, null);
  }, [openModal]);

  const showPending = useCallback((purchaseData) => {
    openModal(purchaseData, false, null);
  }, [openModal]);

  const showFailed = useCallback((purchaseData) => {
    openModal(purchaseData, false, null);
  }, [openModal]);

  const showLoading = useCallback(() => {
    openModal(null, true, null);
  }, [openModal]);

  const showError = useCallback((errorMessage) => {
    openModal(null, false, errorMessage);
  }, [openModal]);

  const handleViewCourse = useCallback((courseId) => {
    closeModal();
    navigate(`/courses/${courseId}`);
  }, [closeModal, navigate]);

  const handleViewMyCourses = useCallback(() => {
    closeModal();
    navigate('/my-courses');
  }, [closeModal, navigate]);

  const handleBrowseMore = useCallback(() => {
    closeModal();
    navigate('/courses');
  }, [closeModal, navigate]);

  return {
    modalState,
    openModal,
    closeModal,
    showSuccess,
    showPending,
    showFailed,
    showLoading,
    showError,
    handleViewCourse,
    handleViewMyCourses,
    handleBrowseMore
  };
};

export default usePurchaseConfirmation;
