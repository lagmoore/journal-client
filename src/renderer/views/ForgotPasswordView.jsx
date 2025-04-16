// src/renderer/views/ForgotPasswordView.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useAuth } from "../contexts/AuthContext";
import AuthForm from "../components/AuthForm";
import FormInput from "../components/FormInput";

const ForgotPasswordView = () => {
  const { t } = useTranslation();
  const { requestPasswordReset } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Email validation function
  const validateEmail = (value) => {
    if (!value) {
      return t("validation.required");
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      return t("validation.email");
    }
    return "";
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call password reset request
      const result = await requestPasswordReset(email);

      if (result.success) {
        setRequestSent(true);
        toast.success(t("auth.forgotPassword.emailSent"));
      } else {
        toast.error(result.error || t("auth.errors.resetRequestFailed"));
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      toast.error(t("auth.errors.resetRequestFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm
      title={t("auth.forgotPassword.title")}
      subtitle={t("auth.forgotPassword.description")}
      footerContent={
        <Link
          to="/login"
          className="text-primary hover:text-primary-focus font-medium"
        >
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      }
    >
      {requestSent ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-success bg-opacity-10 p-3">
              <svg
                className="w-8 h-8 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium">
            {t("auth.forgotPassword.emailSent")}
          </h3>
          <p className="text-neutral text-sm">
            {t("auth.forgotPassword.emailSent")}
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="inline-block px-4 py-2 bg-primary hover:bg-primary-focus text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              {t("auth.forgotPassword.backToLogin")}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.forgotPassword.emailPlaceholder")}
            label={t("auth.forgotPassword.emailPlaceholder")}
            required
            validate={validateEmail}
            autoComplete="email"
            icon={
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
            }
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-primary hover:bg-primary-focus text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("common.loading")}
              </span>
            ) : (
              t("auth.forgotPassword.submitButton")
            )}
          </button>
        </form>
      )}
    </AuthForm>
  );
};

export default ForgotPasswordView;
