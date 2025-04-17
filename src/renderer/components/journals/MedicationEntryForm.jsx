// src/renderer/components/journals/MedicationEntryForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";

const MedicationEntryForm = ({ formData, medications, onChange, errors }) => {
  const { t } = useTranslation();
  const [useExistingMedication, setUseExistingMedication] = useState(true);
  const [isEditable, setIsEditable] = useState(true);

  // Check if entry is completed/signed to disable editing
  useEffect(() => {
    setIsEditable(formData.status !== "completed");
  }, [formData.status]);

  // Handle input change
  const handleChange = (e) => {
    if (!isEditable) return;

    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  // Handle medication selection
  const handleMedicationSelect = (medication) => {
    if (!isEditable) return;

    onChange({
      medicationName: medication.name,
      medicationDose: medication.standardDose,
    });
  };

  // Handle time selection
  const handleTimeChange = (e) => {
    if (!isEditable) return;

    onChange({ medicationTime: e.target.value });
  };

  // Generate current time in format suitable for time input
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // If no medicationTime is set, initialize with current time
  useEffect(() => {
    if (!formData.medicationTime && isEditable) {
      const today = new Date().toISOString().split("T")[0];
      const currentTime = getCurrentTime();
      onChange({ medicationTime: `${today}T${currentTime}` });
    }
  }, [formData.medicationTime, isEditable]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-success bg-opacity-5 rounded-lg border border-success border-opacity-20">
        <h3 className="font-medium text-success mb-4">
          {t("journals.medication.title")}
        </h3>

        {/* Medication selection method toggle - Only show if there are medications and entry is editable */}
        {medications && medications.length > 0 && isEditable && (
          <div className="mb-4">
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  useExistingMedication
                    ? "bg-success bg-opacity-10 border-success text-success"
                    : "bg-base-100 border-base-300"
                }`}
                onClick={() => setUseExistingMedication(true)}
                disabled={!isEditable}
              >
                {t("journals.medication.existingMedication")}
              </button>
              <button
                type="button"
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  !useExistingMedication
                    ? "bg-success bg-opacity-10 border-success text-success"
                    : "bg-base-100 border-base-300"
                }`}
                onClick={() => setUseExistingMedication(false)}
                disabled={!isEditable}
              >
                {t("journals.medication.newMedication")}
              </button>
            </div>
          </div>
        )}

        {/* Existing medications selection - Display if medications exist and using existing medication option */}
        {useExistingMedication && medications && medications.length > 0 ? (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {t("journals.medication.selectMedication")}
              <span className="text-error ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {medications
                .filter((med) => med.isActive)
                .map((medication) => (
                  <button
                    key={medication.id}
                    type="button"
                    className={`p-3 text-left rounded-lg border ${
                      formData.medicationName === medication.name
                        ? "bg-success bg-opacity-10 border-success"
                        : "bg-base-100 border-base-300 hover:border-success"
                    }`}
                    onClick={() => handleMedicationSelect(medication)}
                    disabled={!isEditable}
                  >
                    <div className="font-medium">{medication.name}</div>
                    <div className="text-sm">{medication.standardDose}</div>
                  </button>
                ))}
            </div>
            {errors.medicationName && (
              <p className="text-error text-sm">{errors.medicationName}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput
              type="text"
              name="medicationName"
              value={formData.medicationName || ""}
              onChange={handleChange}
              label={t("journals.medication.medicationName")}
              placeholder={t("journals.medication.medicationNamePlaceholder")}
              required
              errorMessage={errors.medicationName}
              disabled={!isEditable}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            type="text"
            name="medicationDose"
            value={formData.medicationDose || ""}
            onChange={handleChange}
            label={t("journals.medication.dose")}
            placeholder={t("journals.medication.dosePlaceholder")}
            required
            errorMessage={errors.medicationDose}
            disabled={!isEditable}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("journals.medication.time")}
              <span className="text-error ml-1">*</span>
            </label>
            <input
              type="datetime-local"
              name="medicationTime"
              value={formData.medicationTime || ""}
              onChange={handleTimeChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.medicationTime ? "border-error" : "border-base-300"
              } ${!isEditable ? "bg-base-200" : ""}`}
              disabled={!isEditable}
            />
            {errors.medicationTime && (
              <p className="text-error text-sm mt-1">{errors.medicationTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Optional notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {t("journals.medication.notes")}
        </label>
        {!isEditable && formData.content ? (
          <div className="w-full px-3 py-2 border rounded-md bg-base-200">
            <div className="whitespace-pre-wrap">{formData.content}</div>
          </div>
        ) : (
          <textarea
            name="content"
            rows="4"
            value={formData.content || ""}
            onChange={handleChange}
            placeholder={t("journals.medication.notesPlaceholder")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300 ${
              !isEditable ? "bg-base-200" : ""
            }`}
            disabled={!isEditable}
          ></textarea>
        )}
      </div>
    </div>
  );
};

export default MedicationEntryForm;
