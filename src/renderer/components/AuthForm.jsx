// src/renderer/components/AuthForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * Authentication form container with logo and theme support
 */
const AuthForm = ({ children, title, subtitle, footerContent }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-base-100">
      {/* Left side - Logo and branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("app.name")}
          </h1>
          <p className="text-primary-content text-lg">{t("app.tagline")}</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex justify-between items-center p-4">
          {/* Mobile logo */}
          <div className="lg:hidden text-primary font-bold text-xl">
            {t("app.name")}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={t("common.theme.title")}
              className="p-2 rounded-full hover:bg-base-200 transition-colors"
            >
              {theme === "vyperLight" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center px-6 py-8 mx-auto w-full max-w-md">
          <div className="w-full bg-base-100 rounded-lg shadow-card md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
              {subtitle && (
                <p className="text-neutral text-sm mb-6">{subtitle}</p>
              )}

              {children}
            </div>
          </div>

          {footerContent && (
            <div className="mt-6 text-center text-sm">{footerContent}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
