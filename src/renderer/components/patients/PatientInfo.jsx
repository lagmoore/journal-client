// src/renderer/components/patients/PatientInfo.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FormInput from '../FormInput';

const PatientInfo = ({ patient, onSave, isNew }) => {
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState(patient);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  // Update form data when patient changes
  useEffect(() => {
    setFormData(patient);
    setIsDirty(false);
  }, [patient]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsDirty(true);
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName?.trim()) {
      errors.firstName = t('validation.required');
    }
    
    if (!formData.lastName?.trim()) {
      errors.lastName = t('validation.required');
    }
    
    if (formData.personalNumber && !/^(\d{8}[-+]?\d{4}|\d{12})$/.test(formData.personalNumber.replace(/\s/g, ''))) {
      errors.personalNumber = t('patients.validation.personalNumber');
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('validation.email');
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">{t('patients.sections.personal')}</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              label={t('patients.fields.firstName')}
              placeholder={t('patients.placeholders.firstName')}
              required
              errorMessage={formErrors.firstName}
            />
            
            <FormInput
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              label={t('patients.fields.lastName')}
              placeholder={t('patients.placeholders.lastName')}
              required
              errorMessage={formErrors.lastName}
            />
            
            <FormInput
              type="text"
              name="personalNumber"
              value={formData.personalNumber}
              onChange={handleChange}
              label={t('patients.fields.personalNumber')}
              placeholder={t('patients.placeholders.personalNumber')}
              errorMessage={formErrors.personalNumber}
            />
            
            <FormInput
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth ? formData.dateOfBirth.substr(0, 10) : ''}
              onChange={handleChange}
              label={t('patients.fields.dateOfBirth')}
              errorMessage={formErrors.dateOfBirth}
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t('patients.fields.gender')}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
              >
                <option value="unspecified">{t('patients.gender.unspecified')}</option>
                <option value="male">{t('patients.gender.male')}</option>
                <option value="female">{t('patients.gender.female')}</option>
                <option value="other">{t('patients.gender.other')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">{t('patients.sections.contact')}</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              label={t('patients.fields.email')}
              placeholder={t('patients.placeholders.email')}
              errorMessage={formErrors.email}
            />
            
            <FormInput
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              label={t('patients.fields.phone')}
              placeholder={t('patients.placeholders.phone')}
              errorMessage={formErrors.phone}
            />
            
            <FormInput
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              label={t('patients.fields.address')}
              placeholder={t('patients.placeholders.address')}
              errorMessage={formErrors.address}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                label={t('patients.fields.postalCode')}
                placeholder={t('patients.placeholders.postalCode')}
                errorMessage={formErrors.postalCode}
              />
              
              <FormInput
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                label={t('patients.fields.city')}
                placeholder={t('patients.placeholders.city')}
                errorMessage={formErrors.city}
              />
            </div>
            
            <FormInput
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              label={t('patients.fields.country')}
              placeholder={t('patients.placeholders.country')}
              errorMessage={formErrors.country}
            />
          </div>
        </div>
      </div>
      
      {/* Emergency Contact */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">{t('patients.sections.emergency')}</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              label={t('patients.fields.emergencyName')}
              placeholder={t('patients.placeholders.emergencyName')}
              errorMessage={formErrors.emergencyContactName}
            />
            
            <FormInput
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              label={t('patients.fields.emergencyPhone')}
              placeholder={t('patients.placeholders.emergencyPhone')}
              errorMessage={formErrors.emergencyContactPhone}
            />
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">{t('patients.sections.notes')}</h3>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t('patients.fields.notes')}
            </label>
            <textarea
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
              placeholder={t('patients.placeholders.notes')}
            ></textarea>
          </div>
        </div>
      </div>
      
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

export default PatientInfo;