// src/renderer/components/patients/PatientSearchFilter.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const PatientSearchFilter = ({
  searchTerm,
  filters,
  onSearch,
  onFilterChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-base-200 p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="flex-grow">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-neutral"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder={t("patients.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Status filter */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium mb-1">
              {t("patients.filters.status")}
            </label>
            <select
              className="w-full md:w-40 px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
            >
              <option value="all">
                {t("patients.filters.statusOptions.all")}
              </option>
              <option value="active">
                {t("patients.filters.statusOptions.active")}
              </option>
              <option value="inactive">
                {t("patients.filters.statusOptions.inactive")}
              </option>
            </select>
          </div>

          {/* Sort by filter */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium mb-1">
              {t("patients.filters.sortBy")}
            </label>
            <select
              className="w-full md:w-40 px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            >
              <option value="lastName">
                {t("patients.filters.sortOptions.lastName")}
              </option>
              <option value="firstName">
                {t("patients.filters.sortOptions.firstName")}
              </option>
              <option value="personalNumber">
                {t("patients.filters.sortOptions.personalNumber")}
              </option>
              <option value="createdAt">
                {t("patients.filters.sortOptions.createdAt")}
              </option>
            </select>
          </div>

          {/* Sort order */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium mb-1">
              {t("patients.filters.sortOrder")}
            </label>
            <div className="flex gap-2">
              <button
                className={`px-3 py-2 rounded-md border ${
                  filters.sortOrder === "asc"
                    ? "bg-primary text-white border-primary"
                    : "bg-base-100 text-base-content border-base-300"
                }`}
                onClick={() => onFilterChange({ sortOrder: "asc" })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3z" />
                </svg>
              </button>
              <button
                className={`px-3 py-2 rounded-md border ${
                  filters.sortOrder === "desc"
                    ? "bg-primary text-white border-primary"
                    : "bg-base-100 text-base-content border-base-300"
                }`}
                onClick={() => onFilterChange({ sortOrder: "desc" })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 3a1 1 0 000 2h4a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h11a1 1 0 100-2H3z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSearchFilter;
