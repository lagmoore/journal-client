// src/renderer/views/LoginView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm';
import FormInput from '../components/FormInput';

const LoginView = () => {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('validation.email');
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = t('validation.required');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Email validation function
  const validateEmail = (value) => {
    if (!value) {
      return t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      return t('validation.email');
    }
    return '';
  };

  // Password validation function
  const validatePassword = (value) => {
    if (!value) {
      return t('validation.required');
    }
    return '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call login from auth context
      const result = await login(
        formData.email,
        formData.password,
        formData.rememberMe
      );
      
      if (result.success) {
        toast.success(t('auth.login.loginSuccessful'));
        
        // Redirect to the page user was trying to access or dashboard
        const from = location.state?.from || '/dashboard';
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || t('auth.errors.loginFailed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('auth.errors.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm
      title={t('auth.login.title')}
      footerContent={
        <p>
          {t('app.name')} © {new Date().getFullYear()}
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t('auth.login.emailPlaceholder')}
          label={t('auth.login.emailPlaceholder')}
          required
          validate={validateEmail}
          errorMessage={formErrors.email}
          autoComplete="email"
          icon={
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
          }
        />

        <FormInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={t('auth.login.passwordPlaceholder')}
          label={t('auth.login.passwordPlaceholder')}
          required
          validate={validatePassword}
          errorMessage={formErrors.password}
          autoComplete="current-password"
          icon={
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
            </svg>
          }
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-base-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm">
              {t('auth.login.rememberMe')}
            </label>
          </div>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary-focus"
          >
            {t('auth.login.forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-primary hover:bg-primary-focus text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.loading')}
            </span>
          ) : (
            t('auth.login.loginButton')
          )}
        </button>
      </form>
    </AuthForm>
  );
};

export default LoginView;