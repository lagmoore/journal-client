// src/renderer/components/patients/PatientInfo.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import FormInput from "../FormInput";

const PatientInfo = ({ patient, onSave, isNew }) => {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState(patient);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Update form data when patient changes
  useEffect(() => {
    setFormData(patient);
    setIsDirty(false);
  }, [patient]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setIsDirty(true);

    // Clear specific error when field is updated
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Only first name and last name are required
    if (!formData.firstName?.trim()) {
      errors.firstName = t("validation.required");
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = t("validation.required");
    }

    // Validate personal number format if provided
    if (formData.personalNumber?.trim()) {
      if (
        !/^(\d{8}[-+]?\d{4}|\d{12})$/.test(
          formData.personalNumber.replace(/\s/g, "")
        )
      ) {
        errors.personalNumber = t("patients.validation.personalNumber");
      }
    }

    // Validate email if provided
    if (formData.email?.trim()) {
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = t("validation.email");
      }
    }

    // Validate caseworker email if provided
    if (formData.caseworkerEmail?.trim()) {
      if (!/\S+@\S+\.\S+/.test(formData.caseworkerEmail)) {
        errors.caseworkerEmail = t("validation.email");
      }
    }

    // Validate phone numbers if provided
    if (formData.phone?.trim()) {
      if (!/^[0-9\s\-\+\(\)]{5,20}$/.test(formData.phone)) {
        errors.phone = t("validation.phone");
      }
    }

    if (formData.caseworkerPhone?.trim()) {
      if (!/^[0-9\s\-\+\(\)]{5,20}$/.test(formData.caseworkerPhone)) {
        errors.caseworkerPhone = t("validation.phone");
      }
    }

    if (formData.emergencyContactPhone?.trim()) {
      if (!/^[0-9\s\-\+\(\)]{5,20}$/.test(formData.emergencyContactPhone)) {
        errors.emergencyContactPhone = t("validation.phone");
      }
    }

    // Validate postal code if provided
    if (formData.postalCode?.trim()) {
      if (!/^(\d{3}\s?\d{2}|\d{5})$/.test(formData.postalCode)) {
        errors.postalCode = t("validation.postalCode");
      }
    }

    // Validate daily cost if provided
    if (formData.incomePerDay?.toString().trim()) {
      if (
        isNaN(parseFloat(formData.incomePerDay)) ||
        parseFloat(formData.incomePerDay) < 0
      ) {
        errors.incomePerDay = t("validation.positiveNumber");
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Show error toast for form validation
      toast.error(t("validation.formErrors"));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSave(formData);

      if (result === true) {
        // Success
        setIsDirty(false);
        toast.success(
          isNew ? t("patients.success.created") : t("patients.success.updated")
        );
      } else if (result && result.validationErrors) {
        // Backend validation errors
        setFormErrors((prev) => ({
          ...prev,
          ...result.validationErrors,
        }));

        // Show error toast
        toast.error(t("validation.backendErrors"));
      }
    } catch (error) {
      console.error("Error saving patient:", error);
      toast.error(t("patients.errors.saveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render important note alert if present (only for viewing existing patients)
  const renderImportantNoteAlert = () => {
    if (!patient.importantNote || isNew) return null;

    // Determine alert style based on note type
    const alertStyles = {
      severe: "bg-error bg-opacity-10 text-error border-error",
      moderate: "bg-warning bg-opacity-10 text-warning border-warning",
      information: "bg-info bg-opacity-10 text-info border-info",
    };

    const style =
      alertStyles[patient.importantNoteType] || alertStyles.information;

    return (
      <div className={`p-4 rounded-lg border mb-6 ${style}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {patient.importantNoteType === "severe" && (
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {patient.importantNoteType === "moderate" && (
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {patient.importantNoteType === "information" && (
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-medium">{t("patients.importantNote.title")}</h3>
            <div className="mt-2 text-sm">{patient.importantNote}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display important note alert if available */}
      {renderImportantNoteAlert()}

      {/* Personal Information */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">
            {t("patients.sections.personal")}
          </h3>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              type="text"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleChange}
              label={t("patients.fields.firstName")}
              placeholder={t("patients.placeholders.firstName")}
              required
              errorMessage={formErrors.firstName}
            />

            <FormInput
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleChange}
              label={t("patients.fields.lastName")}
              placeholder={t("patients.placeholders.lastName")}
              required
              errorMessage={formErrors.lastName}
            />

            <FormInput
              type="text"
              name="personalNumber"
              value={formData.personalNumber || ""}
              onChange={handleChange}
              label={t("patients.fields.personalNumber")}
              placeholder={t("patients.placeholders.personalNumber")}
              errorMessage={formErrors.personalNumber}
            />

            <FormInput
              type="date"
              name="dateOfBirth"
              value={
                formData.dateOfBirth ? formData.dateOfBirth.substr(0, 10) : ""
              }
              onChange={handleChange}
              label={t("patients.fields.dateOfBirth")}
              errorMessage={formErrors.dateOfBirth}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t("patients.fields.gender")}
              </label>
              <select
                name="gender"
                value={formData.gender || "unspecified"}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
              >
                <option value="unspecified">
                  {t("patients.gender.unspecified")}
                </option>
                <option value="male">{t("patients.gender.male")}</option>
                <option value="female">{t("patients.gender.female")}</option>
                <option value="other">{t("patients.gender.other")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Care Information */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">{t("patients.sections.care")}</h3>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              type="date"
              name="admissionDate"
              value={
                formData.admissionDate
                  ? formData.admissionDate.substr(0, 10)
                  : ""
              }
              onChange={handleChange}
              label={t("patients.fields.admissionDate")}
              errorMessage={formErrors.admissionDate}
            />

            <FormInput
              type="date"
              name="expectedDischargeDate"
              value={
                formData.expectedDischargeDate
                  ? formData.expectedDischargeDate.substr(0, 10)
                  : ""
              }
              onChange={handleChange}
              label={t("patients.fields.expectedDischargeDate")}
              errorMessage={formErrors.expectedDischargeDate}
            />

            <FormInput
              type="date"
              name="actualDischargeDate"
              value={
                formData.actualDischargeDate
                  ? formData.actualDischargeDate.substr(0, 10)
                  : ""
              }
              onChange={handleChange}
              label={t("patients.fields.actualDischargeDate")}
              errorMessage={formErrors.actualDischargeDate}
            />

            <FormInput
              type="number"
              name="incomePerDay"
              value={formData.incomePerDay || ""}
              onChange={handleChange}
              label={t("patients.fields.incomePerDay")}
              placeholder={t("patients.placeholders.incomePerDay")}
              errorMessage={formErrors.incomePerDay}
              step="0.01"
              min="0"
            />

            <FormInput
              type="text"
              name="agreement"
              value={formData.agreement || ""}
              onChange={handleChange}
              label={t("patients.fields.agreement")}
              placeholder={t("patients.placeholders.agreement")}
              errorMessage={formErrors.agreement}
            />
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">
            {t("patients.sections.importantNote")}
          </h3>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("patients.fields.importantNote")}
            </label>
            <textarea
              name="importantNote"
              rows="3"
              value={formData.importantNote || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
              placeholder={t("patients.placeholders.importantNote")}
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("patients.fields.importantNoteType")}
            </label>
            <select
              name="importantNoteType"
              value={formData.importantNoteType || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
              disabled={!formData.importantNote}
            >
              <option value="">{t("patients.importantNote.selectType")}</option>
              <option value="information">
                {t("patients.importantNote.information")}
              </option>
              <option value="moderate">
                {t("patients.importantNote.moderate")}
              </option>
              <option value="severe">
                {t("patients.importantNote.severe")}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">
            {t("patients.sections.contact")}
          </h3>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              label={t("patients.fields.email")}
              placeholder={t("patients.placeholders.email")}
              errorMessage={formErrors.email}
            />

            <FormInput
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              label={t("patients.fields.phone")}
              placeholder={t("patients.placeholders.phone")}
              errorMessage={formErrors.phone}
            />

            <FormInput
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              label={t("patients.fields.address")}
              placeholder={t("patients.placeholders.address")}
              errorMessage={formErrors.address}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                type="text"
                name="postalCode"
                value={formData.postalCode || ""}
                onChange={handleChange}
                label={t("patients.fields.postalCode")}
                placeholder={t("patients.placeholders.postalCode")}
                errorMessage={formErrors.postalCode}
              />

              <FormInput
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                label={t("patients.fields.city")}
                placeholder={t("patients.placeholders.city")}
                errorMessage={formErrors.city}
              />
            </div>

            <FormInput
              type="text"
              name="country"
              value={formData.country || "Sweden"}
              onChange={handleChange}
              label={t("patients.fields.country")}
              placeholder={t("patients.placeholders.country")}
              errorMessage={formErrors.country}
            />
          </div>
        </div>
      </div>

      {/* Caseworker Information */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">
            {t("patients.sections.caseworker")}
          </h3>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              type="text"
              name="caseworkerFirstName"
              value={formData.caseworkerFirstName || ""}
              onChange={handleChange}
              label={t("patients.fields.caseworkerFirstName")}
              placeholder={t("patients.placeholders.caseworkerFirstName")}
              errorMessage={formErrors.caseworkerFirstName}
            />

            <FormInput
              type="text"
              name="caseworkerLastName"
              value={formData.caseworkerLastName || ""}
              onChange={handleChange}
              label={t("patients.fields.caseworkerLastName")}
              placeholder={t("patients.placeholders.caseworkerLastName")}
              errorMessage={formErrors.caseworkerLastName}
            />

            <FormInput
              type="text"
              name="caseworkerMunicipality"
              value={formData.caseworkerMunicipality || ""}
              onChange={handleChange}
              label={t("patients.fields.caseworkerMunicipality")}
              placeholder={t("patients.placeholders.caseworkerMunicipality")}
              errorMessage={formErrors.caseworkerMunicipality}
            />

            <FormInput
              type="tel"
              name="caseworkerPhone"
              value={formData.caseworkerPhone || ""}
              onChange={handleChange}
              label={t("patients.fields.caseworkerPhone")}
              placeholder={t("patients.placeholders.caseworkerPhone")}
              errorMessage={formErrors.caseworkerPhone}
            />

            <FormInput
              type="email"
              name="caseworkerEmail"
              value={formData.caseworkerEmail || ""}
              onChange={handleChange}
              label={t("patients.fields.caseworkerEmail")}
              placeholder={t("patients.placeholders.caseworkerEmail")}
              errorMessage={formErrors.caseworkerEmail}
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">
            {t("patients.sections.emergency")}
          </h3>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName || ""}
              onChange={handleChange}
              label={t("patients.fields.emergencyName")}
              placeholder={t("patients.placeholders.emergencyName")}
              errorMessage={formErrors.emergencyContactName}
            />

            <FormInput
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone || ""}
              onChange={handleChange}
              label={t("patients.fields.emergencyPhone")}
              placeholder={t("patients.placeholders.emergencyPhone")}
              errorMessage={formErrors.emergencyContactPhone}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
          <h3 className="text-lg font-medium">
            {t("patients.sections.notes")}
          </h3>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("patients.fields.notes")}
            </label>
            <textarea
              name="notes"
              rows="4"
              value={formData.notes || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
              placeholder={t("patients.placeholders.notes")}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting || (!isDirty && !isNew)}
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

export default PatientInfo;
