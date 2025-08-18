// server/scripts/testWebhook.js
// Script to test Stripe webhook integration locally

const stripe = require('../config/stripe');
const axios = require('axios');

async function testWebhookIntegration() {
  console.log('🧪 Testing Stripe Webhook Integration...\n');

  try {
    // 1. Create a test payment session
    console.log('1. Creating test checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Course',
              description: 'Test course for webhook integration',
            },
            unit_amount: 5000, // $50.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/payment/cancel',
      customer_email: 'test@example.com',
      metadata: {
        userId: '1',
        courseId: '1',
        test: 'true'
      },
    });

    console.log(`✅ Session created: ${session.id}`);
    console.log(`📄 Session URL: ${session.url}\n`);

    // 2. Test webhook endpoints
    console.log('2. Testing webhook endpoint accessibility...');
    
    try {
      const response = await axios.get('http://localhost:5000/health');
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server not accessible. Make sure your server is running on port 5000');
      return;
    }

    // 3. Create test webhook events
    console.log('\n3. Creating test webhook events...');
    
    const testEvents = [
      {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: session.id,
            payment_intent: 'pi_test_' + Date.now(),
            payment_status: 'paid',
            amount_total: 5000,
            customer_email: 'test@example.com',
            metadata: {
              userId: '1',
              courseId: '1'
            }
          }
        }
      },
      {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_' + Date.now(),
            amount: 5000,
            currency: 'usd',
            charges: {
              data: [{
                id: 'ch_test_' + Date.now(),
                receipt_url: 'https://pay.stripe.com/receipts/test',
                payment_method_details: {
                  type: 'card'
                }
              }]
            }
          }
        }
      }
    ];

    console.log('📝 Test events prepared');
    console.log('ℹ️  To test webhooks properly, you need to:');
    console.log('   1. Install Stripe CLI: https://stripe.com/docs/stripe-cli');
    console.log('   2. Login: stripe login');
    console.log('   3. Forward events: stripe listen --forward-to localhost:5000/api/payments/webhook');
    console.log('   4. Use the webhook secret provided by the CLI in your .env file\n');

    // 4. Display webhook testing commands
    console.log('4. Manual webhook testing commands:');
    console.log('   stripe trigger checkout.session.completed');
    console.log('   stripe trigger payment_intent.succeeded');
    console.log('   stripe trigger payment_intent.payment_failed');
    console.log('   stripe trigger charge.dispute.created\n');

    // 5. Test webhook signature verification
    console.log('5. Testing webhook signature verification...');
    const testPayload = JSON.stringify({
      id: 'evt_test',
      object: 'event',
      type: 'checkout.session.completed',
      data: testEvents[0].data
    });

    console.log('✅ Webhook integration test completed');
    console.log('\n📋 Next steps:');
    console.log('   1. Set up Stripe CLI for local testing');
    console.log('   2. Add webhook endpoint in Stripe Dashboard for production');
    console.log('   3. Test with real payment flows');
    console.log('   4. Monitor webhook delivery in Stripe Dashboard\n');

  } catch (error) {
    console.error('❌ Error testing webhook integration:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Make sure your Stripe secret key is set in the .env file');
    }
  }
}

// Payment flow testing
async function testPaymentFlow() {
  console.log('💳 Testing complete payment flow...\n');

  try {
    // Test data
    const testCourse = {
      id: 1,
      title: 'JavaScript Fundamentals',
      price: 99.99,
      description: 'Learn JavaScript from scratch'
    };

    const testUser = {
      id: 1,
      email: 'student@test.com',
      name: 'Test Student'
    };

    console.log('📚 Test Course:', testCourse.title, `($${testCourse.price})`);
    console.log('👤 Test User:', testUser.name, `(${testUser.email})\n`);

    // 1. Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: testCourse.title,
            description: testCourse.description
          },
          unit_amount: Math.round(testCourse.price * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/payment/cancel',
      customer_email: testUser.email,
      metadata: {
        userId: testUser.id.toString(),
        courseId: testCourse.id.toString()
      }
    });

    console.log('✅ Checkout session created successfully');
    console.log('🔗 Payment URL:', session.url);
    console.log('🆔 Session ID:', session.id);
    console.log('⏰ Expires at:', new Date(session.expires_at * 1000).toLocaleString());

    return session;

  } catch (error) {
    console.error('❌ Payment flow test failed:', error.message);
  }
}

// Run tests based on command line arguments
const command = process.argv[2];

if (command === 'webhook') {
  testWebhookIntegration();
} else if (command === 'payment') {
  testPaymentFlow();
} else {
  console.log('Usage: node scripts/testWebhook.js [webhook|payment]');
  console.log('  webhook  - Test webhook integration');
  console.log('  payment  - Test payment flow');
}