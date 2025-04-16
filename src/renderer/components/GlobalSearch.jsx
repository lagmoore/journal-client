// src/renderer/components/GlobalSearch.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const GlobalSearch = () => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  // State
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({
    patients: [],
    journals: [],
  });
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults({ patients: [], journals: [] });
      return;
    }

    const timer = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, accessToken]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Perform search
  const performSearch = async (term) => {
    if (!term.trim() || term.length < 2) return;

    setIsSearching(true);

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
        // Filter and limit results
        const patients = patientsResponse.data.patients
          .filter(
            (patient) =>
              patient.firstName.toLowerCase().includes(term.toLowerCase()) ||
              patient.lastName.toLowerCase().includes(term.toLowerCase()) ||
              patient.personalNumber?.toLowerCase().includes(term.toLowerCase())
          )
          .slice(0, 5);

        const journals = journalsResponse.data.journals
          .filter(
            (journal) =>
              journal.title.toLowerCase().includes(term.toLowerCase()) ||
              journal.content.toLowerCase().includes(term.toLowerCase())
          )
          .slice(0, 5);

        setSearchResults({
          patients,
          journals,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.trim().length > 1);
  };

  // Handle patient click
  const handlePatientClick = (patientId) => {
    navigate(`/dashboard/patients/${patientId}`);
    setShowResults(false);
    setSearchTerm("");
  };

  // Handle journal click
  const handleJournalClick = (journalId) => {
    navigate(`/dashboard/journals/${journalId}`);
    setShowResults(false);
    setSearchTerm("");
  };

  // Handle see all results
  const handleSeeAllResults = () => {
    // Implement future search results page
    navigate(`/dashboard/search?q=${encodeURIComponent(searchTerm)}`);
    setShowResults(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={t("common.searchPlaceholder")}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-base-300 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={searchTerm}
          onChange={handleSearchInput}
          onFocus={() => {
            if (searchTerm.trim().length > 1) {
              setShowResults(true);
            }
          }}
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

        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg
              className="animate-spin h-4 w-4 text-neutral"
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
          </div>
        )}
      </div>

      {/* Search results */}
      {showResults && (
        <div className="absolute z-40 left-0 right-0 mt-2 w-full bg-base-100 shadow-lg rounded-lg border border-base-300 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {/* No results state */}
            {!isSearching &&
              searchResults.patients.length === 0 &&
              searchResults.journals.length === 0 && (
                <div className="px-4 py-3 text-neutral text-center">
                  {searchTerm.length < 2
                    ? t("search.searchForSomething")
                    : t("search.noResults")}
                </div>
              )}

            {/* Patients section */}
            {searchResults.patients.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-base-200 text-sm font-medium">
                  {t("search.patients")}
                </div>
                <div>
                  {searchResults.patients.map((patient) => (
                    <button
                      key={patient.id}
                      className="w-full px-4 py-2 text-left hover:bg-base-200 focus:outline-none focus:bg-base-200"
                      onClick={() => handlePatientClick(patient.id)}
                    >
                      <div className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-neutral">
                        {patient.personalNumber || patient.dateOfBirth}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Journals section */}
            {searchResults.journals.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-base-200 text-sm font-medium">
                  {t("search.journals")}
                </div>
                <div>
                  {searchResults.journals.map((journal) => (
                    <button
                      key={journal.id}
                      className="w-full px-4 py-2 text-left hover:bg-base-200 focus:outline-none focus:bg-base-200"
                      onClick={() => handleJournalClick(journal.id)}
                    >
                      <div className="font-medium">{journal.title}</div>
                      <div className="text-sm text-neutral truncate">
                        {journal.content.substring(0, 60)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with view all */}
            {(searchResults.patients.length > 0 ||
              searchResults.journals.length > 0) && (
              <button
                className="w-full px-4 py-2 text-center font-medium text-primary hover:bg-base-200 focus:outline-none focus:bg-base-200 border-t border-base-300"
                onClick={handleSeeAllResults}
              >
                {t("dashboard.actions.viewAll")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
