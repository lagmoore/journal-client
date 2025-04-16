// src/renderer/components/patients/PatientMedications.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";

const PatientMedications = ({
  medications,
  patientId,
  onCreateMedication,
  onUpdateMedication,
  onDeleteMedication,
}) => {
  const { t } = useTranslation();

  // State
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    standardDose: "",
    frequency: "",
    startDate: new Date().toISOString().split("T")[0], // Today
    endDate: "",
    instructions: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Common frequencies
  const commonFrequencies = [
    "1 gång per dag",
    "2 gånger per dag",
    "3 gånger per dag",
    "Vid behov",
    "Varje morgon",
    "Varje kväll",
    "Varannan dag",
  ];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle frequency selection
  const handleFrequencySelect = (frequency) => {
    setFormData((prev) => ({
      ...prev,
      frequency,
    }));

    if (formErrors.frequency) {
      setFormErrors((prev) => ({
        ...prev,
        frequency: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = t("validation.required");
    }

    if (!formData.standardDose?.trim()) {
      errors.standardDose = t("validation.required");
    }

    if (!formData.frequency?.trim()) {
      errors.frequency = t("validation.required");
    }

    if (!formData.startDate) {
      errors.startDate = t("validation.required");
    }

    // Validate end date is after start date if provided
    if (
      formData.endDate &&
      formData.startDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      errors.endDate = t("validation.endDateAfterStart");
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

    try {
      if (editingMedication) {
        // Update existing medication
        await onUpdateMedication(editingMedication.id, formData);
      } else {
        // Create new medication
        await onCreateMedication(formData);
      }

      // Reset form and close
      resetForm();
    } catch (error) {
      console.error("Error saving medication:", error);
    }
  };

  // Reset form and close
  const resetForm = () => {
    setFormData({
      name: "",
      standardDose: "",
      frequency: "",
      startDate: new Date().toISOString().split("T")[0], // Today
      endDate: "",
      instructions: "",
    });
    setFormErrors({});
    setEditingMedication(null);
    setShowForm(false);
  };

  // Open edit form for a medication
  const handleEditMedication = (medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      standardDose: medication.standardDose,
      frequency: medication.frequency,
      startDate: medication.startDate?.substr(0, 10) || "",
      endDate: medication.endDate?.substr(0, 10) || "",
      instructions: medication.instructions || "",
    });
    setShowForm(true);
  };

  // Handle delete medication
  const handleDeleteMedication = async (medicationId) => {
    if (window.confirm(t("patients.medications.confirmDelete"))) {
      try {
        await onDeleteMedication(medicationId);
      } catch (error) {
        console.error("Error deleting medication:", error);
      }
    }
  };

  // Filter active and inactive medications
  const activeMedications = medications.filter((med) => med.isActive);
  const inactiveMedications = medications.filter((med) => !med.isActive);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {t("patients.medications.title")}
        </h2>
        <button
          onClick={() => {
            setEditingMedication(null);
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          {t("patients.medications.add")}
        </button>
      </div>

      {/* Medication form */}
      {showForm && (
        <div className="mb-8 bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
          <div className="bg-base-200 px-4 py-3 border-b border-base-300">
            <h3 className="text-lg font-medium">
              {editingMedication
                ? t("patients.medications.edit")
                : t("patients.medications.add")}
            </h3>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label={t("patients.medications.name")}
                  placeholder={t("patients.medications.namePlaceholder")}
                  required
                  errorMessage={formErrors.name}
                />

                <FormInput
                  type="text"
                  name="standardDose"
                  value={formData.standardDose}
                  onChange={handleChange}
                  label={t("patients.medications.standardDose")}
                  placeholder={t(
                    "patients.medications.standardDosePlaceholder"
                  )}
                  required
                  errorMessage={formErrors.standardDose}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {t("patients.medications.frequency")}
                  <span className="text-error ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  placeholder={t("patients.medications.frequencyPlaceholder")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    formErrors.frequency ? "border-error" : "border-base-300"
                  }`}
                />
                {formErrors.frequency && (
                  <p className="text-error text-sm mt-1">
                    {formErrors.frequency}
                  </p>
                )}

                {/* Common frequencies */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonFrequencies.map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      className="px-2 py-1 text-xs bg-base-200 rounded-full hover:bg-base-300"
                      onClick={() => handleFrequencySelect(freq)}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  label={t("patients.medications.startDate")}
                  required
                  errorMessage={formErrors.startDate}
                />

                <FormInput
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  label={t("patients.medications.endDate")}
                  errorMessage={formErrors.endDate}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {t("patients.medications.instructions")}
                </label>
                <textarea
                  name="instructions"
                  rows="3"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder={t(
                    "patients.medications.instructionsPlaceholder"
                  )}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline"
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active medications */}
      {activeMedications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">
            {t("patients.medications.active")}
          </h3>
          <div className="bg-base-100 rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-base-300">
              <thead className="bg-base-200">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider"
                  >
                    {t("patients.medications.name")}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider"
                  >
                    {t("patients.medications.standardDose")}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider"
                  >
                    {t("patients.medications.frequency")}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider"
                  >
                    {t("patients.medications.dateRange")}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-neutral uppercase tracking-wider"
                  >
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-base-100 divide-y divide-base-300">
                {activeMedications.map((med) => (
                  <tr key={med.id} className="hover:bg-base-200">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{med.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {med.standardDose}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {med.frequency}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        {formatDate(med.startDate)}{" "}
                        {med.endDate && `- ${formatDate(med.endDate)}`}
                      </div>
                      {med.instructions && (
                        <div className="text-neutral text-xs mt-1">
                          {med.instructions}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEditMedication(med)}
                        className="text-primary hover:text-primary-focus mr-3"
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => handleDeleteMedication(med.id)}
                        className="text-error hover:text-error-focus"
                      >
                        {t("common.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inactive medications */}
      {inactiveMedications.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">
            {t("patients.medications.inactive")}
          </h3>
          <div className="bg-base-100 rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-base-300">
              <thead className="bg-base-200">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider"
                  >
                    {t("patients.medications.name")}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider"
                  >
                    {t("patients.medications.standardDose")}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider"
                  >
                    {t("patients.medications.frequency")}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider"
                  >
                    {t("patients.medications.dateRange")}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-neutral uppercase tracking-wider"
                  >
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-base-100 divide-y divide-base-300">
                {inactiveMedications.map((med) => (
                  <tr key={med.id} className="hover:bg-base-200 text-neutral">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{med.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {med.standardDose}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {med.frequency}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        {formatDate(med.startDate)} - {formatDate(med.endDate)}
                      </div>
                      {med.instructions && (
                        <div className="text-neutral text-xs mt-1">
                          {med.instructions}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEditMedication(med)}
                        className="text-primary hover:text-primary-focus mr-3"
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => handleDeleteMedication(med.id)}
                        className="text-error hover:text-error-focus"
                      >
                        {t("common.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {medications.length === 0 && !showForm && (
        <div className="text-center py-8 bg-base-100 rounded-lg shadow-sm">
          <p className="text-neutral mb-4">
            {t("patients.medications.noMedications")}
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            {t("patients.medications.addFirst")}
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientMedications;
