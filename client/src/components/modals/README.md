# Purchase Confirmation Modal

A comprehensive modal component for displaying purchase confirmation details in the online learning platform. This modal supports multiple states including success, pending, failed, loading, and error states.

## Features

- ✅ **Multiple States**: Success, pending, failed, loading, and error states
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Accessible**: Built with Headless UI for accessibility
- ✅ **Customizable**: Flexible props for different use cases
- ✅ **Type Safe**: Clear prop structure and validation
- ✅ **Integration Ready**: Easy to integrate with existing payment flows

## Components

### 1. PurchaseConfirmationModal

The main modal component that displays purchase confirmation details.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Controls modal visibility |
| `onClose` | `function` | - | Function to close the modal |
| `purchaseData` | `object` | `null` | Purchase information object |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `error` | `string` | `null` | Error message to display |
| `onViewCourse` | `function` | - | Navigate to course page |
| `onViewMyCourses` | `function` | - | Navigate to my courses page |
| `onBrowseMore` | `function` | - | Navigate to courses listing |

#### Purchase Data Structure

```javascript
{
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
}
```

### 2. usePurchaseConfirmation Hook

A custom hook that manages modal state and provides convenient functions.

#### Returns

| Function | Description |
|----------|-------------|
| `modalState` | Current modal state object |
| `showSuccess(purchaseData)` | Show success modal |
| `showPending(purchaseData)` | Show pending modal |
| `showFailed(purchaseData)` | Show failed modal |
| `showLoading()` | Show loading modal |
| `showError(errorMessage)` | Show error modal |
| `handleViewCourse(courseId)` | Navigate to course |
| `handleViewMyCourses()` | Navigate to my courses |
| `handleBrowseMore()` | Navigate to courses listing |

## Usage Examples

### Basic Usage

```jsx
import React, { useState } from 'react';
import PurchaseConfirmationModal from '../modals/PurchaseConfirmationModal';

const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);

  const handlePurchase = () => {
    const data = {
      status: 'succeeded',
      amount: 99.99,
      currency: 'USD',
      paymentId: 'PAY-123456',
      paidAt: new Date().toISOString(),
      paymentMethod: 'card',
      courseId: 1,
      course: {
        id: 1,
        title: 'JavaScript Fundamentals',
        instructor: 'John Doe'
      }
    };
    
    setPurchaseData(data);
    setIsModalOpen(true);
  };

  return (
    <div>
      <button onClick={handlePurchase}>Purchase Course</button>
      
      <PurchaseConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        purchaseData={purchaseData}
        onViewCourse={(courseId) => console.log('View course:', courseId)}
        onViewMyCourses={() => console.log('View my courses')}
        onBrowseMore={() => console.log('Browse more')}
      />
    </div>
  );
};
```

### Using the Hook

```jsx
import React from 'react';
import PurchaseConfirmationModal from '../modals/PurchaseConfirmationModal';
import usePurchaseConfirmation from '../../hooks/usePurchaseConfirmation';

const MyComponent = () => {
  const {
    modalState,
    showSuccess,
    showError,
    handleViewCourse,
    handleViewMyCourses,
    handleBrowseMore
  } = usePurchaseConfirmation();

  const handlePurchase = async () => {
    try {
      // Process payment
      const result = await processPayment();
      showSuccess(result);
    } catch (error) {
      showError('Payment failed. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={handlePurchase}>Purchase Course</button>
      
      <PurchaseConfirmationModal
        isOpen={modalState.isOpen}
        onClose={modalState.closeModal}
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
```

### Integration with Payment Flow

```jsx
import React, { useState } from 'react';
import { paymentAPI } from '../../utils/api';
import PurchaseConfirmationModal from '../modals/PurchaseConfirmationModal';
import usePurchaseConfirmation from '../../hooks/usePurchaseConfirmation';

const CoursePurchase = ({ course }) => {
  const [buyLoading, setBuyLoading] = useState(false);
  const {
    modalState,
    showSuccess,
    showLoading,
    showError,
    handleViewCourse,
    handleViewMyCourses,
    handleBrowseMore
  } = usePurchaseConfirmation();

  const handleBuyCourse = async () => {
    setBuyLoading(true);
    showLoading();
    
    try {
      const response = await paymentAPI.createCheckoutSession(course.id);
      
      if (response.data.success) {
        // In real implementation, redirect to Stripe
        // window.location.href = response.data.data.sessionUrl;
        
        // For demo, show success modal
        const purchaseData = {
          status: 'succeeded',
          amount: course.price,
          currency: 'USD',
          paymentId: `PAY-${Date.now()}`,
          paidAt: new Date().toISOString(),
          paymentMethod: 'card',
          courseId: course.id,
          course: {
            id: course.id,
            title: course.title,
            instructor: course.instructor
          }
        };
        
        showSuccess(purchaseData);
      }
    } catch (error) {
      showError('Failed to process payment. Please try again.');
    } finally {
      setBuyLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleBuyCourse}
        disabled={buyLoading}
        className="btn-primary"
      >
        {buyLoading ? 'Processing...' : `Buy Course - $${course.price}`}
      </button>
      
      <PurchaseConfirmationModal
        isOpen={modalState.isOpen}
        onClose={modalState.closeModal}
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
```

## Styling

The modal uses Tailwind CSS classes and follows the existing design system. Key styling features:

- **Responsive**: Adapts to different screen sizes
- **Consistent**: Uses the same design tokens as other components
- **Accessible**: Proper focus management and keyboard navigation
- **Smooth Animations**: Built-in transitions for better UX

### Custom Styling

You can customize the appearance by modifying the CSS classes in the component or by extending the Tailwind configuration.

## Accessibility

The modal is built with accessibility in mind:

- **Focus Management**: Automatically manages focus when opening/closing
- **Keyboard Navigation**: Supports Escape key to close
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Works with high contrast themes

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Dependencies

- React 17+
- @headlessui/react
- @heroicons/react
- Tailwind CSS

## Examples

See the following files for complete examples:

- `PurchaseConfirmationDemo.js` - Standalone demo with all states
- `CourseDetailWithModal.js` - Integration example with course detail page

## Contributing

When contributing to this component:

1. Follow the existing code style
2. Add proper TypeScript types if applicable
3. Test all modal states
4. Ensure accessibility compliance
5. Update this documentation

## License

This component is part of the online learning platform and follows the same license terms.
