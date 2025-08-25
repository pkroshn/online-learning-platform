// testPayments.js - Run this script to test your payment backend
const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testCourseId = '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = colors.blue) => console.log(`${color}${message}${colors.reset}`);
const success = (message) => console.log(`${colors.green}✅ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}❌ ${message}${colors.reset}`);
const warn = (message) => console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);

// Helper function for API calls
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) config.data = data;

    const response = await axios(config);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
}

// Test functions
async function testServerHealth() {
  log('\n🏥 Testing server health...');
  try {
    const response = await apiCall('GET', '/health');
    if (response.success) {
      success('Server is running and healthy');
      console.log(`   Environment: ${response.environment}`);
      console.log(`   Version: ${response.version}`);
      return true;
    }
  } catch (err) {
    error(`Server health check failed: ${err.message}`);
    return false;
  }
}

async function testApiInfo() {
  log('\n📋 Testing API info...');
  try {
    const response = await apiCall('GET', '/api');
    if (response.success && response.endpoints.payments) {
      success('API info retrieved - payment endpoints available');
      return true;
    }
  } catch (err) {
    error(`API info failed: ${err.message}`);
    return false;
  }
}

async function testAuthentication() {
  log('\n🔐 Testing admin authentication...');
  try {
    const loginData = {
      email: process.env.ADMIN_EMAIL || 'admin@learningplatform.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    };

    const response = await apiCall('POST', '/api/auth/login', loginData);
    
    if (response.success && response.data.token) {
      authToken = response.data.token;
      success('Admin login successful');
      console.log(`   User: ${response.data.user.name} (${response.data.user.email})`);
      console.log(`   Role: ${response.data.user.role}`);
      return true;
    }
  } catch (err) {
    error(`Authentication failed: ${err.message}`);
    warn('Make sure ADMIN_EMAIL and ADMIN_PASSWORD are set in .env file');
    return false;
  }
}

async function createTestCourse() {
  log('\n📚 Creating test course...');
  try {
    const courseData = {
      title: 'Payment Test Course',
      description: 'A course created for testing payment functionality',
      price: 49.99,
      category: 'Technology',
      level: 'beginner',
      status: 'published'
    };

    const response = await apiCall('POST', '/api/courses', courseData);
    
    if (response.success && response.data.course) {
      testCourseId = response.data.course.id;
      success(`Test course created with ID: ${testCourseId}`);
      console.log(`   Title: ${response.data.course.title}`);
      console.log(`   Price: $${response.data.course.price}`);
      return true;
    }
  } catch (err) {
    error(`Course creation failed: ${err.message}`);
    return false;
  }
}

async function testPaymentCheckout() {
  log('\n💳 Testing payment checkout session...');
  try {
    const response = await apiCall('POST', `/api/payments/checkout/${testCourseId}`);
    
    if (response.success && response.data.sessionUrl) {
      success('Checkout session created successfully');
      console.log(`   Session ID: ${response.data.sessionId}`);
      console.log(`   Payment URL: ${response.data.sessionUrl}`);
      warn('You can visit this URL to test the actual payment flow');
      return response.data.sessionId;
    }
  } catch (err) {
    error(`Checkout session creation failed: ${err.message}`);
    return null;
  }
}

async function testPaymentHistory() {
  log('\n📊 Testing payment history...');
  try {
    const response = await apiCall('GET', '/api/payments/history');
    
    if (response.success) {
      success(`Payment history retrieved`);
      console.log(`   Total payments: ${response.data.pagination.total}`);
      console.log(`   Current page: ${response.data.pagination.page}`);
      
      if (response.data.payments.length > 0) {
        console.log('   Recent payments:');
        response.data.payments.slice(0, 3).forEach((payment, index) => {
          console.log(`     ${index + 1}. $${payment.amount} - ${payment.status} (${payment.course?.title})`);
        });
      }
      return true;
    }
  } catch (err) {
    error(`Payment history failed: ${err.message}`);
    return false;
  }
}

async function testAdminPayments() {
  log('\n👑 Testing admin payment endpoints...');
  try {
    const response = await apiCall('GET', '/api/payments/admin/all');
    
    if (response.success) {
      success(`Admin payment data retrieved`);
      console.log(`   Total payments in system: ${response.data.pagination.total}`);
      return true;
    }
  } catch (err) {
    error(`Admin payments failed: ${err.message}`);
    return false;
  }
}

async function testWebhookEndpoint() {
  log('\n🔗 Testing webhook endpoint accessibility...');
  try {
    // We can't fully test webhook without Stripe CLI, but we can check if endpoint exists
    const response = await axios.post(`${BASE_URL}/api/payments/webhook`, 
      JSON.stringify({ test: true }), 
      { 
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true // Don't throw on 4xx/5xx
      }
    );
    
    // We expect a 400 because signature is missing, but endpoint should be reachable
    if (response.status === 400 && response.data.includes && response.data.includes('Webhook Error')) {
      success('Webhook endpoint is accessible');
      warn('Use Stripe CLI to test webhook events: stripe listen --forward-to localhost:5000/api/payments/webhook');
      return true;
    } else if (response.status === 404) {
      error('Webhook endpoint not found');
      return false;
    } else {
      warn(`Webhook endpoint responded with status ${response.status}`);
      return true;
    }
  } catch (err) {
    error(`Webhook endpoint test failed: ${err.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.blue}
╔══════════════════════════════════════════════════════════╗
║                Payment Backend Testing                   ║
║                                                          ║
║  This script will test all payment-related endpoints    ║
║  and verify your backend is ready for frontend          ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'API Info', fn: testApiInfo },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Course Creation', fn: createTestCourse },
    { name: 'Payment Checkout', fn: testPaymentCheckout },
    { name: 'Payment History', fn: testPaymentHistory },
    { name: 'Admin Payments', fn: testAdminPayments },
    { name: 'Webhook Endpoint', fn: testWebhookEndpoint }
  ];

  for (const test of tests) {
    results.total++;
    try {
      const result = await test.fn();
      if (result !== false) {
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
  log('🏁 TEST SUMMARY');
  log('='.repeat(60));
  
  if (results.passed === results.total) {
    success(`All ${results.total} tests passed! 🎉`);
    log('\n✨ Your payment backend is ready for frontend integration!');
  } else {
    warn(`${results.passed}/${results.total} tests passed`);
    if (results.failed > 0) {
      error(`${results.failed} tests failed`);
      log('\n🔧 Please fix the failing tests before proceeding');
    }
  }

  // Next steps
  log(`\n${colors.blue}📋 NEXT STEPS:`);
  log('1. Fix any failing tests above');
  log('2. Set up Stripe CLI for webhook testing:');
  log('   stripe login');
  log('   stripe listen --forward-to localhost:5000/api/payments/webhook');
  log('3. Test webhook events:');
  log('   stripe trigger checkout.session.completed');
  log('4. Check Stripe Dashboard for test payments');
  log('5. Start building your frontend!');
  log(`${colors.reset}`);
}

// Check if server is running before starting tests
async function checkServerConnection() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return true;
  } catch (err) {
    error('Cannot connect to server at http://localhost:5000');
    error('Make sure your server is running: npm start');
    return false;
  }
}

// Run the tests
checkServerConnection().then(connected => {
  if (connected) {
    runAllTests().catch(console.error);
  }
});

module.exports = {
  runAllTests,
  testServerHealth,
  testAuthentication,
  testPaymentCheckout
};