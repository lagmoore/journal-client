// src/renderer/components/patients/PatientJournals.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Entry type icons
const EntryTypeIcon = ({ type, className = "h-6 w-6" }) => {
  switch (type) {
    case "note":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      );
    case "medication":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      );
    case "drug_test":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      );
    case "incident":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
  }
};

const PatientJournals = ({
  journals,
  medications,
  patientId,
  onCreateJournal,
  onCreateMedication,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    entryType: "all", // all, note, medication, drug_test, incident
    status: "all", // all, draft, completed, archived
    period: "all", // all, today, week, month, year
  });

  // Format date - different formats based on date parts
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isThisYear) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }

    return date.toLocaleDateString();
  };

  // Group entries by date for timeline view
  const groupEntriesByDate = (entries) => {
    const groups = {};

    entries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const dateKey = date.toISOString().split("T")[0];

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(entry);
    });

    // Sort each group by time
    Object.keys(groups).forEach((date) => {
      groups[date].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    });

    // Return as sorted array of [date, entries] pairs
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .map(([date, entries]) => ({
        date,
        formattedDate: formatDateHeading(date),
        entries,
      }));
  };

  // Format date for group headings
  const formatDateHeading = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return t("common.today");
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return t("common.yesterday");
    }

    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Filter journals
  const filteredJournals = journals.filter((journal) => {
    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      if (
        !journal.title.toLowerCase().includes(lowerSearchTerm) &&
        !journal.content.toLowerCase().includes(lowerSearchTerm) &&
        !(
          journal.medicationName &&
          journal.medicationName.toLowerCase().includes(lowerSearchTerm)
        )
      ) {
        return false;
      }
    }

    // Apply entry type filter
    if (
      filters.entryType !== "all" &&
      journal.entryType !== filters.entryType
    ) {
      return false;
    }

    // Apply status filter
    if (filters.status !== "all" && journal.status !== filters.status) {
      return false;
    }

    // Apply period filter
    if (filters.period !== "all") {
      const journalDate = new Date(journal.createdAt);
      const now = new Date();

      if (filters.period === "today") {
        if (journalDate.toDateString() !== now.toDateString()) {
          return false;
        }
      } else if (filters.period === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (journalDate < weekAgo) {
          return false;
        }
      } else if (filters.period === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (journalDate < monthAgo) {
          return false;
        }
      } else if (filters.period === "year") {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        if (journalDate < yearAgo) {
          return false;
        }
      }
    }

    return true;
  });

  // Group and sort journals by date
  const groupedJournals = groupEntriesByDate(filteredJournals);

  // View journal
  const handleViewJournal = (journalId) => {
    navigate(`/dashboard/journals/${journalId}`);
  };

  // Handle new entry button click with type
  const handleNewEntryClick = (entryType) => {
    onCreateJournal(entryType);
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

  // Get test result badge class
  const getTestResultBadgeClass = (result) => {
    switch (result) {
      case "positive":
        return "bg-error bg-opacity-10 text-error";
      case "negative":
        return "bg-success bg-opacity-10 text-success";
      default:
        return "bg-neutral bg-opacity-10 text-neutral";
    }
  };

  // Get incident severity badge class
  const getIncidentSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "high":
        return "bg-error bg-opacity-10 text-error";
      case "medium":
        return "bg-warning bg-opacity-10 text-warning";
      case "low":
        return "bg-info bg-opacity-10 text-info";
      default:
        return "bg-neutral bg-opacity-10 text-neutral";
    }
  };

  // Render entry content based on entry type
  const renderEntryContent = (entry) => {
    switch (entry.entryType) {
      case "medication":
        return (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold">{entry.medicationName}</div>
              <div className="text-sm">{entry.medicationDose}</div>
              {entry.medicationTime && (
                <div className="text-sm text-neutral">
                  {new Date(entry.medicationTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
            {entry.content && (
              <div className="mt-2 text-sm">{entry.content}</div>
            )}
          </div>
        );

      case "drug_test":
        return (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold">{entry.testType}</div>
              <div className="text-sm">({entry.testMethod})</div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTestResultBadgeClass(
                  entry.testResult
                )}`}
              >
                {entry.testResult === "positive"
                  ? t("common.positive")
                  : t("common.negative")}
              </span>
            </div>
            {entry.testResult === "positive" &&
              entry.positiveSubstances?.length > 0 && (
                <div className="mt-1">
                  <span className="text-sm font-medium">
                    {t("journals.drugTest.positiveSubstances")}:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.positiveSubstances.map((substance, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 text-xs bg-base-200 rounded-full"
                      >
                        {substance}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            {entry.content && (
              <div className="mt-2 text-sm">{entry.content}</div>
            )}
          </div>
        );

      case "incident":
        return (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getIncidentSeverityBadgeClass(
                  entry.incidentSeverity
                )}`}
              >
                {t(
                  `journals.incident.severity.${
                    entry.incidentSeverity || "low"
                  }`
                )}
              </span>
            </div>
            {entry.incidentDetails && (
              <div className="mt-2 text-sm">{entry.incidentDetails}</div>
            )}
            {entry.content && (
              <div className="mt-2 text-sm">{entry.content}</div>
            )}
          </div>
        );

      case "note":
      default:
        return (
          <div>
            {entry.content && <div className="text-sm">{entry.content}</div>}
          </div>
        );
    }
  };

  // Check if we have active medications
  const hasActiveMedications =
    medications && medications.some((med) => med.isActive);

  return (
    <div>
      {/* Header with search and filter */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="w-full md:w-1/2">
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

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative">
            <button
              className="btn btn-primary flex items-center gap-1"
              onClick={() => handleNewEntryClick("note")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t("journals.actions.create")}
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons for different entry types */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => handleNewEntryClick("note")}
          className={`p-3 rounded-lg border flex items-center gap-2 ${
            filters.entryType === "note"
              ? "bg-primary bg-opacity-10 border-primary text-primary"
              : "bg-base-100 border-base-300 hover:bg-base-200"
          }`}
        >
          <EntryTypeIcon type="note" className="h-5 w-5" />
          <span>{t("journals.entryTypes.note")}</span>
        </button>

        <button
          onClick={() => handleNewEntryClick("medication")}
          className={`p-3 rounded-lg border flex items-center gap-2 ${
            filters.entryType === "medication"
              ? "bg-primary bg-opacity-10 border-primary text-primary"
              : "bg-base-100 border-base-300 hover:bg-base-200"
          }`}
        >
          <EntryTypeIcon type="medication" className="h-5 w-5" />
          <span>{t("journals.entryTypes.medication")}</span>
        </button>

        <button
          onClick={() => handleNewEntryClick("drug_test")}
          className={`p-3 rounded-lg border flex items-center gap-2 ${
            filters.entryType === "drug_test"
              ? "bg-primary bg-opacity-10 border-primary text-primary"
              : "bg-base-100 border-base-300 hover:bg-base-200"
          }`}
        >
          <EntryTypeIcon type="drug_test" className="h-5 w-5" />
          <span>{t("journals.entryTypes.drugTest")}</span>
        </button>

        <button
          onClick={() => handleNewEntryClick("incident")}
          className={`p-3 rounded-lg border flex items-center gap-2 ${
            filters.entryType === "incident"
              ? "bg-primary bg-opacity-10 border-primary text-primary"
              : "bg-base-100 border-base-300 hover:bg-base-200"
          }`}
        >
          <EntryTypeIcon type="incident" className="h-5 w-5" />
          <span>{t("journals.entryTypes.incident")}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          className="px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={filters.entryType}
          onChange={(e) =>
            setFilters({ ...filters, entryType: e.target.value })
          }
        >
          <option value="all">{t("journals.filters.allTypes")}</option>
          <option value="note">{t("journals.entryTypes.note")}</option>
          <option value="medication">
            {t("journals.entryTypes.medication")}
          </option>
          <option value="drug_test">{t("journals.entryTypes.drugTest")}</option>
          <option value="incident">{t("journals.entryTypes.incident")}</option>
        </select>

        <select
          className="px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">{t("journals.filters.all")}</option>
          <option value="draft">{t("journals.status.draft")}</option>
          <option value="completed">{t("journals.status.completed")}</option>
          <option value="archived">{t("journals.status.archived")}</option>
        </select>

        <select
          className="px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={filters.period}
          onChange={(e) => setFilters({ ...filters, period: e.target.value })}
        >
          <option value="all">{t("journals.filters.allTime")}</option>
          <option value="today">{t("journals.filters.today")}</option>
          <option value="week">{t("journals.filters.thisWeek")}</option>
          <option value="month">{t("journals.filters.thisMonth")}</option>
          <option value="year">{t("journals.filters.thisYear")}</option>
        </select>
      </div>

      {/* Active Medications Panel */}
      {hasActiveMedications && (
        <div className="mb-6 p-4 bg-primary bg-opacity-5 rounded-lg border border-primary border-opacity-20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-primary flex items-center gap-2">
              <EntryTypeIcon type="medication" className="h-5 w-5" />
              {t("journals.activeMedications")}
            </h3>

            <button
              onClick={() => onCreateMedication()}
              className="text-primary hover:text-primary-focus text-sm font-medium flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t("journals.actions.addMedication")}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {medications
              .filter((m) => m.isActive)
              .map((medication) => (
                <div
                  key={medication.id}
                  className="bg-base-100 p-3 rounded-lg border border-base-300 hover:border-primary cursor-pointer transition-colors"
                  onClick={() => onCreateJournal("medication", medication)}
                >
                  <div className="font-medium">{medication.name}</div>
                  <div className="text-sm text-neutral">
                    {medication.standardDose} - {medication.frequency}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Journal Timeline */}
      {groupedJournals.length > 0 ? (
        <div className="space-y-8">
          {groupedJournals.map((group) => (
            <div key={group.date} className="relative">
              {/* Date heading */}
              <div className="mb-4 sticky top-0 z-10 bg-base-100 py-2">
                <h3 className="text-lg font-medium">{group.formattedDate}</h3>
              </div>

              {/* Timeline */}
              <div className="border-l-2 border-base-300 pl-6 ml-4 space-y-6">
                {group.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="relative"
                    onClick={() => handleViewJournal(entry.id)}
                  >
                    {/* Timeline node */}
                    <div className="absolute -left-9 mt-1 w-4 h-4 rounded-full bg-base-100 border-2 border-base-300 flex items-center justify-center">
                      <EntryTypeIcon
                        type={entry.entryType}
                        className={`h-3 w-3 ${
                          entry.entryType === "incident"
                            ? "text-error"
                            : entry.entryType === "medication"
                            ? "text-success"
                            : entry.entryType === "drug_test"
                            ? "text-primary"
                            : "text-neutral"
                        }`}
                      />
                    </div>

                    {/* Entry content */}
                    <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 hover:border-primary cursor-pointer transition-colors p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{entry.title}</h4>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              entry.status
                            )}`}
                          >
                            {t(`journals.status.${entry.status}`)}
                          </span>
                        </div>
                        <div className="text-xs text-neutral">
                          {formatDate(entry.createdAt)}
                        </div>
                      </div>

                      {/* Type-specific content */}
                      {renderEntryContent(entry)}

                      {/* Created by */}
                      <div className="mt-3 text-xs text-neutral">
                        {t("journals.fields.createdBy")}: {entry.createdByName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral text-lg">
            {searchTerm ||
            filters.entryType !== "all" ||
            filters.status !== "all" ||
            filters.period !== "all"
              ? t("journals.noResults")
              : t("journals.empty")}
          </p>
          <button
            onClick={() => handleNewEntryClick("note")}
            className="btn btn-primary mt-4"
          >
            {t("journals.actions.createFirst")}
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientJournals;
