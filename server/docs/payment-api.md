# Course Purchase API Documentation

## Overview

The Course Purchase API provides a complete solution for handling course purchases, payments, and related analytics. It integrates with Stripe for secure payment processing and includes comprehensive validation and error handling.

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Checkout Session

**POST** `/api/payments/checkout/:courseId`

Creates a Stripe checkout session for course purchase.

#### Parameters
- `courseId` (path, required): Course ID to purchase

#### Response
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "sessionUrl": "https://checkout.stripe.com/..."
  }
}
```

#### Error Responses
```json
{
  "success": false,
  "error": {
    "type": "PAYMENT_ERROR",
    "code": "ALREADY_ENROLLED",
    "message": "You are already enrolled in this course"
  }
}
```

### 2. Get Payment Status

**GET** `/api/payments/status/:sessionId`

Retrieves the status of a payment session.

#### Parameters
- `sessionId` (path, required): Stripe session ID

#### Response
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": 1,
      "status": "succeeded",
      "amount": "99.99",
      "currency": "USD",
      "paidAt": "2024-01-15T10:30:00Z"
    },
    "stripeSession": {
      "status": "complete",
      "amount_total": 9999,
      "customer_email": "user@example.com"
    }
  }
}
```

### 3. Get Payment History

**GET** `/api/payments/history`

Retrieves user's payment history with pagination.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (pending, succeeded, failed, canceled, refunded)

#### Response
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 1,
        "amount": "99.99",
        "currency": "USD",
        "status": "succeeded",
        "paidAt": "2024-01-15T10:30:00Z",
        "course": {
          "id": 1,
          "title": "JavaScript Fundamentals"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3,
      "limit": 10
    }
  }
}
```

### 4. Get All Payments (Admin)

**GET** `/api/payments/admin/all`

Retrieves all payments with filtering and pagination (admin only).

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status
- `courseId` (optional): Filter by course ID
- `userId` (optional): Filter by user ID

#### Response
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 1,
        "amount": "99.99",
        "currency": "USD",
        "status": "succeeded",
        "paidAt": "2024-01-15T10:30:00Z",
        "course": {
          "id": 1,
          "title": "JavaScript Fundamentals"
        },
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 15,
      "limit": 10
    }
  }
}
```

### 5. Refund Payment (Admin)

**POST** `/api/payments/admin/refund/:paymentId`

Processes a refund for a payment (admin only).

#### Parameters
- `paymentId` (path, required): Payment ID to refund

#### Request Body
```json
{
  "amount": 50.00,
  "reason": "Customer requested partial refund"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "refund": {
      "id": "re_...",
      "amount": 5000,
      "status": "succeeded"
    },
    "payment": {
      "id": 1,
      "status": "succeeded",
      "refundAmount": "50.00"
    }
  }
}
```

### 6. Get Payment Analytics (Admin)

**GET** `/api/payments/admin/analytics`

Retrieves payment analytics and revenue data (admin only).

#### Query Parameters
- `period` (optional): Time period (7d, 30d, 90d, 1y, default: 30d)
- `courseId` (optional): Filter by specific course

#### Response
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "summary": {
      "totalRevenue": 15499.50,
      "totalPayments": 125,
      "averageOrderValue": 123.99,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-30T23:59:59Z"
    },
    "revenueByCourse": [
      {
        "courseId": 1,
        "title": "JavaScript Fundamentals",
        "revenue": 5999.50,
        "sales": 60
      }
    ],
    "revenueByCategory": [
      {
        "category": "Programming",
        "revenue": 8999.50,
        "sales": 90
      }
    ],
    "dailyRevenue": [
      {
        "date": "2024-01-15",
        "revenue": 499.99
      }
    ],
    "recentPayments": [
      {
        "id": 1,
        "amount": "99.99",
        "currency": "USD",
        "status": "succeeded",
        "paidAt": "2024-01-15T10:30:00Z",
        "course": {
          "id": 1,
          "title": "JavaScript Fundamentals",
          "category": "Programming"
        },
        "user": {
          "id": 1,
          "name": "John Doe"
        }
      }
    ]
  }
}
```

### 7. Get Course Purchase Statistics (Admin)

**GET** `/api/payments/admin/course/:courseId/stats`

Retrieves detailed statistics for a specific course (admin only).

#### Parameters
- `courseId` (path, required): Course ID

#### Response
```json
{
  "success": true,
  "data": {
    "course": {
      "id": 1,
      "title": "JavaScript Fundamentals",
      "price": "99.99",
      "currency": "USD"
    },
    "statistics": {
      "totalRevenue": 5999.50,
      "totalSales": 60,
      "totalEnrollments": 58,
      "completionRate": 85.5,
      "averageOrderValue": 99.99
    },
    "monthlySales": [
      {
        "month": "2024-01",
        "revenue": 2999.50,
        "sales": 30
      }
    ],
    "recentSales": [
      {
        "id": 1,
        "amount": "99.99",
        "currency": "USD",
        "paidAt": "2024-01-15T10:30:00Z",
        "user": {
          "id": 1,
          "name": "John Doe"
        }
      }
    ]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_COURSE` | Course not found or unavailable |
| `COURSE_INACTIVE` | Course is not available for purchase |
| `COURSE_FULL` | Course has reached maximum capacity |
| `INVALID_USER` | User account not found or inactive |
| `ALREADY_ENROLLED` | User is already enrolled in the course |
| `PENDING_ENROLLMENT` | User has a pending enrollment |
| `INVALID_AMOUNT` | Invalid payment amount |
| `AMOUNT_TOO_LOW` | Payment amount below minimum ($0.50) |
| `AMOUNT_TOO_HIGH` | Payment amount above maximum ($10,000) |
| `INVALID_CURRENCY` | Unsupported currency |
| `PAYMENT_NOT_FOUND` | Payment session not found |
| `SESSION_EXPIRED` | Payment session has expired |
| `PENDING_PAYMENT` | Payment already in progress |
| `STRIPE_ERROR` | Stripe processing error |
| `WEBHOOK_VERIFICATION_FAILED` | Webhook signature verification failed |
| `REFUND_NOT_ALLOWED` | Refund not allowed for this payment |
| `REFUND_TIME_LIMIT_EXCEEDED` | Refund request exceeds time limit |
| `PAYMENT_FAILED` | Payment processing failed |
| `INSUFFICIENT_FUNDS` | Insufficient funds |
| `CARD_DECLINED` | Card was declined |
| `TOO_MANY_REQUESTS` | Rate limit exceeded |

## Webhook Events

The API handles the following Stripe webhook events:

- `checkout.session.completed` - Creates enrollment on successful payment
- `payment_intent.succeeded` - Updates payment status
- `payment_intent.payment_failed` - Handles failed payments
- `charge.dispute.created` - Handles payment disputes
- `invoice.payment_succeeded` - Subscription payments
- `customer.subscription.deleted` - Subscription cancellations

## Security Features

- JWT authentication for all endpoints
- Role-based access control (admin/user)
- Input validation and sanitization
- Rate limiting on payment endpoints
- Webhook signature verification
- Secure error handling (no sensitive data exposure)

## Rate Limits

- Payment creation: 10 requests per minute per user
- Payment status checks: 30 requests per minute per user
- Admin endpoints: 100 requests per minute per admin

## Testing

Use Stripe test keys for development:

```bash
# Test card numbers
4242 4242 4242 4242  # Successful payment
4000 0000 0000 0002  # Declined payment
4000 0000 0000 9995  # Insufficient funds
```

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```
