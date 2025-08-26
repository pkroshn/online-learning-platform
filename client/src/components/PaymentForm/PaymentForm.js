import React, { useState } from 'react';
import { CreditCard, Lock, User, Mail, MapPin } from 'lucide-react';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
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

  // Card type detection
  const getCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    // Visa
    if (/^4/.test(cleanNumber)) return 'visa';
    // Mastercard
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'mastercard';
    // American Express
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    // Discover
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    // JCB
    if (/^35/.test(cleanNumber)) return 'jcb';
    // Diners Club
    if (/^3[0689]/.test(cleanNumber)) return 'diners';
    
    return 'unknown';
  };

  // Card type configurations
  const cardTypes = {
    visa: {
      name: 'Visa',
      color: 'bg-blue-600',
      logo: (
        <div className="text-white font-bold text-sm px-2 py-1 rounded">
          VISA
        </div>
      ),
      maxLength: 16,
      cvvLength: 3
    },
    mastercard: {
      name: 'Mastercard',
      color: 'bg-red-600',
      logo: (
        <div className="flex">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <div className="w-4 h-4 bg-yellow-500 rounded-full -ml-2"></div>
        </div>
      ),
      maxLength: 16,
      cvvLength: 3
    },
    amex: {
      name: 'American Express',
      color: 'bg-green-600',
      logo: (
        <div className="text-white font-bold text-xs px-1 py-1 rounded">
          AMEX
        </div>
      ),
      maxLength: 15,
      cvvLength: 4
    },
    discover: {
      name: 'Discover',
      color: 'bg-orange-600',
      logo: (
        <div className="text-white font-bold text-xs px-1 py-1 rounded">
          DISC
        </div>
      ),
      maxLength: 16,
      cvvLength: 3
    },
    jcb: {
      name: 'JCB',
      color: 'bg-purple-600',
      logo: (
        <div className="text-white font-bold text-xs px-2 py-1 rounded">
          JCB
        </div>
      ),
      maxLength: 16,
      cvvLength: 3
    },
    diners: {
      name: 'Diners Club',
      color: 'bg-gray-600',
      logo: (
        <div className="text-white font-bold text-xs px-1 py-1 rounded">
          DC
        </div>
      ),
      maxLength: 14,
      cvvLength: 3
    },
    unknown: {
      name: 'Card',
      color: 'bg-gray-400',
      logo: <CreditCard className="w-5 h-5 text-white" />,
      maxLength: 16,
      cvvLength: 3
    }
  };

  const currentCardType = getCardType(formData.cardNumber);
  const cardConfig = cardTypes[currentCardType];

  // Format card number with spaces based on card type
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const maxLength = cardConfig.maxLength;
    const trimmed = v.slice(0, maxLength);
    
    // American Express format: 4-6-5
    if (currentCardType === 'amex') {
      const match = trimmed.match(/(\d{1,4})(\d{0,6})(\d{0,5})/);
      if (match) {
        const parts = [match[1], match[2], match[3]].filter(part => part.length > 0);
        return parts.join(' ');
      }
      return trimmed;
    }
    
    // Diners Club format: 4-6-4
    if (currentCardType === 'diners') {
      const match = trimmed.match(/(\d{1,4})(\d{0,6})(\d{0,4})/);
      if (match) {
        const parts = [match[1], match[2], match[3]].filter(part => part.length > 0);
        return parts.join(' ');
      }
      return trimmed;
    }
    
    // Standard format: 4-4-4-4
    const parts = [];
    for (let i = 0; i < trimmed.length; i += 4) {
      parts.push(trimmed.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  // Format expiry date MM/YY
  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleInputChange = (e) => {
    const target = e.target;
    const { name, value, type, checked } = target;
    
    if (name === 'cardNumber') {
      setFormData(prev => ({ ...prev, [name]: formatCardNumber(value) }));
    } else if (name === 'expiryDate') {
      setFormData(prev => ({ ...prev, [name]: formatExpiryDate(value) }));
    } else if (name === 'cvv') {
      const maxCvvLength = cardConfig.cvvLength;
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, maxCvvLength) }));
    } else if (name.startsWith('billingAddress.')) {
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

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    // Luhn algorithm for card validation
    let sum = 0;
    let alternate = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cleanNumber.charAt(i), 10);
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return sum % 10 === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    // Card number validation
    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!formData.cardNumber || cleanCardNumber.length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Expiry date validation
    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter expiry date (MM/YY)';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation
    const requiredCvvLength = cardConfig.cvvLength;
    if (!formData.cvv || formData.cvv.length < requiredCvvLength) {
      newErrors.cvv = `Please enter a valid ${requiredCvvLength}-digit CVV`;
    }

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success (90% success rate)
      if (Math.random() > 0.1) {
        setPaymentStatus('success');
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setPaymentStatus(null);
    setErrors({});
    setFormData(prev => ({
      ...prev,
      cardNumber: '',
      expiryDate: '',
      cvv: '',
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
  };

  if (paymentStatus === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-blue-100">
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
          <button 
            onClick={resetForm}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-blue-100">
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

      <div className="space-y-6">
        {/* Accepted Cards */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Accepted Payment Methods</h4>
          <div className="flex space-x-2">
            {Object.entries(cardTypes).slice(0, -1).map(([key, card]) => (
              <div
                key={key}
                className={`${card.color} rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-8`}
              >
                {card.logo}
              </div>
            ))}
          </div>
        </div>

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
              Card Number *
            </label>
            <div className="relative">
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-16 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cardNumber ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="1234 5678 9012 3456"
                maxLength={currentCardType === 'amex' ? 17 : currentCardType === 'diners' ? 16 : 19}
              />
              {formData.cardNumber && (
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${cardConfig.color} rounded px-2 py-1 flex items-center justify-center`}>
                  {cardConfig.logo}
                </div>
              )}
            </div>
            {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            {formData.cardNumber && currentCardType !== 'unknown' && (
              <p className="text-sm text-green-600 mt-1">✓ {cardConfig.name} detected</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.expiryDate ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="MM/YY"
                maxLength={5}
              />
              {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV * ({cardConfig.cvvLength} digits)
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cvv ? 'border-red-300' : 'border-gray-300'}`}
                placeholder={currentCardType === 'amex' ? '1234' : '123'}
                maxLength={cardConfig.cvvLength}
              />
              {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
              {currentCardType === 'amex' && (
                <p className="text-xs text-gray-500 mt-1">4-digit code on front of card</p>
              )}
              {currentCardType !== 'amex' && currentCardType !== 'unknown' && (
                <p className="text-xs text-gray-500 mt-1">3-digit code on back of card</p>
              )}
            </div>
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
          onClick={handleSubmit}
          disabled={isProcessing}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
            isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
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
      </div>
    </div>
  );
};

export default PaymentForm;