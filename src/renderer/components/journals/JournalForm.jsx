// src/renderer/components/journals/JournalForm.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FormInput from '../FormInput';

const JournalForm = ({ journal, onSave, isNew }) => {
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState(journal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  // Available categories
  const categories = [
    'daily', 'medical', 'behavioral', 'educational', 'social', 'other'
  ];
  
  // Update form data when journal changes
  useEffect(() => {
    setFormData(journal);
    setIsDirty(false);
  }, [journal]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title?.trim()) {
      errors.title = t('validation.required');
    }
    
    if (!formData.content?.trim()) {
      errors.content = t('validation.required');
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
      const result = await onSave(formData);
      
      if (result === true) {
        // Success
        setIsDirty(false);
      } else if (result && result.validationErrors) {
        // Backend validation errors
        setFormErrors(result.validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle status change
  const handleStatusChange = (status) => {
    setFormData(prev => ({
      ...prev,
      status
    }));
    setIsDirty(true);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Journal details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          label={t('journals.fields.title')}
          placeholder={t('journals.placeholders.title')}
          required
          errorMessage={formErrors.title}
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {t('journals.fields.category')}
          </label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
          >
            <option value="">{t('journals.placeholders.category')}</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {t(`journals.categories.${category}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Journal content */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {t('journals.fields.content')}
          <span className="text-error ml-1">*</span>
        </label>
        <textarea
          name="content"
          rows="12"
          value={formData.content}
          onChange={handleChange}
          placeholder={t('journals.placeholders.content')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
            formErrors.content ? 'border-error' : 'border-base-300'
          }`}
        ></textarea>
        {formErrors.content && (
          <p className="text-error text-sm mt-1">{formErrors.content}</p>
        )}
      </div>
      
      {/* Status buttons - only show for existing journals */}
      {!isNew && (
        <div className="p-4 bg-base-200 rounded-lg border border-base-300">
          <label className="block text-sm font-medium mb-2">
            {t('journals.fields.status')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-md border ${
                formData.status === 'draft'
                  ? 'bg-info bg-opacity-10 border-info text-info'
                  : 'bg-base-100 border-base-300 text-neutral'
              }`}
              onClick={() => handleStatusChange('draft')}
            >
              {t('journals.status.draft')}
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md border ${
                formData.status === 'completed'
                  ? 'bg-success bg-opacity-10 border-success text-success'
                  : 'bg-base-100 border-base-300 text-neutral'
              }`}
              onClick={() => handleStatusChange('completed')}
            >
              {t('journals.status.completed')}
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md border ${
                formData.status === 'archived'
                  ? 'bg-neutral bg-opacity-10 border-neutral text-neutral'
                  : 'bg-base-100 border-base-300 text-neutral'
              }`}
              onClick={() => handleStatusChange('archived')}
            >
              {t('journals.status.archived')}
            </button>
          </div>
        </div>
      )}
      
      {/* Form actions */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting || (!isDirty && !isNew)}
          className="btn btn-primary"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.saving')}
            </span>
          ) : (
            isNew ? t('common.create') : t('common.save')
          )}
        </button>
      </div>
    </form>
  );
};

export default JournalForm;