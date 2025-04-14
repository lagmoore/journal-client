// src/renderer/components/patients/PatientJournals.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PatientJournals = ({ journals, patientId, onCreateJournal }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, draft, completed, archived
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Filter journals
  const filteredJournals = journals.filter(journal => {
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !journal.title.toLowerCase().includes(term) &&
        !journal.content.toLowerCase().includes(term) &&
        !journal.category?.toLowerCase().includes(term)
      ) {
        return false;
      }
    }
    
    // Apply status filter
    if (filter !== 'all' && journal.status !== filter) {
      return false;
    }
    
    return true;
  });
  
  // View journal
  const handleViewJournal = (journalId) => {
    navigate(`/dashboard/journals/${journalId}`);
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
  
  return (
    <div>
      {/* Header with search and filter */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="w-full md:w-1/2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-neutral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder={t('journals.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <select
            className="px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">{t('journals.filters.all')}</option>
            <option value="draft">{t('journals.filters.draft')}</option>
            <option value="completed">{t('journals.filters.completed')}</option>
            <option value="archived">{t('journals.filters.archived')}</option>
          </select>
          
          <button
            onClick={onCreateJournal}
            className="btn btn-primary"
          >
            {t('journals.actions.create')}
          </button>
        </div>
      </div>
      
      {/* Journal list */}
      {filteredJournals.length > 0 ? (
        <div className="space-y-4">
          {filteredJournals.map(journal => (
            <div
              key={journal.id}
              className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden hover:border-primary cursor-pointer transition-colors"
              onClick={() => handleViewJournal(journal.id)}
            >
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{journal.title}</h3>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(journal.status)}`}>
                        {t(`journals.status.${journal.status}`)}
                      </span>
                    </div>
                    
                    {journal.category && (
                      <p className="text-sm text-neutral mt-1">
                        {t('journals.fields.category')}: {journal.category}
                      </p>
                    )}
                    
                    <div className="mt-2 text-sm text-neutral-500">
                      <p className="line-clamp-2">{journal.content}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-neutral">
                    <div>{t('journals.fields.createdBy')}: {journal.createdByName}</div>
                    <div>{t('journals.fields.createdAt')}: {formatDate(journal.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral text-lg">
            {searchTerm || filter !== 'all'
              ? t('journals.noResults')
              : t('journals.empty')}
          </p>
          <button
            onClick={onCreateJournal}
            className="btn btn-primary mt-4"
          >
            {t('journals.actions.createFirst')}
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientJournals;