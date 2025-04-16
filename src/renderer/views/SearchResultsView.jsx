// src/renderer/views/SearchResultsView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

// Import components
import LoadingSpinner from "../components/common/LoadingSpinner";

const SearchResultsView = () => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q") || "";

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [searchResults, setSearchResults] = useState({
    patients: [],
    journals: [],
  });

  // Perform search when component mounts or search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    } else {
      setIsLoading(false);
    }
  }, [searchTerm, accessToken]);

  // Perform search
  const performSearch = async (term) => {
    if (!term.trim()) return;

    setIsLoading(true);

    try {
      // Search patients
      const patientsResponse = await api.get("/patients", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { search: term },
      });

      // Search journals
      const journalsResponse = await api.get("/journals", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { search: term },
      });

      if (patientsResponse.data.success && journalsResponse.data.success) {
        // Filter results
        const patients = patientsResponse.data.patients.filter(
          (patient) =>
            patient.firstName.toLowerCase().includes(term.toLowerCase()) ||
            patient.lastName.toLowerCase().includes(term.toLowerCase()) ||
            patient.personalNumber?.toLowerCase().includes(term.toLowerCase())
        );

        const journals = journalsResponse.data.journals.filter(
          (journal) =>
            journal.title.toLowerCase().includes(term.toLowerCase()) ||
            journal.content.toLowerCase().includes(term.toLowerCase())
        );

        setSearchResults({
          patients,
          journals,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchTerm);
    // Update URL
    navigate(`/dashboard/search?q=${encodeURIComponent(searchTerm)}`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Handle patient click
  const handlePatientClick = (patientId) => {
    navigate(`/dashboard/patients/${patientId}`);
  };

  // Handle journal click
  const handleJournalClick = (journalId) => {
    navigate(`/dashboard/journals/${journalId}`);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults({ patients: [], journals: [] });
    navigate("/dashboard/search");
  };

  // Get status badge class for journal
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-info bg-opacity-10 text-info";
      case "completed":
        return "bg-success bg-opacity-10 text-success";
      case "archived":
        return "bg-neutral bg-opacity-10 text-neutral";
      default:
        return "bg-info bg-opacity-10 text-info";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("search.title")}</h1>

      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t("common.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-base-300 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

            {searchTerm && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={handleClearSearch}
              >
                <svg
                  className="h-5 w-5 text-neutral"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            {t("common.search")}
          </button>
        </div>
      </form>

      {/* Loading indicator */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div>
          {/* No results state */}
          {searchTerm &&
            searchResults.patients.length === 0 &&
            searchResults.journals.length === 0 && (
              <div className="text-center py-8">
                <p className="text-neutral text-lg">{t("search.noResults")}</p>
              </div>
            )}

          {/* Search prompt for empty search */}
          {!searchTerm && (
            <div className="text-center py-8">
              <p className="text-neutral text-lg">
                {t("search.searchForSomething")}
              </p>
            </div>
          )}

          {/* Patients results */}
          {searchResults.patients.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">
                {t("search.patients")}
              </h2>
              <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
                <div className="divide-y divide-base-300">
                  {searchResults.patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-4 hover:bg-base-200 cursor-pointer transition-colors"
                      onClick={() => handlePatientClick(patient.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className="text-sm text-neutral">
                            {patient.personalNumber ||
                              formatDate(patient.dateOfBirth)}
                          </p>
                        </div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            patient.isActive
                              ? "bg-success bg-opacity-10 text-success"
                              : "bg-error bg-opacity-10 text-error"
                          }`}
                        >
                          {patient.isActive
                            ? t("patients.status.active")
                            : t("patients.status.inactive")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Journals results */}
          {searchResults.journals.length > 0 && (
            <div>
              <h2 className="text-xl font-medium mb-4">
                {t("search.journals")}
              </h2>
              <div className="space-y-4">
                {searchResults.journals.map((journal) => (
                  <div
                    key={journal.id}
                    className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden hover:border-primary cursor-pointer transition-colors"
                    onClick={() => handleJournalClick(journal.id)}
                  >
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">
                              {journal.title}
                            </h3>
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                journal.status
                              )}`}
                            >
                              {t(`journals.status.${journal.status}`)}
                            </span>
                          </div>

                          {journal.category && (
                            <p className="text-sm text-neutral mt-1">
                              {t(`journals.categories.${journal.category}`)}
                            </p>
                          )}

                          <div className="mt-2 text-sm line-clamp-3 text-neutral">
                            {journal.content}
                          </div>
                        </div>

                        <div className="text-sm text-neutral whitespace-nowrap">
                          {formatDate(journal.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsView;
