// src/renderer/components/FormInput.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Reusable form input component with validation
 */
const FormInput = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  label,
  required = false,
  validate,
  errorMessage,
  successMessage,
  className = '',
  autoComplete,
  disabled = false,
  maxLength,
  icon,
  onBlur,
}) => {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  // Validate input when value changes if already touched
  useEffect(() => {
    if (touched && validate) {
      const validationResult = validate(value);
      setError(validationResult || '');
      setSuccess(!validationResult);
    }
  }, [value, touched, validate]);

  // Handle input change
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
    
    // Validate on change if already touched
    if (touched && validate) {
      const validationResult = validate(e.target.value);
      setError(validationResult || '');
      setSuccess(!validationResult);
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    setTouched(true);
    
    // Validate on blur
    if (validate) {
      const validationResult = validate(e.target.value);
      setError(validationResult || '');
      setSuccess(!validationResult);
    }
    
    // Call onBlur prop if provided
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : success ? `${name}-success` : undefined}
          className={`
            w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
            ${icon ? 'pl-10' : ''}
            ${
              error
                ? 'border-error focus:border-error focus:ring-error text-error'
                : success
                ? 'border-success focus:border-success focus:ring-success'
                : 'border-base-300 focus:border-primary focus:ring-primary'
            }
            ${disabled ? 'bg-base-200 cursor-not-allowed' : 'bg-base-100'}
          `}
        />
      </div>
      
      {touched && error && (
        <div id={`${name}-error`} className="text-error text-sm mt-1" role="alert">
          {errorMessage || error}
        </div>
      )}
      
      {touched && success && successMessage && (
        <div id={`${name}-success`} className="text-success text-sm mt-1">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default FormInput;