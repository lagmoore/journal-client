// src/renderer/views/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

// Import components
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardHome = () => {
  const { t } = useTranslation();
  const { currentUser, accessToken } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [stats, setStats] = useState({
    patientCount: 0,
    activePatientCount: 0,
    journalCount: 0,
    recentJournals: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would call your API to get dashboard statistics
        // For now, we'll use mock data
        
        // Fetch patients count
        const patientsResponse = await api.get('/patients', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        // Fetch journals
        const journalsResponse = await api.get('/journals', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (patientsResponse.data.success && journalsResponse.data.success) {
          const patients = patientsResponse.data.patients || [];
          const journals = journalsResponse.data.journals || [];
          
          // Calculate statistics
          const activePatients = patients.filter(p => p.isActive);
          
          // Get recent journals (limit to 5)
          const recentJournals = [...journals]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          
          setStats({
            patientCount: patients.length,
            activePatientCount: activePatients.length,
            journalCount: journals.length,
            recentJournals
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error(t('dashboard.errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [accessToken, t]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Navigate to journal detail
  const handleJournalClick = (journalId) => {
    navigate(`/dashboard/journals/${journalId}`);
  };
  
  // Navigate to patient detail
  const handlePatientClick = (patientId) => {
    navigate(`/dashboard/patients/${patientId}`);
  };
  
  // Navigate to new patient form
  const handleAddPatient = () => {
    navigate('/dashboard/patients/new');
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-info bg-opacity-10 text-info';
      case 'completed':
        return 'bg-success bg-opacity-10 text-success';
      case 'archived':
        return 'bg-neutral bg-opacity-10 text-neutral';
      default:
        return 'bg-info bg-opacity-10 text-info';
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.welcome', { name: currentUser?.username })}</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Patient stats */}
        <div className="bg-base-100 rounded-lg shadow-card border border-base-300 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary bg-opacity-10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{stats.patientCount}</h2>
              <p className="text-neutral">{t('dashboard.stats.patients')}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-neutral">
              {t('dashboard.stats.activePatients')}: {stats.activePatientCount}
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/dashboard/patients')}
              className="text-primary text-sm font-medium hover:text-primary-focus"
            >
              {t('dashboard.actions.viewAll')} →
            </button>
          </div>
        </div>
        
        {/* Journal stats */}
        <div className="bg-base-100 rounded-lg shadow-card border border-base-300 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary bg-opacity-10 text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{stats.journalCount}</h2>
              <p className="text-neutral">{t('dashboard.stats.journals')}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/dashboard/journals')}
              className="text-primary text-sm font-medium hover:text-primary-focus"
            >
              {t('dashboard.actions.viewAll')} →
            </button>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="bg-base-100 rounded-lg shadow-card border border-base-300 p-6">
          <h2 className="font-semibold mb-4">{t('dashboard.quickActions')}</h2>
          <div className="space-y-2">
            <button
              onClick={handleAddPatient}
              className="w-full text-left px-4 py-2 rounded-md bg-primary bg-opacity-10 text-primary hover:bg-opacity-20 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {t('patients.actions.add')}
            </button>
            {stats.patientCount > 0 && (
              <button
                onClick={() => navigate('/dashboard/journals/new')}
                className="w-full text-left px-4 py-2 rounded-md bg-secondary bg-opacity-10 text-secondary hover:bg-opacity-20 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('journals.actions.create')}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent journals */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.recentJournals')}</h2>
        
        {stats.recentJournals.length > 0 ? (
          <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-base-300">
                <thead className="bg-base-200">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                      {t('journals.fields.title')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                      {t('journals.fields.status')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                      {t('journals.fields.category')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                      {t('journals.fields.createdAt')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-base-100 divide-y divide-base-300">
                  {stats.recentJournals.map((journal) => (
                    <tr 
                      key={journal.id} 
                      className="hover:bg-base-200 cursor-pointer"
                      onClick={() => handleJournalClick(journal.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{journal.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(journal.status)}`}>
                          {t(`journals.status.${journal.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral">
                          {journal.category ? t(`journals.categories.${journal.category}`) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral">
                        {formatDate(journal.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-base-100 rounded-lg shadow-card border border-base-300 p-6 text-center">
            <p className="text-neutral">{t('dashboard.noRecentJournals')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;