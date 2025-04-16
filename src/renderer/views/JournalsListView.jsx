// src/renderer/views/JournalsListView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

// Import components
import LoadingSpinner from "../components/common/LoadingSpinner";

const JournalsListView = () => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  // State
  const [journals, setJournals] = useState([]);
  const [patients, setPatients] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    patientId: "all",
    status: "all", // all, draft, completed, archived
    category: "all",
    dateRange: "all", // all, today, week, month
    sortBy: "newest", // newest, oldest, patientAZ, patientZA
  });

  // Fetch journals and patients
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch journals
        const journalsResponse = await api.get("/journals", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (journalsResponse.data.success) {
          setJournals(journalsResponse.data.journals);

          // Fetch patients and create a lookup map
          const patientsResponse = await api.get("/patients", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (patientsResponse.data.success) {
            const patientsMap = {};
            patientsResponse.data.patients.forEach((patient) => {
              patientsMap[patient.id] = patient;
            });
            setPatients(patientsMap);
          }
        } else {
          toast.error(t("journals.errors.loadFailed"));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(t("journals.errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken, t]);

  // Filter journals based on search and filters
  const filteredJournals = journals.filter((journal) => {
    // Apply search
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      const patient = patients[journal.patientId];
      const patientName = patient
        ? `${patient.firstName} ${patient.lastName}`.toLowerCase()
        : "";

      if (
        !journal.title.toLowerCase().includes(lowercaseSearch) &&
        !journal.content.toLowerCase().includes(lowercaseSearch) &&
        !patientName.includes(lowercaseSearch) &&
        !(
          journal.category &&
          journal.category.toLowerCase().includes(lowercaseSearch)
        )
      ) {
        return false;
      }
    }

    // Apply patient filter - FIX: Convert patientId to string for comparison
    if (
      filters.patientId !== "all" &&
      String(journal.patientId) !== String(filters.patientId)
    ) {
      return false;
    }

    // Apply status filter
    if (filters.status !== "all" && journal.status !== filters.status) {
      return false;
    }

    // Apply category filter
    if (filters.category !== "all" && journal.category !== filters.category) {
      return false;
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const journalDate = new Date(journal.createdAt);
      const now = new Date();

      if (filters.dateRange === "today") {
        // Check if same day
        if (
          journalDate.getDate() !== now.getDate() ||
          journalDate.getMonth() !== now.getMonth() ||
          journalDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (filters.dateRange === "week") {
        // Check if within the past 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (journalDate < oneWeekAgo) {
          return false;
        }
      } else if (filters.dateRange === "month") {
        // Check if within the past 30 days
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        if (journalDate < oneMonthAgo) {
          return false;
        }
      }
    }

    return true;
  });

  // Sort journals
  const sortedJournals = [...filteredJournals].sort((a, b) => {
    if (filters.sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filters.sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (
      filters.sortBy === "patientAZ" ||
      filters.sortBy === "patientZA"
    ) {
      const patientA = patients[a.patientId];
      const patientB = patients[b.patientId];

      if (!patientA || !patientB) return 0;

      const nameA = `${patientA.lastName}, ${patientA.firstName}`;
      const nameB = `${patientB.lastName}, ${patientB.firstName}`;

      return filters.sortBy === "patientAZ"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }

    return 0;
  });

  // Get unique categories for filter
  const categories = [
    ...new Set(journals.filter((j) => j.category).map((j) => j.category)),
  ];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Handle view journal
  const handleViewJournal = (journalId) => {
    navigate(`/dashboard/journals/${journalId}`);
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get status badge class
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("journals.allJournals")}</h1>
      </div>

      {/* Search and filters */}
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
                placeholder={t("journals.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {/* Patient filter */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("journals.filters.patient")}
            </label>
            <select
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.patientId}
              onChange={(e) => handleFilterChange("patientId", e.target.value)}
            >
              <option value="all">{t("journals.filters.allPatients")}</option>
              {Object.values(patients).map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.lastName}, {patient.firstName}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("journals.filters.status")}
            </label>
            <select
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">{t("journals.filters.all")}</option>
              <option value="draft">{t("journals.status.draft")}</option>
              <option value="completed">
                {t("journals.status.completed")}
              </option>
              <option value="archived">{t("journals.status.archived")}</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("journals.filters.category")}
            </label>
            <select
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="all">{t("journals.filters.all")}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {t(`journals.categories.${category}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort by */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("journals.filters.sortBy")}
            </label>
            <select
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="newest">{t("journals.filters.newest")}</option>
              <option value="oldest">{t("journals.filters.oldest")}</option>
              <option value="patientAZ">
                {t("journals.filters.patientAZ")}
              </option>
              <option value="patientZA">
                {t("journals.filters.patientZA")}
              </option>
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("journals.filters.dateRange")}
            </label>
            <select
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
            >
              <option value="all">{t("journals.filters.allTime")}</option>
              <option value="today">{t("journals.filters.today")}</option>
              <option value="week">{t("journals.filters.thisWeek")}</option>
              <option value="month">{t("journals.filters.thisMonth")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Journal list */}
      {isLoading ? (
        <LoadingSpinner />
      ) : sortedJournals.length > 0 ? (
        <div className="space-y-4">
          {sortedJournals.map((journal) => {
            const patient = patients[journal.patientId];
            return (
              <div
                key={journal.id}
                className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden hover:border-primary cursor-pointer transition-colors"
                onClick={() => handleViewJournal(journal.id)}
              >
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{journal.title}</h3>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            journal.status
                          )}`}
                        >
                          {t(`journals.status.${journal.status}`)}
                        </span>
                      </div>

                      {patient && (
                        <p className="text-sm font-medium mt-1">
                          {patient.firstName} {patient.lastName}
                        </p>
                      )}

                      {journal.category && (
                        <p className="text-sm text-neutral mt-1">
                          {t(`journals.categories.${journal.category}`)}
                        </p>
                      )}

                      <div className="mt-2 text-sm line-clamp-2 text-neutral">
                        {journal.content}
                      </div>
                    </div>

                    <div className="text-sm text-neutral whitespace-nowrap">
                      {formatDate(journal.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral text-lg">
            {searchTerm || Object.values(filters).some((v) => v !== "all")
              ? t("journals.noResults")
              : t("journals.empty")}
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalsListView;
