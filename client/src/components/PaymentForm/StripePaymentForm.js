import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, User, Mail, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const StripePaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    cardholderName: '',
    email: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    amount: 299.00,
    courseTitle: 'Advanced Learning Platform',
    saveCard: false
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  // Get payment intent from server
  useEffect(() => {
    const getPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(formData.amount * 100), // Convert to cents
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } else {
          console.error('Failed to get payment intent');
        }
      } catch (error) {
        console.error('Error getting payment intent:', error);
      }
    };

    getPaymentIntent();
  }, [formData.amount]);

  const handleInputChange = (e) => {
    const target = e.target;
    const { name, value, type, checked } = target;
    
    if (name.startsWith('billingAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: { ...prev.billingAddress, [field]: value }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }

    // Email validation
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Billing address validation
    if (!formData.billingAddress.street.trim()) {
      newErrors['billingAddress.street'] = 'Please enter street address';
    }
    if (!formData.billingAddress.city.trim()) {
      newErrors['billingAddress.city'] = 'Please enter city';
    }
    if (!formData.billingAddress.zipCode.trim()) {
      newErrors['billingAddress.zipCode'] = 'Please enter ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.cardholderName,
            email: formData.email,
            address: {
              line1: formData.billingAddress.street,
              city: formData.billingAddress.city,
              state: formData.billingAddress.state,
              postal_code: formData.billingAddress.zipCode,
              country: formData.billingAddress.country,
            },
          },
        },
      });

      if (error) {
        setPaymentStatus('error');
        console.error('Payment error:', error);
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('success');
        // Here you would typically save the enrollment to your database
        console.log('Payment successful:', paymentIntent);
      }
    } catch (error) {
      setPaymentStatus('error');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setPaymentStatus(null);
    setErrors({});
    setFormData(prev => ({
      ...prev,
      cardholderName: '',
      email: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      },
      saveCard: false
    }));
    // Reset Stripe Elements
    if (elements) {
      elements.getElement(CardElement)?.clear();
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-green-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase of <strong>{formData.courseTitle}</strong>. 
            A confirmation email has been sent to {formData.email}.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/courses')}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse More Courses
            </button>
            <button 
              onClick={resetForm}
              className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Make Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-red-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h3>
          <p className="text-gray-600 mb-6">
            We couldn't process your payment. Please check your card details and try again.
          </p>
          <button 
            onClick={() => setPaymentStatus(null)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-blue-100">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900">{formData.courseTitle}</h3>
          <p className="text-2xl font-bold text-blue-600">${formData.amount.toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Contact Information
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
            Payment Details
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name *
            </label>
            <input
              type="text"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cardholderName ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="John Doe"
            />
            {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information *
            </label>
            <div className="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Billing Address
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              name="billingAddress.street"
              value={formData.billingAddress.street}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors['billingAddress.street'] ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="123 Main Street"
            />
            {errors['billingAddress.street'] && <p className="text-red-500 text-sm mt-1">{errors['billingAddress.street']}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="billingAddress.city"
                value={formData.billingAddress.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors['billingAddress.city'] ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="New York"
              />
              {errors['billingAddress.city'] && <p className="text-red-500 text-sm mt-1">{errors['billingAddress.city']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="billingAddress.state"
                value={formData.billingAddress.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="NY"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                name="billingAddress.zipCode"
                value={formData.billingAddress.zipCode}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors['billingAddress.zipCode'] ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="10001"
              />
              {errors['billingAddress.zipCode'] && <p className="text-red-500 text-sm mt-1">{errors['billingAddress.zipCode']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                name="billingAddress.country"
                value={formData.billingAddress.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Card Option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="saveCard"
            checked={formData.saveCard}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Save this card for future purchases
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
            !stripe || isProcessing
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Processing Payment...
            </div>
          ) : (
            `Pay $${formData.amount.toFixed(2)} Now`
          )}
        </button>

        {/* Security Notice */}
        <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <Lock className="w-4 h-4 inline mr-1" />
          Your payment information is encrypted and secure. We never store your card details.
        </div>
      </form>
    </div>
  );
};

export default StripePaymentForm;
