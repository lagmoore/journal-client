// src/renderer/components/journals/IncidentEntryForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";

const IncidentEntryForm = ({ formData, onChange, errors }) => {
  const { t } = useTranslation();

  // Available severity levels
  const severityLevels = ["low", "medium", "high"];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  // Handle severity selection
  const handleSeverityChange = (severity) => {
    onChange({ incidentSeverity: severity });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-error bg-opacity-5 rounded-lg border border-error border-opacity-20">
        <h3 className="font-medium text-error mb-4">
          {t("journals.incident.title")}
        </h3>

        {/* Incident severity selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {t("journals.incident.severity.title")}
            <span className="text-error ml-1">*</span>
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-lg border ${
                formData.incidentSeverity === "low"
                  ? "bg-info bg-opacity-10 border-info text-info"
                  : "bg-base-100 border-base-300"
              }`}
              onClick={() => handleSeverityChange("low")}
            >
              {t("journals.incident.severity.low")}
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-lg border ${
                formData.incidentSeverity === "medium"
                  ? "bg-warning bg-opacity-10 border-warning text-warning"
                  : "bg-base-100 border-base-300"
              }`}
              onClick={() => handleSeverityChange("medium")}
            >
              {t("journals.incident.severity.medium")}
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-lg border ${
                formData.incidentSeverity === "high"
                  ? "bg-error bg-opacity-10 border-error text-error"
                  : "bg-base-100 border-base-300"
              }`}
              onClick={() => handleSeverityChange("high")}
            >
              {t("journals.incident.severity.high")}
            </button>
          </div>
          {errors.incidentSeverity && (
            <p className="text-error text-sm mt-1">{errors.incidentSeverity}</p>
          )}
        </div>

        {/* Incident details */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {t("journals.incident.details")}
            <span className="text-error ml-1">*</span>
          </label>
          <textarea
            name="incidentDetails"
            rows="6"
            value={formData.incidentDetails || ""}
            onChange={handleChange}
            placeholder={t("journals.incident.detailsPlaceholder")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.incidentDetails ? "border-error" : "border-base-300"
            }`}
          ></textarea>
          {errors.incidentDetails && (
            <p className="text-error text-sm mt-1">{errors.incidentDetails}</p>
          )}
          <p className="text-xs text-neutral mt-1">
            {t("journals.incident.detailsHelp")}
          </p>
        </div>

        {/* Follow-up actions */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {t("journals.incident.followUpActions")}
          </label>
          <textarea
            name="content"
            rows="4"
            value={formData.content || ""}
            onChange={handleChange}
            placeholder={t("journals.incident.followUpActionsPlaceholder")}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default IncidentEntryForm;
