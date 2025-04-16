// src/renderer/components/economy/EconomyForm.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FormInput from '../FormInput';

const EconomyForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t, i18n } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    year: initialData.year,
    month: initialData.month,
    actualIncome: initialData.actualIncome,
    budget: initialData.budget
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when initialData changes
  useEffect(() => {
    setFormData({
      year: initialData.year,
      month: initialData.month,
      actualIncome: initialData.actualIncome,
      budget: initialData.budget
    });
    setFormErrors({});
  }, [initialData]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'actualIncome' || name === 'budget' ? parseFloat(value) : value
    }));
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (isNaN(formData.actualIncome) || formData.actualIncome < 0) {
      errors.actualIncome = t('validation.positiveNumber');
    }
    
    if (isNaN(formData.budget) || formData.budget < 0) {
      errors.budget = t('validation.positiveNumber');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get localized month name from translations
  const getLocalizedMonthName = () => {
    return t(`economy.months.${initialData.month}`);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-base-100 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-base-100 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-base-content mb-4">
                    {t('economy.editData', { month: getLocalizedMonthName(), year: initialData.year })}
                  </h3>
                  
                  <div className="mt-2 space-y-4">
                    <FormInput
                      type="number"
                      name="actualIncome"
                      value={formData.actualIncome}
                      onChange={handleChange}
                      label={t('economy.fields.actualIncome')}
                      placeholder={t('economy.placeholders.actualIncome')}
                      required
                      step="0.01"
                      min="0"
                      errorMessage={formErrors.actualIncome}
                    />
                    
                    <FormInput
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      label={t('economy.fields.budget')}
                      placeholder={t('economy.placeholders.budget')}
                      required
                      step="0.01"
                      min="0"
                      errorMessage={formErrors.budget}
                    />
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1">
                        {t('economy.fields.predictedIncome')}
                      </label>
                      <div className="px-3 py-2 border border-base-300 rounded-md bg-base-200 text-neutral">
                        {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(initialData.predictedIncome)}
                      </div>
                      <p className="text-xs text-neutral mt-1">
                        {t('economy.predictedIncomeNote')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-base-200 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-white font-medium hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('common.saving')}
                  </span>
                ) : t('common.save')}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-base-300 shadow-sm px-4 py-2 bg-base-100 text-base-content font-medium hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EconomyForm;