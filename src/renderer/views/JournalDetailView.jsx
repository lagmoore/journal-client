// src/renderer/views/JournalDetailView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

// Import components
import LoadingSpinner from '../components/common/LoadingSpinner';
import JournalForm from '../components/journals/JournalForm';
import ConfirmDialog from '../components/common/ConfirmDialog';

const JournalDetailView = () => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { journalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract patientId from query params if creating new journal
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromQuery = queryParams.get('patientId');
  
  // State
  const [journal, setJournal] = useState(null);
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // New journal mode
  const isNewJournal = journalId === 'new';
  
  // Fetch journal data
  useEffect(() => {
    const fetchData = async () => {
      if (isNewJournal) {
        if (!patientIdFromQuery) {
          toast.error(t('journals.errors.noPatient'));
          navigate('/dashboard/patients');
          return;
        }
        
        try {
          // Fetch patient data
          const patientResponse = await api.get(`/patients/${patientIdFromQuery}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          if (patientResponse.data.success) {
            setPatient(patientResponse.data.patient);
            
            // Create new journal object
            setJournal({
              patientId: patientIdFromQuery,
              title: '',
              content: '',
              category: '',
              status: 'draft',
            });
          } else {
            toast.error(t('patients.errors.notFound'));
            navigate('/dashboard/patients');
          }
        } catch (error) {
          console.error('Error fetching patient data:', error);
          toast.error(t('patients.errors.loadFailed'));
          navigate('/dashboard/patients');
        } finally {
          setIsLoading(false);
        }
        
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch journal
        const journalResponse = await api.get(`/journals/${journalId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (journalResponse.data.success) {
          setJournal(journalResponse.data.journal);
          
          // Fetch patient
          const patientResponse = await api.get(`/patients/${journalResponse.data.journal.patientId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          if (patientResponse.data.success) {
            setPatient(patientResponse.data.patient);
          }
        } else {
          toast.error(t('journals.errors.notFound'));
          navigate('/dashboard/journals');
        }
      } catch (error) {
        console.error('Error fetching journal data:', error);
        toast.error(t('journals.errors.loadFailed'));
        navigate('/dashboard/journals');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [accessToken, journalId, navigate, t, isNewJournal, patientIdFromQuery]);
  
  // Save journal
  const handleSaveJournal = async (formData) => {
    try {
      let response;
      
      if (isNewJournal) {
        response = await api.post('/journals', formData, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } else {
        response = await api.put(`/journals/${journalId}`, formData, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
      
      if (response.data.success) {
        toast.success(isNewJournal 
          ? t('journals.success.created') 
          : t('journals.success.updated')
        );
        
        if (isNewJournal) {
          navigate(`/dashboard/journals/${response.data.journal.id}`);
        } else {
          setJournal(response.data.journal);
        }
        
        return true;
      } else {
        toast.error(response.data.message || t('journals.errors.saveFailed'));
        return false;
      }
    } catch (error) {
      console.error('Error saving journal:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        return { validationErrors: error.response.data.errors };
      }
      
      toast.error(t('journals.errors.saveFailed'));
      return false;
    }
  };
  
  // Delete journal
  const handleDeleteJournal = async () => {
    try {
      const response = await api.delete(`/journals/${journalId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.data.success) {
        toast.success(t('journals.success.deleted'));
        navigate(`/dashboard/patients/${journal.patientId}`);
      } else {
        toast.error(response.data.message || t('journals.errors.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting journal:', error);
      toast.error(t('journals.errors.deleteFailed'));
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    if (patient) {
      navigate(`/dashboard/patients/${patient.id}`);
    } else {
      navigate('/dashboard/patients');
    }
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
              aria-label={t('common.back')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">
              {isNewJournal 
                ? t('journals.newJournal') 
                : journal.title}
            </h1>
          </div>
          {patient && (
            <p className="text-neutral ml-8">
              {t('journals.forPatient')}: {patient.firstName} {patient.lastName}
            </p>
          )}
        </div>
        
        {!isNewJournal && (
          <div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="btn btn-error btn-outline"
            >
              {t('journals.actions.delete')}
            </button>
          </div>
        )}
      </div>
      
      {/* Journal form */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="p-6">
          <JournalForm
            journal={journal}
            onSave={handleSaveJournal}
            isNew={isNewJournal}
          />
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={t('journals.deleteDialog.title')}
        message={t('journals.deleteDialog.message')}
        confirmText={t('journals.deleteDialog.confirm')}
        cancelText={t('journals.deleteDialog.cancel')}
        onConfirm={handleDeleteJournal}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default JournalDetailView;