// src/renderer/views/PatientListView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

// Import components
import PatientSearchFilter from "../components/patients/PatientSearchFilter";
import PatientTable from "../components/patients/PatientTable";
import LoadingSpinner from "../components/common/LoadingSpinner";

const PatientListView = () => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  // State
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all", // all, active, inactive
    sortBy: "lastName", // lastName, firstName, personalNumber, createdAt
    sortOrder: "asc", // asc, desc
  });

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/patients", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data.success) {
          setPatients(response.data.patients);
          setFilteredPatients(response.data.patients);
        } else {
          toast.error(t("patients.errors.loadFailed"));
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error(t("patients.errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [accessToken, t]);

  // Apply filters and search
  useEffect(() => {
    let result = [...patients];

    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(lowerSearchTerm) ||
          patient.lastName.toLowerCase().includes(lowerSearchTerm) ||
          patient.personalNumber?.toLowerCase().includes(lowerSearchTerm) ||
          `${patient.firstName} ${patient.lastName}`
            .toLowerCase()
            .includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      const isActive = filters.status === "active";
      result = result.filter((patient) => patient.isActive === isActive);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "firstName":
          comparison = a.firstName.localeCompare(b.firstName);
          break;
        case "lastName":
          comparison = a.lastName.localeCompare(b.lastName);
          break;
        case "personalNumber":
          comparison = (a.personalNumber || "").localeCompare(
            b.personalNumber || ""
          );
          break;
        case "createdAt":
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = a.lastName.localeCompare(b.lastName);
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredPatients(result);
  }, [patients, searchTerm, filters]);

  // Handle patient selection
  const handleViewPatient = (patientId) => {
    navigate(`/dashboard/patients/${patientId}`);
  };

  // Handle add patient
  const handleAddPatient = () => {
    navigate("/dashboard/patients/new");
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("patients.title")}</h1>
        <button onClick={handleAddPatient} className="btn btn-primary">
          {t("patients.actions.add")}
        </button>
      </div>

      {/* Search and filters */}
      <PatientSearchFilter
        searchTerm={searchTerm}
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Patient list */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredPatients.length > 0 ? (
        <PatientTable
          patients={filteredPatients}
          onViewPatient={handleViewPatient}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral text-lg">
            {searchTerm || filters.status !== "all"
              ? t("patients.noResults")
              : t("patients.empty")}
          </p>
          {!searchTerm && filters.status === "all" && (
            <button onClick={handleAddPatient} className="btn btn-primary mt-4">
              {t("patients.actions.addFirst")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientListView;
