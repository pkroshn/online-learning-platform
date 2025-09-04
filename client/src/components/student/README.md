# Student Components

This directory contains components specifically designed for student users of the online learning platform.

## PurchaseHistory Component

The `PurchaseHistory` component provides a comprehensive view of a user's course purchase history with filtering, pagination, and status indicators.

### Features

- **Status-based Filtering**: Filter purchases by payment status (succeeded, pending, failed, canceled, refunded)
- **Pagination**: Navigate through large numbers of purchases with configurable page sizes
- **Status Indicators**: Visual status indicators with appropriate colors and icons
- **Responsive Design**: Works seamlessly on all device sizes
- **Real-time Data**: Integrates with Redux store for live data updates
- **Currency Formatting**: Automatic currency formatting based on payment currency
- **Date Formatting**: Human-readable date and time display

### Usage

#### Basic Integration

```jsx
import PurchaseHistory from '../components/student/PurchaseHistory';

const ProfilePage = () => {
  return (
    <div>
      <h1>User Profile</h1>
      <PurchaseHistory />
    </div>
  );
};
```

#### With Redux Integration

```jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPaymentHistory } from '../store/slices/paymentsSlice';
import PurchaseHistory from '../components/student/PurchaseHistory';

const ProfilePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  return (
    <div>
      <h1>User Profile</h1>
      <PurchaseHistory />
    </div>
  );
};
```

### Redux Store Requirements

The component requires the following Redux store structure:

#### State Shape

```javascript
{
  payments: {
    paymentHistory: [], // Array of payment objects
    loading: false,     // Loading state
    error: null,        // Error state
    pagination: {       // Pagination information
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
    filters: {          // Current filters
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    }
  }
}
```

#### Required Actions

- `fetchPaymentHistory(params)` - Async thunk to fetch payment history
- `setFilters(filters)` - Set filter criteria
- `resetFilters()` - Reset filters to default values
- `clearPaymentHistory()` - Clear payment history data

#### Required Selectors

- `selectPaymentHistory` - Get payment history array
- `selectPaymentsLoading` - Get loading state
- `selectPaymentsError` - Get error state
- `selectPaymentsPagination` - Get pagination info
- `selectPaymentsFilters` - Get current filters

### Payment Object Structure

Each payment object should have the following structure:

```javascript
{
  id: number,                    // Unique payment ID
  status: string,               // Payment status
  amount: number,               // Payment amount
  currency: string,             // Currency code (e.g., 'USD')
  paidAt: string,               // ISO date string when payment was made
  paymentMethod: string,        // Payment method used
  receiptUrl: string,           // Optional receipt URL
  course: {                     // Associated course information
    id: number,
    title: string,
    instructor: string
  }
}
```

### Status Types

The component supports the following payment statuses:

- **succeeded** - Payment completed successfully (green)
- **pending** - Payment is being processed (yellow)
- **failed** - Payment failed (red)
- **canceled** - Payment was canceled (orange)
- **refunded** - Payment was refunded (blue)

### Styling

The component uses Tailwind CSS classes and follows the existing design system:

- **Cards**: White background with subtle shadows and borders
- **Status Badges**: Color-coded status indicators
- **Icons**: Heroicons for consistent iconography
- **Responsive Grid**: Adapts to different screen sizes
- **Hover Effects**: Subtle hover animations for better UX

### Customization

#### Filtering

To add custom filters, modify the `filters` state and add corresponding UI elements:

```javascript
// Add new filter
const newFilters = { ...filters, customFilter: value };
dispatch(setFilters(newFilters));
```

#### Pagination

Pagination is handled automatically, but you can customize the page size:

```javascript
dispatch(fetchPaymentHistory({ page: 1, limit: 20 }));
```

#### Status Colors

Status colors can be customized by modifying the `getStatusBadgeClass` function:

```javascript
const getStatusBadgeClass = (status) => {
  const colorMap = {
    succeeded: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    // ... custom colors
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};
```

### Error Handling

The component includes comprehensive error handling:

- **API Errors**: Displays user-friendly error messages
- **Loading States**: Shows loading spinners during data fetching
- **Empty States**: Handles cases with no purchase history
- **Network Issues**: Graceful degradation for offline scenarios

### Performance Considerations

- **Pagination**: Only loads necessary data for current page
- **Memoization**: Uses React.memo for performance optimization
- **Debounced Updates**: Prevents excessive API calls during filtering
- **Lazy Loading**: Loads data only when component is visible

### Testing

The component includes comprehensive test coverage:

- **Unit Tests**: Component rendering and behavior
- **Integration Tests**: Redux store integration
- **User Interaction Tests**: Filtering and pagination
- **Accessibility Tests**: Screen reader compatibility

### Accessibility

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Screen Reader Support**: Semantic HTML structure

### Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Fallbacks**: Graceful degradation for older browsers

### Dependencies

- **React**: 18+ (hooks support required)
- **Redux Toolkit**: For state management
- **Heroicons**: For iconography
- **Tailwind CSS**: For styling
- **date-fns**: For date formatting (optional)

### Future Enhancements

Potential improvements for future versions:

- **Export Functionality**: Download purchase history as CSV/PDF
- **Advanced Filtering**: Date range, amount range, course category
- **Sorting Options**: Sort by date, amount, course title
- **Bulk Actions**: Select multiple payments for actions
- **Search Functionality**: Search through purchase history
- **Analytics**: Spending patterns and insights
- **Notifications**: Payment status change alerts
