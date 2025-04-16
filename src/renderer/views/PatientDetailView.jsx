// src/renderer/views/PatientDetailView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

// Import components
import LoadingSpinner from "../components/common/LoadingSpinner";
import PatientInfo from "../components/patients/PatientInfo";
import PatientJournals from "../components/patients/PatientJournals";
import PatientMedications from "../components/patients/PatientMedications";
import ConfirmDialog from "../components/common/ConfirmDialog";

const PatientDetailView = () => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { patientId } = useParams();
  const navigate = useNavigate();

  // State
  const [patient, setPatient] = useState(null);
  const [journals, setJournals] = useState([]);
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("journals");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // New journal mode
  const isNewPatient = patientId === "new";

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      if (isNewPatient) {
        setPatient({
          firstName: "",
          lastName: "",
          personalNumber: "",
          dateOfBirth: "",
          gender: "unspecified",
          email: "",
          phone: "",
          address: "",
          city: "",
          postalCode: "",
          country: "Sweden",
          notes: "",
          isActive: true,
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch patient
        const patientResponse = await api.get(`/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (patientResponse.data.success) {
          setPatient(patientResponse.data.patient);

          // Fetch journals
          const journalsResponse = await api.get(
            `/patients/${patientId}/journals`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (journalsResponse.data.success) {
            setJournals(journalsResponse.data.journals);

            // If medications are included in response
            if (journalsResponse.data.medications) {
              setMedications(journalsResponse.data.medications);
            } else {
              // Fetch medications separately if needed
              const medicationsResponse = await api.get(
                `/patients/${patientId}/medications`,
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                }
              );

              if (medicationsResponse.data.success) {
                setMedications(medicationsResponse.data.medications);
              }
            }
          }
        } else {
          toast.error(t("patients.errors.notFound"));
          navigate("/dashboard/patients");
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast.error(t("patients.errors.loadFailed"));
        navigate("/dashboard/patients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [accessToken, patientId, navigate, t, isNewPatient]);

  // Save patient
  const handleSavePatient = async (formData) => {
    try {
      let response;

      if (isNewPatient) {
        response = await api.post("/patients", formData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else {
        response = await api.put(`/patients/${patientId}`, formData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      if (response.data.success) {
        toast.success(
          isNewPatient
            ? t("patients.success.created")
            : t("patients.success.updated")
        );

        if (isNewPatient) {
          navigate(`/dashboard/patients/${response.data.patient.id}`);
        } else {
          setPatient(response.data.patient);
        }

        return true;
      } else {
        toast.error(response.data.message || t("patients.errors.saveFailed"));
        return false;
      }
    } catch (error) {
      console.error("Error saving patient:", error);

      if (error.response?.data?.errors) {
        // Handle validation errors
        return { validationErrors: error.response.data.errors };
      }

      toast.error(t("patients.errors.saveFailed"));
      return false;
    }
  };

  // Delete patient
  const handleDeletePatient = async () => {
    try {
      const response = await api.delete(`/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        toast.success(t("patients.success.deleted"));
        navigate("/dashboard/patients");
      } else {
        toast.error(response.data.message || t("patients.errors.deleteFailed"));
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error(t("patients.errors.deleteFailed"));
    }
  };

  // Create journal
  const handleCreateJournal = (entryType = "note", medication = null) => {
    // Prepare initial journal data based on entry type
    let initialData = {
      patientId,
      entryType,
      title: "",
      content: "",
      status: "draft",
    };

    // Add medication details if provided
    if (entryType === "medication" && medication) {
      initialData = {
        ...initialData,
        title: `${t("journals.medicationAdministered")}: ${medication.name}`,
        medicationName: medication.name,
        medicationDose: medication.standardDose,
      };
    } else if (entryType === "drug_test") {
      initialData.title = t("journals.drugTest.defaultTitle");
    } else if (entryType === "incident") {
      initialData.title = t("journals.incident.defaultTitle");
    }

    // Navigate to new journal form
    navigate(
      `/dashboard/journals/new?patientId=${patientId}&entryType=${entryType}`,
      {
        state: { initialData },
      }
    );
  };

  // Create medication
  const handleCreateMedication = async (medicationData) => {
    try {
      const response = await api.post(
        `/patients/${patientId}/medications`,
        medicationData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        toast.success(t("patients.medications.createSuccess"));

        // Add to medications list
        setMedications([...medications, response.data.medication]);
        return true;
      } else {
        toast.error(
          response.data.message || t("patients.medications.createError")
        );
        return false;
      }
    } catch (error) {
      console.error("Error creating medication:", error);

      if (error.response?.data?.errors) {
        // Handle validation errors
        return { validationErrors: error.response.data.errors };
      }

      toast.error(t("patients.medications.createError"));
      return false;
    }
  };

  // Update medication
  const handleUpdateMedication = async (medicationId, medicationData) => {
    try {
      const response = await api.put(
        `/medications/${medicationId}`,
        medicationData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        toast.success(t("patients.medications.updateSuccess"));

        // Update medications list
        setMedications(
          medications.map((med) =>
            med.id === medicationId ? response.data.medication : med
          )
        );
        return true;
      } else {
        toast.error(
          response.data.message || t("patients.medications.updateError")
        );
        return false;
      }
    } catch (error) {
      console.error("Error updating medication:", error);

      if (error.response?.data?.errors) {
        // Handle validation errors
        return { validationErrors: error.response.data.errors };
      }

      toast.error(t("patients.medications.updateError"));
      return false;
    }
  };

  // Delete medication
  const handleDeleteMedication = async (medicationId) => {
    try {
      const response = await api.delete(`/medications/${medicationId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        toast.success(t("patients.medications.deleteSuccess"));

        // Remove from medications list
        setMedications(medications.filter((med) => med.id !== medicationId));
        return true;
      } else {
        toast.error(
          response.data.message || t("patients.medications.deleteError")
        );
        return false;
      }
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast.error(t("patients.medications.deleteError"));
      return false;
    }
  };

  // Handle back
  const handleBack = () => {
    navigate("/dashboard/patients");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-1 rounded-full hover:bg-base-200"
              aria-label={t("common.back")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">
              {isNewPatient
                ? t("patients.newPatient")
                : `${patient.firstName} ${patient.lastName}`}
            </h1>
          </div>
          {!isNewPatient && patient.personalNumber && (
            <p className="text-neutral ml-8">
              {t("patients.fields.personalNumber")}: {patient.personalNumber}
            </p>
          )}
        </div>

        {!isNewPatient && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="btn btn-error btn-outline"
            >
              {t("patients.actions.delete")}
            </button>
            {patient.isActive ? (
              <button
                onClick={() =>
                  handleSavePatient({ ...patient, isActive: false })
                }
                className="btn btn-warning"
              >
                {t("patients.actions.deactivate")}
              </button>
            ) : (
              <button
                onClick={() =>
                  handleSavePatient({ ...patient, isActive: true })
                }
                className="btn btn-success"
              >
                {t("patients.actions.activate")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs (only show for existing patients) */}
      {!isNewPatient && (
        <div className="mb-6 border-b border-base-300">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "journals"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral hover:text-base-content hover:border-base-300"
              }`}
              onClick={() => setActiveTab("journals")}
            >
              {t("patients.tabs.journals")}
            </button>
            <button
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "medications"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral hover:text-base-content hover:border-base-300"
              }`}
              onClick={() => setActiveTab("medications")}
            >
              {t("patients.tabs.medications")}
            </button>
            <button
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "info"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral hover:text-base-content hover:border-base-300"
              }`}
              onClick={() => setActiveTab("info")}
            >
              {t("patients.tabs.info")}
            </button>
          </nav>
        </div>
      )}

      {/* Content */}
      <div>
        {(isNewPatient || activeTab === "info") && (
          <PatientInfo
            patient={patient}
            onSave={handleSavePatient}
            isNew={isNewPatient}
          />
        )}

        {!isNewPatient && activeTab === "journals" && (
          <PatientJournals
            journals={journals}
            medications={medications}
            patientId={patientId}
            onCreateJournal={handleCreateJournal}
            onCreateMedication={() => setActiveTab("medications")}
          />
        )}

        {!isNewPatient && activeTab === "medications" && (
          <PatientMedications
            medications={medications}
            patientId={patientId}
            onCreateMedication={handleCreateMedication}
            onUpdateMedication={handleUpdateMedication}
            onDeleteMedication={handleDeleteMedication}
          />
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={t("patients.deleteDialog.title")}
        message={t("patients.deleteDialog.message", {
          name: `${patient?.firstName} ${patient?.lastName}`,
        })}
        confirmText={t("patients.deleteDialog.confirm")}
        cancelText={t("patients.deleteDialog.cancel")}
        onConfirm={handleDeletePatient}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default PatientDetailView;
