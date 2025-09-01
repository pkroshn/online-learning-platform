import React, { useState } from 'react';
import PurchaseConfirmationModal from '../modals/PurchaseConfirmationModal';
import { useNavigate } from 'react-router-dom';

const PurchaseConfirmationDemo = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    loading: false,
    error: null,
    purchaseData: null
  });
  const navigate = useNavigate();

  const samplePurchaseData = {
    status: 'succeeded',
    amount: 99.99,
    currency: 'USD',
    paymentId: 'PAY-123456789',
    paidAt: new Date().toISOString(),
    paymentMethod: 'card',
    courseId: 1,
    course: {
      id: 1,
      title: 'Advanced JavaScript Development',
      instructor: 'Dr. Sarah Johnson'
    }
  };

  const samplePendingData = {
    status: 'pending',
    amount: 149.99,
    currency: 'USD',
    paymentId: 'PAY-987654321',
    courseId: 2,
    course: {
      id: 2,
      title: 'React Masterclass',
      instructor: 'Mike Chen'
    }
  };

  const sampleFailedData = {
    status: 'failed',
    amount: 79.99,
    currency: 'USD',
    courseId: 3,
    course: {
      id: 3,
      title: 'Python for Data Science',
      instructor: 'Alex Rodriguez'
    }
  };

  const openModal = (data, loading = false, error = null) => {
    setModalState({
      isOpen: true,
      loading,
      error,
      purchaseData: data
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      loading: false,
      error: null,
      purchaseData: null
    });
  };

  const handleViewCourse = (courseId) => {
    closeModal();
    navigate(`/courses/${courseId}`);
  };

  const handleViewMyCourses = () => {
    closeModal();
    navigate('/my-courses');
  };

  const handleBrowseMore = () => {
    closeModal();
    navigate('/courses');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Purchase Confirmation Modal Demo
        </h1>
        <p className="text-gray-600">
          This demo shows different states of the purchase confirmation modal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Success State */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Success State</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-600 mb-4">
              Shows a successful payment confirmation with course details and action buttons.
            </p>
            <button
              onClick={() => openModal(samplePurchaseData)}
              className="btn-success w-full"
            >
              Show Success Modal
            </button>
          </div>
        </div>

        {/* Pending State */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Pending State</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-600 mb-4">
              Shows a payment that is still being processed.
            </p>
            <button
              onClick={() => openModal(samplePendingData)}
              className="btn-secondary w-full"
            >
              Show Pending Modal
            </button>
          </div>
        </div>

        {/* Failed State */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Failed State</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-600 mb-4">
              Shows a failed payment with error information.
            </p>
            <button
              onClick={() => openModal(sampleFailedData)}
              className="btn-danger w-full"
            >
              Show Failed Modal
            </button>
          </div>
        </div>

        {/* Loading State */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Loading State</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-600 mb-4">
              Shows a loading spinner while processing payment.
            </p>
            <button
              onClick={() => openModal(null, true)}
              className="btn-primary w-full"
            >
              Show Loading Modal
            </button>
          </div>
        </div>

        {/* Error State */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Error State</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-600 mb-4">
              Shows an error message when something goes wrong.
            </p>
            <button
              onClick={() => openModal(null, false, "Payment processing failed. Please try again.")}
              className="btn-danger w-full"
            >
              Show Error Modal
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Empty State</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-600 mb-4">
              Shows when no purchase data is available.
            </p>
            <button
              onClick={() => openModal(null)}
              className="btn-outline w-full"
            >
              Show Empty Modal
            </button>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Usage Instructions</h3>
        </div>
        <div className="card-body">
          <div className="prose prose-sm max-w-none">
            <h4>Props:</h4>
            <ul>
              <li><code>isOpen</code> - Boolean to control modal visibility</li>
              <li><code>onClose</code> - Function to close the modal</li>
              <li><code>purchaseData</code> - Object containing purchase information</li>
              <li><code>loading</code> - Boolean to show loading state</li>
              <li><code>error</code> - String for error message</li>
              <li><code>onViewCourse</code> - Function to navigate to course</li>
              <li><code>onViewMyCourses</code> - Function to navigate to my courses</li>
              <li><code>onBrowseMore</code> - Function to browse more courses</li>
            </ul>

            <h4>Purchase Data Structure:</h4>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  status: 'succeeded' | 'pending' | 'failed',
  amount: number,
  currency: string,
  paymentId: string,
  paidAt: string,
  paymentMethod: string,
  courseId: number,
  course: {
    id: number,
    title: string,
    instructor: string
  }
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      <PurchaseConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        purchaseData={modalState.purchaseData}
        loading={modalState.loading}
        error={modalState.error}
        onViewCourse={handleViewCourse}
        onViewMyCourses={handleViewMyCourses}
        onBrowseMore={handleBrowseMore}
      />
    </div>
  );
};

export default PurchaseConfirmationDemo;
