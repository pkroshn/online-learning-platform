// server/controllers/webhookController.js
const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');

const webhookController = {
  async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object);
          break;

        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object);
          break;

        case 'charge.dispute.created':
          await handleChargeDispute(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      res.json({ received: true });

    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
};

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('Processing checkout.session.completed:', session.id);

    const payment = await Payment.findOne({
      where: { stripeSessionId: session.id }
    });

    if (!payment) {
      console.error('Payment not found for session:', session.id);
      return;
    }

    // Update payment record
    await payment.update({
      status: 'succeeded',
      stripePaymentIntentId: session.payment_intent,
      paidAt: new Date(),
      metadata: {
        ...payment.metadata,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        paymentStatus: session.payment_status
      }
    });

    // Create enrollment
    const existingEnrollment = await Enrollment.findOne({
      where: {
        userId: payment.userId,
        courseId: payment.courseId
      }
    });

    if (!existingEnrollment) {
      await Enrollment.create({
        userId: payment.userId,
        courseId: payment.courseId,
        enrolledAt: new Date(),
        status: 'active',
        paymentStatus: 'paid'
      });
    } else {
      await existingEnrollment.update({
        status: 'active',
        paymentStatus: 'paid'
      });
    }

    console.log(`Enrollment created for user ${payment.userId} in course ${payment.courseId}`);

  } catch (error) {
    console.error('Error processing checkout.session.completed:', error);
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    console.log('Processing payment_intent.succeeded:', paymentIntent.id);

    const payment = await Payment.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (payment) {
      await payment.update({
        status: 'succeeded',
        paymentMethod: paymentIntent.charges.data[0]?.payment_method_details?.type,
        receiptUrl: paymentIntent.charges.data[0]?.receipt_url,
        paidAt: new Date(),
        metadata: {
          ...payment.metadata,
          chargeId: paymentIntent.charges.data[0]?.id,
          receiptUrl: paymentIntent.charges.data[0]?.receipt_url
        }
      });
    }

  } catch (error) {
    console.error('Error processing payment_intent.succeeded:', error);
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    console.log('Processing payment_intent.payment_failed:', paymentIntent.id);

    const payment = await Payment.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (payment) {
      await payment.update({
        status: 'failed',
        metadata: {
          ...payment.metadata,
          failureCode: paymentIntent.last_payment_error?.code,
          failureMessage: paymentIntent.last_payment_error?.message,
          failedAt: new Date()
        }
      });

      // Update enrollment status if exists
      const enrollment = await Enrollment.findOne({
        where: {
          userId: payment.userId,
          courseId: payment.courseId
        }
      });

      if (enrollment) {
        await enrollment.update({
          paymentStatus: 'failed'
        });
      }
    }

  } catch (error) {
    console.error('Error processing payment_intent.payment_failed:', error);
  }
}

// Handle charge dispute
async function handleChargeDispute(dispute) {
  try {
    console.log('Processing charge.dispute.created:', dispute.id);

    // Find payment by charge ID
    const payment = await Payment.findOne({
      where: {
        metadata: {
          chargeId: dispute.charge
        }
      }
    });

    if (payment) {
      await payment.update({
        metadata: {
          ...payment.metadata,
          dispute: {
            id: dispute.id,
            reason: dispute.reason,
            status: dispute.status,
            amount: dispute.amount,
            created: dispute.created
          }
        }
      });

      // Optionally suspend the enrollment
      const enrollment = await Enrollment.findOne({
        where: {
          userId: payment.userId,
          courseId: payment.courseId
        }
      });

      if (enrollment) {
        await enrollment.update({
          status: 'suspended',
          metadata: {
            ...enrollment.metadata,
            suspendedReason: 'payment_dispute'
          }
        });
      }
    }

  } catch (error) {
    console.error('Error processing charge.dispute.created:', error);
  }
}

// Handle successful invoice payment (for subscriptions)
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log('Processing invoice.payment_succeeded:', invoice.id);
    // Implement subscription payment logic if needed
    
  } catch (error) {
    console.error('Error processing invoice.payment_succeeded:', error);
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('Processing customer.subscription.deleted:', subscription.id);
    // Implement subscription cancellation logic if needed
    
  } catch (error) {
    console.error('Error processing customer.subscription.deleted:', error);
  }
}

module.exports = webhookController;