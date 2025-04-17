// src/renderer/components/journals/IncidentEntryForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";

const IncidentEntryForm = ({ formData, onChange, errors }) => {
  const { t } = useTranslation();
  const [isEditable, setIsEditable] = useState(true);

  // Available severity levels
  const severityLevels = ["low", "medium", "high"];

  // Check if entry is completed/signed to disable editing
  useEffect(() => {
    setIsEditable(formData.status === "draft" || !formData.status);
  }, [formData.status]);

  // Handle input change
  const handleChange = (e) => {
    if (!isEditable) return;

    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  // Handle severity selection
  const handleSeverityChange = (severity) => {
    if (!isEditable) return;

    onChange({ incidentSeverity: severity });
  };

  // Parse versioned content for notes
  const parseVersionedContent = (content) => {
    if (!content) return { current: "", previous: [] };

    // Split by version marker (timestamp)
    const parts = content.split(
      /\n\n--- \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} ---\n\n/
    );

    if (parts.length <= 1) {
      // No versions found, just return the content
      return { current: content, previous: [] };
    }

    // First part is the newest content
    const current = parts[0];

    // Get timestamps for labeling previous versions
    const timestamps =
      content.match(/\n\n--- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) ---\n\n/g) ||
      [];
    const formattedTimestamps = timestamps
      .map((ts) => ts.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/))
      .filter(Boolean)
      .map((match) => match[1]);

    // Create previous versions with their timestamps
    const previous = [];
    for (let i = 1; i < parts.length; i++) {
      previous.push({
        content: parts[i],
        timestamp: formattedTimestamps[i - 1] || "Unknown date",
      });
    }

    return { current, previous };
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
              } ${!isEditable ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={() => handleSeverityChange("low")}
              disabled={!isEditable}
            >
              {t("journals.incident.severity.low")}
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-lg border ${
                formData.incidentSeverity === "medium"
                  ? "bg-warning bg-opacity-10 border-warning text-warning"
                  : "bg-base-100 border-base-300"
              } ${!isEditable ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={() => handleSeverityChange("medium")}
              disabled={!isEditable}
            >
              {t("journals.incident.severity.medium")}
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-lg border ${
                formData.incidentSeverity === "high"
                  ? "bg-error bg-opacity-10 border-error text-error"
                  : "bg-base-100 border-base-300"
              } ${!isEditable ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={() => handleSeverityChange("high")}
              disabled={!isEditable}
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
          {isEditable ? (
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
          ) : (
            <div className="p-3 border rounded-md bg-base-200 whitespace-pre-wrap">
              {formData.incidentDetails || ""}
            </div>
          )}
          {errors.incidentDetails && (
            <p className="text-error text-sm mt-1">{errors.incidentDetails}</p>
          )}
          <p className="text-xs text-neutral mt-1">
            {t("journals.incident.detailsHelp")}
          </p>
        </div>
      </div>

      {/* Follow-up actions/notes section with versioning */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {t("journals.incident.followUpActions")}
        </label>
        {isEditable ? (
          // If editable, show the editor with versioning
          <>
            {(() => {
              const { current, previous } = parseVersionedContent(
                formData.content
              );

              return (
                <>
                  {/* Text area for current content */}
                  <textarea
                    name="content"
                    rows="4"
                    value={current}
                    onChange={handleChange}
                    placeholder={t(
                      "journals.incident.followUpActionsPlaceholder"
                    )}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
                  ></textarea>

                  {/* Show previous versions if they exist */}
                  {previous.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-neutral mb-2">
                        {t("journals.previousVersions")}
                      </div>

                      {previous.map((version, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-md bg-base-200 mb-2"
                        >
                          <div className="text-xs text-neutral mb-1">
                            {t("journals.versionFrom", {
                              date: version.timestamp,
                            })}
                          </div>
                          <div className="whitespace-pre-wrap text-neutral line-through">
                            {version.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </>
        ) : (
          // If not editable, just show the content
          (() => {
            const { current, previous } = parseVersionedContent(
              formData.content
            );

            return (
              <>
                {current && (
                  <div className="p-3 border rounded-md bg-base-100 whitespace-pre-wrap">
                    {current}
                  </div>
                )}

                {previous.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-neutral mb-2">
                      {t("journals.previousVersions")}
                    </div>

                    {previous.map((version, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-md bg-base-200 mb-2"
                      >
                        <div className="text-xs text-neutral mb-1">
                          {t("journals.versionFrom", {
                            date: version.timestamp,
                          })}
                        </div>
                        <div className="whitespace-pre-wrap text-neutral line-through">
                          {version.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default IncidentEntryForm;
