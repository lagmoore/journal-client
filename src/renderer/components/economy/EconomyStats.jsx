// src/renderer/components/economy/EconomyStats.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const EconomyStats = ({ data, year }) => {
  const { t, i18n } = useTranslation();

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate difference percentage between actual and predicted income
  const calculateDifference = () => {
    if (data.predictedIncome === 0) return 0;
    return (
      ((data.actualIncome - data.predictedIncome) / data.predictedIncome) * 100
    );
  };

  const difference = calculateDifference();

  // Determine the color based on actual vs predicted
  const getDifferenceColor = () => {
    if (difference > 0) return "text-success";
    if (difference < 0) return "text-error";
    return "text-neutral";
  };

  // Determine if we're on budget
  const isBudgetMet = data.actualIncome >= data.budget;

  // Format year text directly without using i18next for now
  const yearText = i18n.language === "sv" ? `För ${year}` : `For ${year}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Actual Income Card */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral text-sm">
              {t("economy.stats.actualIncome")}
            </p>
            <h3 className="text-2xl font-bold mt-1">
              {formatCurrency(data.actualIncome)}
            </h3>
            <p className="text-sm mt-2">{yearText}</p>
          </div>
          <div className="bg-primary bg-opacity-10 p-3 rounded-full">
            <svg
              className="w-6 h-6 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        {isBudgetMet ? (
          <div className="mt-4 flex items-center text-success">
            <svg
              className="w-4 h-4 mr-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{t("economy.stats.budgetMet")}</span>
          </div>
        ) : (
          <div className="mt-4 flex items-center text-warning">
            <svg
              className="w-4 h-4 mr-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{t("economy.stats.budgetNotMet")}</span>
          </div>
        )}
      </div>

      {/* Budget Card */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral text-sm">
              {t("economy.stats.yearlyBudget")}
            </p>
            <h3 className="text-2xl font-bold mt-1">
              {formatCurrency(data.budget)}
            </h3>
            <p className="text-sm mt-2">{yearText}</p>
          </div>
          <div className="bg-secondary bg-opacity-10 p-3 rounded-full">
            <svg
              className="w-6 h-6 text-secondary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-base-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isBudgetMet ? "bg-success" : "bg-warning"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (data.actualIncome / data.budget) * 100
                )}%`,
              }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-neutral">
            {data.budget > 0
              ? `${Math.round((data.actualIncome / data.budget) * 100)}% ${t(
                  "economy.stats.ofBudget"
                )}`
              : t("economy.stats.noBudget")}
          </div>
        </div>
      </div>

      {/* Predicted Income Card */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral text-sm">
              {t("economy.stats.predictedIncome")}
            </p>
            <h3 className="text-2xl font-bold mt-1">
              {formatCurrency(data.predictedIncome)}
            </h3>
            <p className="text-sm mt-2">{yearText}</p>
          </div>
          <div className="bg-info bg-opacity-10 p-3 rounded-full">
            <svg
              className="w-6 h-6 text-info"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
        {data.predictedIncome > 0 && (
          <div className={`mt-4 flex items-center ${getDifferenceColor()}`}>
            {difference > 0 ? (
              <svg
                className="w-4 h-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : difference < 0 ? (
              <svg
                className="w-4 h-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="text-sm">
              {difference === 0
                ? t("economy.stats.matchingPrediction")
                : `${Math.abs(difference).toFixed(1)}% ${
                    difference > 0
                      ? t("economy.stats.abovePrediction")
                      : t("economy.stats.belowPrediction")
                  }`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EconomyStats;
