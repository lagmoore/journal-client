// src/renderer/components/journals/DrugTestEntryForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";

const DrugTestEntryForm = ({ formData, onChange, errors }) => {
  const { t } = useTranslation();
  const [isEditable, setIsEditable] = useState(true);

  // Common substances for positive drug tests
  const commonSubstances = [
    "cannabis",
    "amfetamin",
    "kokain",
    "bensodiazepiner",
    "opiater",
    "tramadol",
    "fentanyl",
    "MDMA",
    "metadon",
    "buprenorfin",
  ];

  // Available test types
  const testTypes = ["droger", "alkohol", "kombinerat"];

  // Available test methods
  const testMethods = ["urin", "utandning", "blod", "saliv"];

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

  // Handle test result change
  const handleResultChange = (result) => {
    if (!isEditable) return;

    onChange({ testResult: result });

    // If switching to negative, clear positive substances
    if (result === "negative") {
      onChange({ positiveSubstances: [] });
    }
  };

  // Handle substance selection
  const handleSubstanceToggle = (substance) => {
    if (!isEditable) return;

    const currentSubstances = formData.positiveSubstances || [];
    let newSubstances;

    if (currentSubstances.includes(substance)) {
      // Remove substance if already selected
      newSubstances = currentSubstances.filter((s) => s !== substance);
    } else {
      // Add substance if not selected
      newSubstances = [...currentSubstances, substance];
    }

    onChange({ positiveSubstances: newSubstances });
  };

  // Handle custom substance addition
  const handleAddCustomSubstance = (e) => {
    if (!isEditable) return;

    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const substance = e.target.value.trim();
      const currentSubstances = formData.positiveSubstances || [];

      if (!currentSubstances.includes(substance)) {
        onChange({ positiveSubstances: [...currentSubstances, substance] });
        e.target.value = "";
      }
    }
  };

  // Check if breath test is selected (for alcohol)
  const isBreathTest = formData.testMethod === "utandning";

  // Should show positive substances section?
  const showPositiveSubstances =
    formData.testResult === "positive" && !isBreathTest;

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
      <div className="p-4 bg-primary bg-opacity-5 rounded-lg border border-primary border-opacity-20">
        <h3 className="font-medium text-primary mb-4">
          {t("journals.drugTest.title")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Test type selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("journals.drugTest.testType")}
              <span className="text-error ml-1">*</span>
            </label>
            <select
              name="testType"
              value={formData.testType || ""}
              onChange={handleChange}
              disabled={!isEditable}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.testType ? "border-error" : "border-base-300"
              } ${!isEditable ? "bg-base-200" : ""}`}
            >
              <option value="">{t("journals.drugTest.selectTestType")}</option>
              {testTypes.map((type) => (
                <option key={type} value={type}>
                  {t(`journals.drugTest.types.${type}`)}
                </option>
              ))}
            </select>
            {errors.testType && (
              <p className="text-error text-sm mt-1">{errors.testType}</p>
            )}
          </div>

          {/* Test method selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("journals.drugTest.testMethod")}
              <span className="text-error ml-1">*</span>
            </label>
            <select
              name="testMethod"
              value={formData.testMethod || ""}
              onChange={handleChange}
              disabled={!isEditable}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.testMethod ? "border-error" : "border-base-300"
              } ${!isEditable ? "bg-base-200" : ""}`}
            >
              <option value="">
                {t("journals.drugTest.selectTestMethod")}
              </option>
              {testMethods.map((method) => (
                <option key={method} value={method}>
                  {t(`journals.drugTest.methods.${method}`)}
                </option>
              ))}
            </select>
            {errors.testMethod && (
              <p className="text-error text-sm mt-1">{errors.testMethod}</p>
            )}
          </div>
        </div>

        {/* Test result selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {t("journals.drugTest.testResult")}
            <span className="text-error ml-1">*</span>
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-lg border ${
                formData.testResult === "negative"
                  ? "bg-success bg-opacity-10 border-success text-success"
                  : "bg-base-100 border-base-300"
              } ${!isEditable ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={() => handleResultChange("negative")}
              disabled={!isEditable}
            >
              {t("common.negative")}
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-lg border ${
                formData.testResult === "positive"
                  ? "bg-error bg-opacity-10 border-error text-error"
                  : "bg-base-100 border-base-300"
              } ${!isEditable ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={() => handleResultChange("positive")}
              disabled={!isEditable}
            >
              {t("common.positive")}
            </button>
          </div>
          {errors.testResult && (
            <p className="text-error text-sm mt-1">{errors.testResult}</p>
          )}
        </div>

        {/* Positive substances section */}
        {showPositiveSubstances && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              {t("journals.drugTest.positiveSubstances")}
              <span className="text-error ml-1">*</span>
            </label>

            <div className="flex flex-wrap gap-2 mb-3">
              {commonSubstances.map((substance) => (
                <button
                  key={substance}
                  type="button"
                  className={`px-3 py-1 rounded-lg text-sm border ${
                    formData.positiveSubstances?.includes(substance)
                      ? "bg-error bg-opacity-10 border-error text-error"
                      : "bg-base-100 border-base-300"
                  } ${!isEditable ? "opacity-70 cursor-not-allowed" : ""}`}
                  onClick={() => handleSubstanceToggle(substance)}
                  disabled={!isEditable}
                >
                  {t(`journals.drugTest.substances.${substance}`)}
                </button>
              ))}
            </div>

            {isEditable && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder={t("journals.drugTest.addSubstancePlaceholder")}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
                  onKeyDown={handleAddCustomSubstance}
                  disabled={!isEditable}
                />
                <p className="text-xs text-neutral mt-1">
                  {t("journals.drugTest.pressEnterToAdd")}
                </p>
              </div>
            )}

            {/* Show selected substances */}
            {formData.positiveSubstances?.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium mb-1">
                  {t("journals.drugTest.selectedSubstances")}:
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.positiveSubstances.map((substance, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-error bg-opacity-10 text-error text-sm rounded-lg flex items-center"
                    >
                      {substance}
                      {isEditable && (
                        <button
                          type="button"
                          className="ml-1 text-error hover:text-error-focus"
                          onClick={() => handleSubstanceToggle(substance)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.positiveSubstances && (
              <p className="text-error text-sm mt-2">
                {errors.positiveSubstances}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Notes section with versioning */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {t("journals.drugTest.notes")}
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
                    placeholder={t("journals.drugTest.notesPlaceholder")}
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

export default DrugTestEntryForm;
