import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

// Enhanced Course Settings with Currency Management
export const EnhancedCourseSettings = ({ form, onSave, loading, availableCurrencies, onAddCurrency, onUpdateCurrency, onRemoveCurrency }) => {
  const [showCurrencyForm, setShowCurrencyForm] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [currencyForm, setCurrencyForm] = useState({ value: '', label: '', symbol: '' });

  const handleCurrencySubmit = (e) => {
    e.preventDefault();
    if (editingCurrency) {
      onUpdateCurrency(editingCurrency.value, currencyForm);
      setEditingCurrency(null);
    } else {
      onAddCurrency(currencyForm);
    }
    setCurrencyForm({ value: '', label: '', symbol: '' });
    setShowCurrencyForm(false);
  };

  const handleEditCurrency = (currency) => {
    setEditingCurrency(currency);
    setCurrencyForm({ ...currency });
    setShowCurrencyForm(true);
  };

  const handleCancelCurrency = () => {
    setShowCurrencyForm(false);
    setEditingCurrency(null);
    setCurrencyForm({ value: '', label: '', symbol: '' });
  };

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
      {/* Basic Course Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Default Course Duration (hours)</label>
            <input
              type="number"
              className="input"
              min="1"
              {...form.register('defaultDuration')}
            />
          </div>
          <div>
            <label className="label">Max File Upload Size (MB)</label>
            <input
              type="number"
              className="input"
              min="1"
              max="100"
              {...form.register('maxFileUploadSize')}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="label">Default Currency</label>
          <select className="input w-48" {...form.register('defaultCurrency')}>
            {availableCurrencies.map(currency => (
              <option key={currency.value} value={currency.value}>
                {currency.label} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 mt-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowGuestPreview"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...form.register('allowGuestPreview')}
            />
            <label htmlFor="allowGuestPreview" className="text-sm font-medium text-gray-700">
              Allow Guest Course Preview
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoEnrollment"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...form.register('autoEnrollment')}
            />
            <label htmlFor="autoEnrollment" className="text-sm font-medium text-gray-700">
              Enable Auto-Enrollment
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="certificateGeneration"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...form.register('certificateGeneration')}
            />
            <label htmlFor="certificateGeneration" className="text-sm font-medium text-gray-700">
              Generate Completion Certificates
            </label>
          </div>
        </div>
      </div>

      {/* Currency Management */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Currency Management</h4>
          <button
            type="button"
            onClick={() => setShowCurrencyForm(true)}
            className="btn-outline btn-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Currency
          </button>
        </div>

        {/* Currency Form */}
        {showCurrencyForm && (
          <div className="bg-white p-4 rounded-lg border mb-4">
            <h5 className="font-medium text-gray-900 mb-3">
              {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
            </h5>
            <form onSubmit={handleCurrencySubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="label">Currency Code</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., INR"
                    value={currencyForm.value}
                    onChange={(e) => setCurrencyForm({...currencyForm, value: e.target.value.toUpperCase()})}
                    disabled={editingCurrency} // Don't allow changing code when editing
                    maxLength="3"
                    required
                  />
                </div>
                <div>
                  <label className="label">Currency Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Indian Rupee"
                    value={currencyForm.label}
                    onChange={(e) => setCurrencyForm({...currencyForm, label: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Symbol</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., ₹"
                    value={currencyForm.symbol}
                    onChange={(e) => setCurrencyForm({...currencyForm, symbol: e.target.value})}
                    maxLength="3"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary btn-sm">
                  {editingCurrency ? 'Update' : 'Add'} Currency
                </button>
                <button type="button" onClick={handleCancelCurrency} className="btn-outline btn-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Currency List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableCurrencies.map((currency) => (
            <div key={currency.value} className="bg-white p-3 rounded-lg border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{currency.symbol}</span>
                <div>
                  <div className="font-medium text-gray-900">{currency.value}</div>
                  <div className="text-sm text-gray-600">{currency.label}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleEditCurrency(currency)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit currency"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                {currency.value !== 'USD' && (
                  <button
                    type="button"
                    onClick={() => onRemoveCurrency(currency.value)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete currency"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <><LoadingSpinner size="sm" />Saving...</> : 'Save Course Settings'}
        </button>
      </div>
    </form>
  );
};