// src/renderer/views/EconomyView.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

// Import components
import LoadingSpinner from '../components/common/LoadingSpinner';
import EconomyChart from '../components/economy/EconomyChart';
import EconomyForm from '../components/economy/EconomyForm';
import EconomyStats from '../components/economy/EconomyStats';

const EconomyView = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, accessToken } = useAuth();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [economyData, setEconomyData] = useState({
    monthlyData: [],
    totals: {
      actualIncome: 0,
      budget: 0,
      predictedIncome: 0
    }
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  
  // Check if user has permission to edit
  const canEdit = ['admin', 'manager'].includes(currentUser?.role);
  
  // Get month names from translations
  const getLocalizedMonthName = (monthNumber) => {
    // Get month name from translations with proper capitalization
    return t(`economy.months.${monthNumber}`);
  };

  // Fetch economy data
  useEffect(() => {
    const fetchEconomyData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/economy', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { year: selectedYear }
        });
        
        if (response.data.success) {
          // Translate month names based on current language
          const translatedData = {
            ...response.data,
            monthlyData: response.data.monthlyData.map(month => ({
              ...month,
              // Use our translation function for month names instead of date formatting
              monthName: getLocalizedMonthName(month.month)
            }))
          };
          setEconomyData(translatedData);
        } else {
          toast.error(t('economy.errors.loadFailed'));
        }
      } catch (error) {
        console.error('Error fetching economy data:', error);
        toast.error(t('economy.errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEconomyData();
  }, [accessToken, selectedYear, t, i18n.language]);
  
  // Handle year change
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };
  
  // Handle edit click
  const handleEditClick = (month) => {
    setSelectedMonth(month);
    setShowEditModal(true);
  };
  
  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      const response = await api.post('/economy', formData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.data.success) {
        toast.success(t('economy.success.updated'));
        
        // Update local data
        setEconomyData(prevData => {
          const updatedMonthlyData = [...prevData.monthlyData];
          const monthIndex = updatedMonthlyData.findIndex(m => 
            m.year === formData.year && m.month === formData.month
          );
          
          if (monthIndex !== -1) {
            // Get localized month name from our translations
            const localizedMonthName = getLocalizedMonthName(formData.month);
            
            // Update month data with response and localized month name
            updatedMonthlyData[monthIndex] = {
              ...response.data.data,
              monthName: localizedMonthName
            };
          }
          
          // Recalculate totals
          const actualIncomeTotal = updatedMonthlyData.reduce((sum, month) => sum + month.actualIncome, 0);
          const budgetTotal = updatedMonthlyData.reduce((sum, month) => sum + month.budget, 0);
          const predictedIncomeTotal = updatedMonthlyData.reduce((sum, month) => sum + month.predictedIncome, 0);
          
          return {
            monthlyData: updatedMonthlyData,
            totals: {
              actualIncome: actualIncomeTotal,
              budget: budgetTotal,
              predictedIncome: predictedIncomeTotal
            }
          };
        });
        
        setShowEditModal(false);
      } else {
        toast.error(response.data.message || t('economy.errors.updateFailed'));
      }
    } catch (error) {
      console.error('Error updating economy data:', error);
      toast.error(t('economy.errors.updateFailed'));
    }
  };
  
  // Get available years for selection
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Show 3 years back and 2 years ahead
    for (let i = currentYear - 3; i <= currentYear + 2; i++) {
      years.push(i);
    }
    
    return years;
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('economy.title')}</h1>
        
        {/* Year selector */}
        <div className="flex items-center gap-4">
          <label htmlFor="year-select" className="font-medium">
            {t('economy.selectYear')}:
          </label>
          <select
            id="year-select"
            className="px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
          >
            {getAvailableYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Stats cards */}
      <EconomyStats data={economyData.totals} year={selectedYear} />
      
      {/* Chart */}
      <div className="mb-8 bg-base-100 rounded-lg shadow-card border border-base-300 p-6">
        <h2 className="text-xl font-medium mb-4">{t('economy.chart.title')}</h2>
        <EconomyChart data={economyData.monthlyData} />
      </div>
      
      {/* Monthly data table */}
      <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
        <div className="p-4 bg-base-200 border-b border-base-300">
          <h2 className="text-xl font-medium">{t('economy.monthlyData')}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                  {t('economy.fields.month')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                  {t('economy.fields.actualIncome')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                  {t('economy.fields.budget')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                  {t('economy.fields.predictedIncome')}
                </th>
                {canEdit && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral uppercase tracking-wider">
                    {t('economy.fields.actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-base-100 divide-y divide-base-300">
              {economyData.monthlyData.map((month) => (
                <tr key={month.month} className="hover:bg-base-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{month.monthName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(month.actualIncome)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(month.budget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(month.predictedIncome)}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEditClick(month)}
                        className="text-primary hover:text-primary-focus"
                      >
                        {t('common.edit')}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            {/* Totals row */}
            <tfoot className="bg-base-200">
              <tr>
                <th scope="row" className="px-6 py-3 text-left text-sm font-bold">
                  {t('economy.totals')}
                </th>
                <td className="px-6 py-3 whitespace-nowrap font-bold">
                  {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(economyData.totals.actualIncome)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap font-bold">
                  {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(economyData.totals.budget)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap font-bold">
                  {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(economyData.totals.predictedIncome)}
                </td>
                {canEdit && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Edit modal */}
      {showEditModal && selectedMonth && (
        <EconomyForm
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedMonth}
        />
      )}
    </div>
  );
};

export default EconomyView;