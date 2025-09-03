# Complete Purchase Flow Testing Guide

## 🎯 Overview
This guide provides comprehensive testing instructions for the complete purchase flow in the online learning platform, from frontend user interaction to backend payment processing and enrollment creation.

## ✅ Current Status
All major components have been implemented and are ready for testing:

- ✅ **Buy Course Button** - Implemented in course details page
- ✅ **Purchase Confirmation Modal** - Full-featured modal with multiple states
- ✅ **Course Purchase API** - Complete Stripe integration with webhook handling
- ✅ **Enrollment Update** - Automatic enrollment creation after successful payment
- ✅ **Purchase History** - Integrated into user profile with filtering and pagination

## 🚀 Quick Start Testing

### 1. Start the Application
```bash
# Terminal 1: Start the backend server
cd server
npm start

# Terminal 2: Start the frontend
cd client
npm start
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001/api-docs

## 🧪 Testing Scenarios

### Scenario 1: Complete Purchase Flow (Happy Path)

#### Step 1: User Registration/Login
1. Navigate to http://localhost:3000
2. Click "Sign Up" or "Login"
3. Create a new account or login with existing credentials
4. Verify you're redirected to the dashboard

#### Step 2: Browse and Select Course
1. Navigate to "Courses" section
2. Find a paid course (price > $0)
3. Click on the course to view details
4. Verify the "Buy Course - $X" button is visible

#### Step 3: Initiate Purchase
1. Click the "Buy Course" button
2. Verify the loading state appears
3. You should be redirected to Stripe checkout (or see demo modal)

#### Step 4: Complete Payment (Demo Mode)
Since this is in demo mode, you'll see a purchase confirmation modal instead of actual Stripe checkout:
1. The modal should show "Payment Successful"
2. Verify course details are displayed
3. Test the action buttons:
   - "Start Learning" → Should navigate to course
   - "View My Courses" → Should show enrolled courses
   - "Browse More Courses" → Should return to course list

#### Step 5: Verify Enrollment
1. Navigate to "My Courses" or "Profile"
2. Verify the purchased course appears in your enrolled courses
3. Check that the course status is "Active"

#### Step 6: Check Purchase History
1. Go to Profile → Purchase History tab
2. Verify the purchase appears in the list
3. Check payment details (amount, date, status)
4. Test filtering by status (succeeded, pending, failed)

### Scenario 2: Free Course Enrollment

#### Step 1: Find Free Course
1. Browse courses and find one with $0 price
2. Click on the course details

#### Step 2: Enroll in Free Course
1. Verify "Enroll Now - Free" button is visible
2. Click the button
3. Verify immediate enrollment without payment flow

### Scenario 3: Error Handling

#### Test Invalid Course
1. Try to access a non-existent course ID
2. Verify appropriate error message

#### Test Already Enrolled Course
1. Try to purchase a course you're already enrolled in
2. Verify "Already Enrolled" message appears

#### Test Payment Cancellation
1. Start a purchase flow
2. Cancel at any point
3. Verify no enrollment is created

## 🔧 Backend API Testing

### Test Payment Endpoints

#### 1. Create Checkout Session
```bash
curl -X POST http://localhost:5001/api/payments/checkout/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### 2. Get Payment Status
```bash
curl -X GET http://localhost:5001/api/payments/status/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Get Payment History
```bash
curl -X GET http://localhost:5001/api/payments/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Webhook Integration

#### Using Stripe CLI (Recommended)
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5001/api/payments/webhook

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## 🎨 Frontend Component Testing

### Test Purchase Confirmation Modal States

The modal supports multiple states for comprehensive testing:

#### Success State
```javascript
// In browser console on course detail page
// Trigger success modal
showDemoModal('succeeded');
```

#### Pending State
```javascript
// Trigger pending modal
showDemoModal('pending');
```

#### Failed State
```javascript
// Trigger failed modal
showDemoModal('failed');
```

### Test Purchase History Component

1. Navigate to Profile → Purchase History
2. Test filtering by status
3. Test pagination (if multiple purchases exist)
4. Verify responsive design on mobile

## 🐛 Common Issues and Solutions

### Issue: Server not starting on port 5000
**Solution**: The server automatically uses port 5001 if 5000 is occupied (common on macOS due to AirPlay)

### Issue: Stripe integration not working
**Solution**: 
1. Check environment variables in `.env` file
2. Ensure Stripe keys are set correctly
3. Use test keys (sk_test_...) for development

### Issue: Webhook not receiving events
**Solution**:
1. Use Stripe CLI for local testing
2. Check webhook endpoint URL in Stripe dashboard
3. Verify webhook secret is configured

### Issue: Enrollment not created after payment
**Solution**:
1. Check webhook logs in server console
2. Verify database connection
3. Check enrollment creation logic in webhook handler

## 📊 Test Data and Scenarios

### Test Users
- **Student**: testuser@example.com / password123
- **Admin**: admin@learningplatform.com / admin123

### Test Courses
- **Paid Course**: $99.99 - "Complete Purchase Flow Test Course"
- **Free Course**: $0 - Any course with zero price

### Test Payment Cards (Stripe Test Mode)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

## 🔍 Monitoring and Debugging

### Server Logs
Monitor server console for:
- Payment processing logs
- Webhook event processing
- Database operations
- Error messages

### Browser Developer Tools
Check:
- Network requests to payment endpoints
- Console errors
- Local storage for authentication tokens

### Stripe Dashboard
Monitor:
- Test payments in Stripe dashboard
- Webhook delivery status
- Payment intent status

## ✅ Success Criteria

A successful test should verify:

1. **Frontend Flow**:
   - ✅ Buy Course button appears for paid courses
   - ✅ Purchase confirmation modal displays correctly
   - ✅ User can navigate through modal actions
   - ✅ Purchase history shows in profile

2. **Backend Flow**:
   - ✅ Checkout session creation works
   - ✅ Payment status tracking functions
   - ✅ Webhook processing creates enrollments
   - ✅ Payment history API returns data

3. **Integration**:
   - ✅ Frontend and backend communicate properly
   - ✅ Database updates reflect user actions
   - ✅ Error handling works gracefully
   - ✅ User experience is smooth and intuitive

## 🚀 Next Steps

After successful testing:

1. **Production Setup**:
   - Configure production Stripe keys
   - Set up production webhook endpoints
   - Configure production database

2. **Performance Testing**:
   - Load test payment endpoints
   - Test concurrent user purchases
   - Monitor webhook processing performance

3. **Security Review**:
   - Validate payment data handling
   - Review webhook signature verification
   - Check for sensitive data exposure

## 📞 Support

If you encounter issues during testing:

1. Check server logs for error messages
2. Verify environment configuration
3. Test individual components separately
4. Use browser developer tools for debugging
5. Check Stripe dashboard for payment status

---

**Happy Testing! 🎉**

The complete purchase flow is now ready for comprehensive testing. All major components are implemented and integrated, providing a robust foundation for your online learning platform's payment system.
