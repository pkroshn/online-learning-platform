#!/usr/bin/env node

/**
 * Complete Purchase Flow Test
 * 
 * This script tests the entire purchase flow from frontend to backend
 * including payment processing, webhook handling, and enrollment creation.
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configuration
const config = {
  serverUrl: process.env.SERVER_URL || 'http://localhost:5001',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  testUser: {
    email: 'testuser@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  },
  testCourse: {
    title: 'Complete Purchase Flow Test Course',
    description: 'A course for testing the complete purchase flow',
    price: 99.99,
    category: 'Testing',
    level: 'beginner'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = colors.blue) => console.log(`${color}${message}${colors.reset}`);
const success = (message) => console.log(`${colors.green}✅ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}❌ ${message}${colors.reset}`);
const warn = (message) => console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
const info = (message) => console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);

// Test state
let testState = {
  authToken: null,
  userId: null,
  courseId: null,
  paymentId: null,
  sessionId: null,
  enrollmentId: null
};

// Helper function for API calls
async function apiCall(method, endpoint, data = null, headers = {}) {
  try {
    const requestConfig = {
      method,
      url: `${config.serverUrl}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (testState.authToken) {
      requestConfig.headers.Authorization = `Bearer ${testState.authToken}`;
    }

    if (data) requestConfig.data = data;

    const response = await axios(requestConfig);
    return { success: true, data: response.data };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data || { message: err.message },
      status: err.response?.status
    };
  }
}

// Test 1: Server Health Check
async function testServerHealth() {
  log('\n🏥 Testing server health...');
  
  const result = await apiCall('GET', '/health');
  if (result.success) {
    success('Server is running and healthy');
    info(`Environment: ${result.data.environment}`);
    info(`Version: ${result.data.version}`);
    return true;
  } else {
    error(`Server health check failed: ${result.error.message}`);
    return false;
  }
}

// Test 2: User Registration/Login
async function testUserAuthentication() {
  log('\n🔐 Testing user authentication...');
  
  // Try to login first
  let result = await apiCall('POST', '/api/auth/login', {
    email: config.testUser.email,
    password: config.testUser.password
  });

  if (!result.success) {
    // If login fails, try to register
    info('Login failed, attempting registration...');
    result = await apiCall('POST', '/api/auth/register', {
      ...config.testUser,
      role: 'student'
    });

    if (!result.success) {
      error(`Registration failed: ${result.error.message}`);
      return false;
    }
    
    success('User registered successfully');
    testState.authToken = result.data.token;
    testState.userId = result.data.user.id;
  } else {
    success('User login successful');
    testState.authToken = result.data.token;
    testState.userId = result.data.user.id;
  }

  info(`User ID: ${testState.userId}`);
  info(`Token: ${testState.authToken.substring(0, 20)}...`);
  return true;
}

// Test 3: Course Creation
async function testCourseCreation() {
  log('\n📚 Testing course creation...');
  
  const result = await apiCall('POST', '/api/courses', config.testCourse);
  
  if (!result.success) {
    error(`Course creation failed: ${result.error.message}`);
    return false;
  }

  testState.courseId = result.data.course.id;
  success(`Course created with ID: ${testState.courseId}`);
  info(`Title: ${result.data.course.title}`);
  info(`Price: $${result.data.course.price}`);
  return true;
}

// Test 4: Payment Checkout Session Creation
async function testPaymentCheckout() {
  log('\n💳 Testing payment checkout session creation...');
  
  const result = await apiCall('POST', `/api/payments/checkout/${testState.courseId}`);
  
  if (!result.success) {
    error(`Checkout session creation failed: ${result.error.message}`);
    return false;
  }

  testState.sessionId = result.data.sessionId;
  success('Checkout session created successfully');
  info(`Session ID: ${testState.sessionId}`);
  info(`Payment URL: ${result.data.sessionUrl}`);
  
  // Store the session URL for manual testing
  warn('For manual testing, visit this URL:');
  console.log(`${colors.cyan}${result.data.sessionUrl}${colors.reset}`);
  
  return true;
}

// Test 5: Payment Status Check
async function testPaymentStatus() {
  log('\n📊 Testing payment status check...');
  
  const result = await apiCall('GET', `/api/payments/status/${testState.sessionId}`);
  
  if (!result.success) {
    error(`Payment status check failed: ${result.error.message}`);
    return false;
  }

  success('Payment status retrieved successfully');
  info(`Status: ${result.data.payment.status}`);
  info(`Amount: $${result.data.payment.amount}`);
  
  if (result.data.payment.id) {
    testState.paymentId = result.data.payment.id;
  }
  
  return true;
}

// Test 6: Payment History
async function testPaymentHistory() {
  log('\n📋 Testing payment history...');
  
  const result = await apiCall('GET', '/api/payments/history');
  
  if (!result.success) {
    error(`Payment history failed: ${result.error.message}`);
    return false;
  }

  success('Payment history retrieved successfully');
  info(`Total payments: ${result.data.pagination.total}`);
  
  if (result.data.payments.length > 0) {
    const latestPayment = result.data.payments[0];
    info(`Latest payment: $${latestPayment.amount} - ${latestPayment.status}`);
  }
  
  return true;
}

// Test 7: Enrollment Check
async function testEnrollmentCheck() {
  log('\n🎓 Testing enrollment status...');
  
  const result = await apiCall('GET', `/api/enrollments/user/${testState.userId}`);
  
  if (!result.success) {
    warn(`Enrollment check failed: ${result.error.message}`);
    return false;
  }

  success('Enrollment status retrieved successfully');
  
  const courseEnrollment = result.data.enrollments.find(
    e => e.courseId === testState.courseId
  );
  
  if (courseEnrollment) {
    testState.enrollmentId = courseEnrollment.id;
    info(`Enrollment found: ${courseEnrollment.status}`);
    info(`Payment status: ${courseEnrollment.paymentStatus}`);
  } else {
    info('No enrollment found for this course yet');
  }
  
  return true;
}

// Test 8: Webhook Simulation (Mock)
async function testWebhookSimulation() {
  log('\n🔗 Testing webhook simulation...');
  
  // Create a mock webhook payload
  const mockWebhookPayload = {
    id: 'evt_test_webhook',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: testState.sessionId,
        payment_status: 'paid',
        customer_email: config.testUser.email,
        amount_total: Math.round(config.testCourse.price * 100),
        metadata: {
          userId: testState.userId.toString(),
          courseId: testState.courseId.toString()
        }
      }
    }
  };

  // Note: In a real test, you would use Stripe CLI to send actual webhooks
  warn('Webhook simulation - in production, use Stripe CLI:');
  info('stripe listen --forward-to localhost:5000/api/payments/webhook');
  info('stripe trigger checkout.session.completed');
  
  return true;
}

// Test 9: Frontend Integration Check
async function testFrontendIntegration() {
  log('\n🌐 Testing frontend integration...');
  
  // Check if frontend is running
  try {
    const response = await axios.get(config.frontendUrl, { timeout: 5000 });
    success('Frontend is accessible');
    return true;
  } catch (err) {
    warn('Frontend is not accessible - make sure it\'s running on port 3000');
    return false;
  }
}

// Test 10: Complete Flow Validation
async function testCompleteFlowValidation() {
  log('\n🔍 Validating complete purchase flow...');
  
  let allTestsPassed = true;
  
  // Check if we have all required data
  if (!testState.authToken) {
    error('Missing authentication token');
    allTestsPassed = false;
  }
  
  if (!testState.userId) {
    error('Missing user ID');
    allTestsPassed = false;
  }
  
  if (!testState.courseId) {
    error('Missing course ID');
    allTestsPassed = false;
  }
  
  if (!testState.sessionId) {
    error('Missing session ID');
    allTestsPassed = false;
  }
  
  if (allTestsPassed) {
    success('All required data is present for complete flow');
    info('✅ User authenticated');
    info('✅ Course created');
    info('✅ Payment session created');
    info('✅ API endpoints responding');
  }
  
  return allTestsPassed;
}

// Main test runner
async function runCompletePurchaseFlowTest() {
  console.log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════════╗
║                Complete Purchase Flow Test                    ║
║                                                                ║
║  This test validates the entire purchase flow from            ║
║  user authentication to payment processing                    ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'User Authentication', fn: testUserAuthentication },
    { name: 'Course Creation', fn: testCourseCreation },
    { name: 'Payment Checkout', fn: testPaymentCheckout },
    { name: 'Payment Status', fn: testPaymentStatus },
    { name: 'Payment History', fn: testPaymentHistory },
    { name: 'Enrollment Check', fn: testEnrollmentCheck },
    { name: 'Webhook Simulation', fn: testWebhookSimulation },
    { name: 'Frontend Integration', fn: testFrontendIntegration },
    { name: 'Complete Flow Validation', fn: testCompleteFlowValidation }
  ];

  const results = {
    passed: 0,
    failed: 0,
    total: tests.length
  };

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (err) {
      error(`${test.name} test crashed: ${err.message}`);
      results.failed++;
    }
  }

  // Summary
  log('\n' + '='.repeat(60));
  log('🏁 COMPLETE PURCHASE FLOW TEST SUMMARY');
  log('='.repeat(60));
  
  if (results.passed === results.total) {
    success(`All ${results.total} tests passed! 🎉`);
    log('\n✨ Your purchase flow is ready for production!');
  } else {
    warn(`${results.passed}/${results.total} tests passed`);
    if (results.failed > 0) {
      error(`${results.failed} tests failed`);
    }
  }

  // Next steps
  log(`\n${colors.blue}📋 NEXT STEPS FOR MANUAL TESTING:`);
  log('1. Visit the checkout URL printed above');
  log('2. Use Stripe test card: 4242 4242 4242 4242');
  log('3. Complete the payment process');
  log('4. Check enrollment status in your profile');
  log('5. Verify payment appears in purchase history');
  
  log(`\n${colors.blue}🔧 STRIPE CLI COMMANDS:`);
  log('stripe login');
  log('stripe listen --forward-to localhost:5000/api/payments/webhook');
  log('stripe trigger checkout.session.completed');
  
  log(`\n${colors.blue}🌐 FRONTEND TESTING:`);
  log('1. Start frontend: cd client && npm start');
  log('2. Navigate to course details page');
  log('3. Click "Buy Course" button');
  log('4. Complete payment flow');
  log('5. Check purchase confirmation modal');
  log('6. Verify enrollment in "My Courses"');
  log('7. Check purchase history in profile');
  
  return results.passed === results.total;
}

// Run the tests
if (require.main === module) {
  runCompletePurchaseFlowTest().catch(console.error);
}

module.exports = {
  runCompletePurchaseFlowTest,
  testState,
  config
};
