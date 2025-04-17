// src/renderer/components/journals/JournalForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import toast from "react-hot-toast";
import FormInput from "../FormInput";

// Import specialized form components for each entry type
import MedicationEntryForm from "./MedicationEntryForm";
import DrugTestEntryForm from "./DrugTestEntryForm";
import IncidentEntryForm from "./IncidentEntryForm";

const JournalForm = ({ journal, journalId, medications, onSave, isNew }) => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();

  // Form state
  const [formData, setFormData] = useState(journal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [originalContent, setOriginalContent] = useState("");

  // Determine the entry type - default to 'note' if not specified
  const entryType = formData.entryType || "note";

  // Available categories
  const categories = [
    "daily",
    "medical",
    "behavioral",
    "educational",
    "social",
    "other",
  ];

  // Set default title based on entry type for new entries
  useEffect(() => {
    if (
      isNew &&
      entryType !== "note" &&
      (!formData.title || formData.title === "")
    ) {
      let defaultTitle = "";
      switch (entryType) {
        case "medication":
          defaultTitle = t("journals.medication.title");
          break;
        case "drug_test":
          defaultTitle = t("journals.drugTest.defaultTitle");
          break;
        case "incident":
          defaultTitle = t("journals.incident.defaultTitle");
          break;
        default:
          defaultTitle = "";
      }

      setFormData((prev) => ({
        ...prev,
        title: defaultTitle,
      }));
    }
  }, [isNew, entryType, t, formData.title]);

  // Update form data when journal changes
  useEffect(() => {
    setFormData(journal);
    setOriginalContent(journal.content || "");
    setIsDirty(false);
  }, [journal]);

  // Parse versioned content
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

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "content") {
      // For content, we only update the current version's text
      // The backend will handle versioning when saved
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      // For other fields, update normally
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setIsDirty(true);

    // Clear specific error when field is updated
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle specialized form change
  const handleSpecializedFormChange = (data) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
    setIsDirty(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title?.trim()) {
      errors.title = t("validation.required");
    }

    // Validate based on entry type
    switch (entryType) {
      case "note":
        if (!formData.content?.trim()) {
          errors.content = t("validation.required");
        }
        break;

      case "medication":
        if (!formData.medicationName) {
          errors.medicationName = t("validation.required");
        }
        if (!formData.medicationDose) {
          errors.medicationDose = t("validation.required");
        }
        break;

      case "drug_test":
        if (!formData.testType) {
          errors.testType = t("validation.required");
        }
        if (!formData.testMethod) {
          errors.testMethod = t("validation.required");
        }
        if (!formData.testResult) {
          errors.testResult = t("validation.required");
        }
        // Require positive substances for positive non-breath test
        if (
          formData.testResult === "positive" &&
          formData.testMethod !== "utandning" &&
          (!formData.positiveSubstances ||
            formData.positiveSubstances.length === 0)
        ) {
          errors.positiveSubstances = t(
            "journals.drugTest.errorRequiredSubstances"
          );
        }
        break;

      case "incident":
        if (!formData.incidentSeverity) {
          errors.incidentSeverity = t("validation.required");
        }
        if (!formData.incidentDetails?.trim()) {
          errors.incidentDetails = t("validation.required");
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Always set status to draft for new entries
      const dataToSave = isNew ? { ...formData, status: "draft" } : formData;

      const result = await onSave(dataToSave);

      if (result === true) {
        // Success
        setIsDirty(false);
        if (isNew) {
          setOriginalContent(formData.content || "");
        }
      } else if (result && result.validationErrors) {
        // Backend validation errors
        setFormErrors(result.validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status change
  const handleStatusChange = (status) => {
    setFormData((prev) => ({
      ...prev,
      status,
    }));
    setIsDirty(true);
  };

  // Handle entry signing
  const handleSignJournal = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Call the sign endpoint
      const response = await api.post(
        `/journals/${journalId}/sign`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        // Update local state with the signed journal
        setFormData(response.data.journal);
        toast.success(t("journals.success.signed"));
        setIsDirty(false);
      } else {
        toast.error(response.data.message || t("journals.errors.signFailed"));
      }
    } catch (error) {
      console.error("Error signing journal:", error);
      toast.error(t("journals.errors.signFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render appropriate form based on entry type
  const renderEntryTypeForm = () => {
    // First check if entry is completed or archived - only show readonly view for these
    if (formData.status === "completed" || formData.status === "archived") {
      // Return readonly view based on entry type
      switch (entryType) {
        case "medication":
          const { current: medCurrent, previous: medPrevious } =
            parseVersionedContent(formData.content);

          return (
            <div className="space-y-6">
              <div className="p-4 bg-success bg-opacity-5 rounded-lg border border-success border-opacity-20">
                <h3 className="font-medium text-success mb-4">
                  {t("journals.medication.title")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium mb-1">
                      {t("journals.medication.medicationName")}
                    </div>
                    <div className="p-3 border rounded-md bg-base-200">
                      {formData.medicationName || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">
                      {t("journals.medication.dose")}
                    </div>
                    <div className="p-3 border rounded-md bg-base-200">
                      {formData.medicationDose || "-"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">
                    {t("journals.medication.time")}
                  </div>
                  <div className="p-3 border rounded-md bg-base-200">
                    {formData.medicationTime
                      ? new Date(formData.medicationTime).toLocaleString()
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Current notes */}
              {medCurrent && (
                <div>
                  <div className="text-sm font-medium mb-1">
                    {t("journals.medication.notes")}
                  </div>
                  <div className="p-3 border rounded-md bg-base-100 whitespace-pre-wrap">
                    {medCurrent}
                  </div>
                </div>
              )}

              {/* Previous versions */}
              {medPrevious.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-neutral mb-2">
                    {t("journals.previousVersions")}
                  </div>

                  {medPrevious.map((version, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-md bg-base-200 mb-2"
                    >
                      <div className="text-xs text-neutral mb-1">
                        {t("journals.versionFrom", { date: version.timestamp })}
                      </div>
                      <div className="whitespace-pre-wrap text-neutral line-through">
                        {version.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

        case "drug_test":
          const { current: testCurrent, previous: testPrevious } =
            parseVersionedContent(formData.content);

          return (
            <div className="space-y-6">
              <div className="p-4 bg-primary bg-opacity-5 rounded-lg border border-primary border-opacity-20">
                <h3 className="font-medium text-primary mb-4">
                  {t("journals.drugTest.title")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium mb-1">
                      {t("journals.drugTest.testType")}
                    </div>
                    <div className="p-3 border rounded-md bg-base-200">
                      {formData.testType || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">
                      {t("journals.drugTest.testMethod")}
                    </div>
                    <div className="p-3 border rounded-md bg-base-200">
                      {formData.testMethod || "-"}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium mb-1">
                    {t("journals.drugTest.testResult")}
                  </div>
                  <div className="p-3 border rounded-md bg-base-200">
                    {formData.testResult === "positive"
                      ? t("common.positive")
                      : t("common.negative")}
                  </div>
                </div>

                {formData.testResult === "positive" &&
                  formData.positiveSubstances?.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1">
                        {t("journals.drugTest.positiveSubstances")}
                      </div>
                      <div className="p-3 border rounded-md bg-base-200">
                        <div className="flex flex-wrap gap-1">
                          {formData.positiveSubstances.map(
                            (substance, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-base-300 rounded-full text-xs"
                              >
                                {substance}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Current notes */}
              {testCurrent && (
                <div>
                  <div className="text-sm font-medium mb-1">
                    {t("journals.drugTest.notes")}
                  </div>
                  <div className="p-3 border rounded-md bg-base-100 whitespace-pre-wrap">
                    {testCurrent}
                  </div>
                </div>
              )}

              {/* Previous versions */}
              {testPrevious.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-neutral mb-2">
                    {t("journals.previousVersions")}
                  </div>

                  {testPrevious.map((version, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-md bg-base-200 mb-2"
                    >
                      <div className="text-xs text-neutral mb-1">
                        {t("journals.versionFrom", { date: version.timestamp })}
                      </div>
                      <div className="whitespace-pre-wrap text-neutral line-through">
                        {version.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

        case "incident":
          const { current: incidentCurrent, previous: incidentPrevious } =
            parseVersionedContent(formData.content);

          return (
            <div className="space-y-6">
              <div className="p-4 bg-error bg-opacity-5 rounded-lg border border-error border-opacity-20">
                <h3 className="font-medium text-error mb-4">
                  {t("journals.incident.title")}
                </h3>

                <div className="mb-4">
                  <div className="text-sm font-medium mb-1">
                    {t("journals.incident.severity.title")}
                  </div>
                  <div className="p-3 border rounded-md bg-base-200">
                    {t(
                      `journals.incident.severity.${
                        formData.incidentSeverity || "low"
                      }`
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium mb-1">
                    {t("journals.incident.details")}
                  </div>
                  <div className="p-3 border rounded-md bg-base-200 whitespace-pre-wrap">
                    {formData.incidentDetails || "-"}
                  </div>
                </div>
              </div>

              {/* Current notes */}
              {incidentCurrent && (
                <div>
                  <div className="text-sm font-medium mb-1">
                    {t("journals.incident.followUpActions")}
                  </div>
                  <div className="p-3 border rounded-md bg-base-100 whitespace-pre-wrap">
                    {incidentCurrent}
                  </div>
                </div>
              )}

              {/* Previous versions */}
              {incidentPrevious.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-neutral mb-2">
                    {t("journals.previousVersions")}
                  </div>

                  {incidentPrevious.map((version, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-md bg-base-200 mb-2"
                    >
                      <div className="text-xs text-neutral mb-1">
                        {t("journals.versionFrom", { date: version.timestamp })}
                      </div>
                      <div className="whitespace-pre-wrap text-neutral line-through">
                        {version.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

        case "note":
          const { current, previous } = parseVersionedContent(formData.content);

          return (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t("journals.fields.content")}
              </label>

              {/* Current content */}
              <div className="p-3 border rounded-md bg-base-100 mb-4">
                <div className="whitespace-pre-wrap">{current}</div>
              </div>

              {/* Previous versions */}
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
                        {t("journals.versionFrom", { date: version.timestamp })}
                      </div>
                      <div className="whitespace-pre-wrap text-neutral line-through">
                        {version.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
      }
    }

    // If journal is in draft state, render the normal edit forms
    switch (entryType) {
      case "medication":
        return (
          <MedicationEntryForm
            formData={formData}
            medications={medications}
            onChange={handleSpecializedFormChange}
            errors={formErrors}
          />
        );

      case "drug_test":
        return (
          <DrugTestEntryForm
            formData={formData}
            onChange={handleSpecializedFormChange}
            errors={formErrors}
          />
        );

      case "incident":
        return (
          <IncidentEntryForm
            formData={formData}
            onChange={handleSpecializedFormChange}
            errors={formErrors}
          />
        );

      case "note":
      default:
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("journals.fields.content")}
              <span className="text-error ml-1">*</span>
            </label>

            {formData.status === "draft" ? (
              // For draft status, show editor
              <>
                {/* Parse the versioned content */}
                {(() => {
                  const { current, previous } = parseVersionedContent(
                    formData.content
                  );

                  return (
                    <>
                      {/* Text area for current content */}
                      <textarea
                        name="content"
                        rows="8"
                        value={current}
                        onChange={handleChange}
                        placeholder={t("journals.placeholders.content")}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                          formErrors.content
                            ? "border-error"
                            : "border-base-300"
                        }`}
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
              // For completed or archived status, show readonly view
              (() => {
                const { current, previous } = parseVersionedContent(
                  formData.content
                );

                return (
                  <div>
                    {/* Current content */}
                    <div className="p-3 border rounded-md bg-base-100 mb-4">
                      <div className="whitespace-pre-wrap">{current}</div>
                    </div>

                    {/* Previous versions */}
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
                  </div>
                );
              })()
            )}

            {formErrors.content && (
              <p className="text-error text-sm mt-1">{formErrors.content}</p>
            )}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Entry type indicator (for existing journals) */}
      {!isNew && (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary bg-opacity-10 text-primary text-sm font-medium">
          {t(`journals.entryTypes.${entryType}`)}
        </div>
      )}

      {/* Journal status indicator */}
      {!isNew && (
        <div className="flex justify-between items-center">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full ${
              formData.status === "completed"
                ? "bg-success bg-opacity-10 text-success"
                : formData.status === "archived"
                ? "bg-neutral bg-opacity-10 text-neutral"
                : "bg-info bg-opacity-10 text-info"
            } text-sm font-medium`}
          >
            {t(`journals.status.${formData.status}`)}
          </div>

          {formData.status === "completed" && formData.updatedByName && (
            <div className="text-sm text-neutral">
              {t("journals.signedBy", {
                user: formData.updatedByName,
                date: new Date(formData.updatedAt).toLocaleDateString(),
                time: new Date(formData.updatedAt).toLocaleTimeString(),
              })}
            </div>
          )}

          {formData.status === "draft" && (
            <div className="text-sm text-warning">
              {t("journals.notSigned")}
            </div>
          )}
        </div>
      )}

      {/* Journal details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Only show title and category inputs for note type or if we need to edit */}
        {(entryType === "note" || (!isNew && formData.status === "draft")) && (
          <>
            <FormInput
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              label={t("journals.fields.title")}
              placeholder={t("journals.placeholders.title")}
              required
              errorMessage={formErrors.title}
              disabled={
                formData.status === "completed" ||
                formData.status === "archived"
              }
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t("journals.fields.category")}
              </label>
              <select
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300 ${
                  formData.status === "completed" ||
                  formData.status === "archived"
                    ? "bg-base-200"
                    : ""
                }`}
                disabled={
                  formData.status === "completed" ||
                  formData.status === "archived"
                }
              >
                <option value="">{t("journals.placeholders.category")}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {t(`journals.categories.${category}`)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Hide inputs for specialized journal types if it's a new entry */}
        {isNew && entryType !== "note" && (
          <div className="md:col-span-2">
            <h3 className="font-medium text-lg mb-2">
              {t(`journals.new.${entryType}`)}
            </h3>
            {/* We could add a description here if needed */}
          </div>
        )}
      </div>

      {/* Type-specific form */}
      {renderEntryTypeForm()}

      {/* Status buttons - only show for existing journals */}
      {!isNew && (
        <div className="p-4 bg-base-200 rounded-lg border border-base-300">
          <label className="block text-sm font-medium mb-2">
            {t("journals.fields.status")}
          </label>

          {/* For draft journals, show full controls */}
          {formData.status === "draft" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md border bg-success text-white border-success"
                onClick={handleSignJournal}
              >
                {t("journals.actions.sign")}
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-md border bg-info bg-opacity-10 border-info text-info"
                disabled
              >
                {t("journals.status.draft")}
              </button>
            </div>
          )}

          {/* For completed journals, only show archive option */}
          {formData.status === "completed" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md border bg-success bg-opacity-10 border-success text-success"
                disabled
              >
                {t("journals.status.completed")}
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-md border bg-base-100 border-base-300 text-neutral"
                onClick={() => handleStatusChange("archived")}
              >
                {t("journals.status.archived")}
              </button>
            </div>
          )}

          {/* For archived journals, just show the status */}
          {formData.status === "archived" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md border bg-neutral bg-opacity-10 border-neutral text-neutral"
                disabled
              >
                {t("journals.status.archived")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form actions */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={
            isSubmitting ||
            (!isDirty && !isNew) ||
            formData.status === "completed" ||
            formData.status === "archived"
          }
          className="btn btn-primary"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {t("common.saving")}
            </span>
          ) : isNew ? (
            t("common.create")
          ) : (
            t("common.save")
          )}
        </button>
      </div>
    </form>
  );
};

export default JournalForm;
