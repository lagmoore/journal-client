// src/renderer/views/ErrorView.jsx
import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ErrorView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Get error details from location state
  const errorType = location.state?.errorType || "unknown";
  const errorMessage = location.state?.errorMessage || t("error.pageTitle");

  // Define error types and their details
  const errorTypes = {
    notFound: {
      title: t("error.notFound"),
      description: t("error.notFound"),
      icon: (
        <svg
          className="w-24 h-24 text-error mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      ),
    },
    accessDenied: {
      title: t("error.accessDenied"),
      description: t("error.unauthorized"),
      icon: (
        <svg
          className="w-24 h-24 text-error mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          ></path>
        </svg>
      ),
    },
    serverError: {
      title: t("error.serverError"),
      description: t("error.serverError"),
      icon: (
        <svg
          className="w-24 h-24 text-error mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      ),
    },
    accountLocked: {
      title: t("error.accountLocked"),
      description: t("error.accountLocked"),
      icon: (
        <svg
          className="w-24 h-24 text-error mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          ></path>
        </svg>
      ),
    },
    unknown: {
      title: t("error.pageTitle"),
      description: errorMessage,
      icon: (
        <svg
          className="w-24 h-24 text-error mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      ),
    },
  };

  // Get error details
  const error = errorTypes[errorType] || errorTypes.unknown;

  // Go back handler
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen bg-base-100 items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {error.icon}

        <h1 className="text-3xl font-bold">{error.title}</h1>

        <p className="text-neutral">{error.description}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-secondary hover:bg-secondary-focus text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors"
          >
            {t("error.goBack")}
          </button>

          <Link
            to="/login"
            className="px-4 py-2 bg-primary hover:bg-primary-focus text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            {t("error.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorView;
