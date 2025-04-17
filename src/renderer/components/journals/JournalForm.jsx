// src/renderer/components/journals/JournalForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";

// Import specialized form components for each entry type
import MedicationEntryForm from "./MedicationEntryForm";
import DrugTestEntryForm from "./DrugTestEntryForm";
import IncidentEntryForm from "./IncidentEntryForm";

const JournalForm = ({ journal, medications, onSave, isNew }) => {
  const { t } = useTranslation();

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

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // For content, if this is an existing journal and not in draft status,
    // we need to append instead of replacing
    if (name === "content" && !isNew && formData.status !== "draft") {
      const newContent =
        originalContent +
        "\n\n--- " +
        new Date().toLocaleString() +
        " ---\n" +
        value;
      setFormData((prev) => ({
        ...prev,
        content: newContent,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setIsDirty(true);
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
  const handleSignJournal = () => {
    handleStatusChange("completed");
  };

  // Render appropriate form based on entry type
  const renderEntryTypeForm = () => {
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
            {!isNew && formData.status !== "draft" ? (
              <div>
                <div className="w-full px-3 py-2 border rounded-md bg-base-200 mb-4">
                  <div
                    style={{ textDecoration: "line-through" }}
                    className="whitespace-pre-wrap"
                  >
                    {originalContent}
                  </div>
                </div>
                <textarea
                  name="content"
                  rows="6"
                  value={
                    formData.content
                      ? formData.content
                          .replace(originalContent, "")
                          .replace(/^(\n\n--- .* ---\n)/, "")
                      : ""
                  }
                  onChange={handleChange}
                  placeholder={t("journals.placeholders.content")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    formErrors.content ? "border-error" : "border-base-300"
                  }`}
                ></textarea>
              </div>
            ) : (
              <textarea
                name="content"
                rows="12"
                value={formData.content || ""}
                onChange={handleChange}
                placeholder={t("journals.placeholders.content")}
                disabled={formData.status === "completed"}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                  formErrors.content ? "border-error" : "border-base-300"
                } ${formData.status === "completed" ? "bg-base-200" : ""}`}
              ></textarea>
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
              disabled={formData.status === "completed"}
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
                  formData.status === "completed" ? "bg-base-200" : ""
                }`}
                disabled={formData.status === "completed"}
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
          <div className="flex flex-wrap gap-2">
            {formData.status === "draft" && (
              <>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border bg-success text-white border-success"
                  onClick={handleSignJournal}
                >
                  {t("journals.actions.sign")}
                </button>

                <button
                  type="button"
                  className={`px-4 py-2 rounded-md border ${
                    formData.status === "draft"
                      ? "bg-info bg-opacity-10 border-info text-info"
                      : "bg-base-100 border-base-300 text-neutral"
                  }`}
                  disabled
                >
                  {t("journals.status.draft")}
                </button>
              </>
            )}

            {formData.status === "completed" && (
              <button
                type="button"
                className={`px-4 py-2 rounded-md border ${
                  formData.status === "completed"
                    ? "bg-success bg-opacity-10 border-success text-success"
                    : "bg-base-100 border-base-300 text-neutral"
                }`}
                disabled
              >
                {t("journals.status.completed")}
              </button>
            )}

            <button
              type="button"
              className={`px-4 py-2 rounded-md border ${
                formData.status === "archived"
                  ? "bg-neutral bg-opacity-10 border-neutral text-neutral"
                  : "bg-base-100 border-base-300 text-neutral"
              }`}
              onClick={() => handleStatusChange("archived")}
              disabled={formData.status === "archived"}
            >
              {t("journals.status.archived")}
            </button>
          </div>
        </div>
      )}

      {/* Form actions */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={
            isSubmitting ||
            (!isDirty && !isNew) ||
            formData.status === "completed"
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
