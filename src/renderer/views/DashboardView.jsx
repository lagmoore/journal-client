// src/renderer/views/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LANGUAGES, changeLanguage } from '../utils/i18n';

// Import components
import GlobalSearch from '../components/GlobalSearch';

// Import views
import DashboardHome from './DashboardHome';
import PatientListView from './PatientListView';
import PatientDetailView from './PatientDetailView';
import JournalsListView from './JournalsListView';
import JournalDetailView from './JournalDetailView';
import UserManagementView from './UserManagementView';
import UserDetailView from './UserDetailView';
import ProfileView from './ProfileView';
import SearchResultsView from './SearchResultsView';
import EconomyView from './EconomyView';

const DashboardView = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sidebar state for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Determine active section based on current path
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/patients')) return 'patients';
    if (path.includes('/journals')) return 'journals';
    if (path.includes('/users')) return 'users';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/search')) return 'search';
    if (path.includes('/economy')) return 'economy';
    return 'dashboard';
  };
  
  const activeSection = getActiveSection();
  
  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (result.success) {
        toast.success(t('common.logout'));
        navigate('/login');
      } else {
        toast.error(t('error.unknown'));
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('error.unknown'));
    }
  };
  
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Toggle user menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  // Change language
  const handleLanguageChange = async (language) => {
    await changeLanguage(language);
    setIsUserMenuOpen(false);
  };
  
  // Close sidebar when navigating on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar */}
      <aside
        className={`w-64 bg-base-200 border-r border-base-300 fixed h-full z-30 transition-transform duration-300 lg:translate-x-0 lg:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-base-300">
          <span className="text-xl font-bold text-primary">{t('app.name')}</span>
        </div>
        
        {/* Nav links */}
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {/* Dashboard link */}
            <button
              onClick={() => navigate('/dashboard')}
              className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeSection === 'dashboard'
                  ? 'bg-primary text-white'
                  : 'text-base-content hover:bg-base-300'
              }`}
            >
              <svg className={`mr-3 h-6 w-6 ${activeSection === 'dashboard' ? 'text-white' : 'text-primary'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {t('dashboard.title')}
            </button>
            
            {/* Patients link */}
            <button
              onClick={() => navigate('/dashboard/patients')}
              className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeSection === 'patients'
                  ? 'bg-primary text-white'
                  : 'text-base-content hover:bg-base-300'
              }`}
            >
              <svg className={`mr-3 h-6 w-6 ${activeSection === 'patients' ? 'text-white' : 'text-primary'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {t('patients.title')}
            </button>
            
            {/* Journals link */}
            <button
              onClick={() => navigate('/dashboard/journals')}
              className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeSection === 'journals'
                  ? 'bg-primary text-white'
                  : 'text-base-content hover:bg-base-300'
              }`}
            >
              <svg className={`mr-3 h-6 w-6 ${activeSection === 'journals' ? 'text-white' : 'text-primary'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {t('journals.title')}
            </button>
            
            {/* Economy link - restricted to admin and manager roles */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
              <button
                onClick={() => navigate('/dashboard/economy')}
                className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'economy'
                    ? 'bg-primary text-white'
                    : 'text-base-content hover:bg-base-300'
                }`}
              >
                <svg className={`mr-3 h-6 w-6 ${activeSection === 'economy' ? 'text-white' : 'text-primary'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t('economy.title')}
              </button>
            )}
            
            {/* Admin links */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => navigate('/dashboard/users')}
                className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'users'
                    ? 'bg-primary text-white'
                    : 'text-base-content hover:bg-base-300'
                }`}
              >
                <svg className={`mr-3 h-6 w-6 ${activeSection === 'users' ? 'text-white' : 'text-primary'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                {t('users.management')}
              </button>
            )}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-base-100 border-b border-base-300">
          <div className="px-4 py-2 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-neutral focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            
            {/* Mobile title - hide when on search page */}
            {activeSection !== 'search' && (
              <div className="lg:hidden font-medium">
                {activeSection === 'dashboard' && t('dashboard.title')}
                {activeSection === 'patients' && t('patients.title')}
                {activeSection === 'journals' && t('journals.title')}
                {activeSection === 'users' && t('users.management')}
                {activeSection === 'profile' && t('profile.title')}
                {activeSection === 'economy' && t('economy.title')}
              </div>
            )}
            
            {/* Mobile search button */}
            <div className="lg:hidden">
              <button
                onClick={() => navigate('/dashboard/search')}
                className="p-2 rounded-md text-neutral focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-label={t('common.search')}
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
            
            {/* Desktop Global search */}
            <div className="hidden lg:block flex-1 px-4 max-w-md">
              <GlobalSearch />
            </div>
            
            {/* User menu */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>
              
              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-base-100 ring-1 ring-black ring-opacity-5 py-1 z-40">
                  {/* User info */}
                  <div className="px-4 py-2 text-sm text-neutral border-b border-base-200">
                    <p className="font-medium text-base-content">{currentUser?.username}</p>
                    <p className="text-xs">{currentUser?.role}</p>
                  </div>
                  
                  {/* My profile link */}
                  <button
                    onClick={() => {
                      navigate('/dashboard/profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-base-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t('profile.title')}
                  </button>
                  
                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-base-200 flex items-center"
                  >
                    {theme === 'vyperLight' ? (
                      <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {theme === 'vyperLight' ? t('common.theme.dark') : t('common.theme.light')}
                  </button>
                  
                  {/* Language options */}
                  <div className="px-4 py-2 text-sm text-neutral border-t border-base-200">
                    <p className="font-medium mb-1">{t('common.language')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleLanguageChange(LANGUAGES.SV)}
                        className={`text-sm px-2 py-1 rounded text-center ${
                          i18n.language === LANGUAGES.SV
                            ? 'bg-primary text-white'
                            : 'bg-base-200 hover:bg-base-300'
                        }`}
                      >
                        🇸🇪 Svenska
                      </button>
                      <button
                        onClick={() => handleLanguageChange(LANGUAGES.EN)}
                        className={`text-sm px-2 py-1 rounded text-center ${
                          i18n.language === LANGUAGES.EN
                            ? 'bg-primary text-white'
                            : 'bg-base-200 hover:bg-base-300'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                    </div>
                  </div>
                  
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-left text-error hover:bg-base-200 border-t border-base-200 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm6.293 11.293a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3z" clipRule="evenodd" />
                    </svg>
                    {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-base-100">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="patients" element={<PatientListView />} />
            <Route path="patients/:patientId" element={<PatientDetailView />} />
            <Route path="journals" element={<JournalsListView />} />
            <Route path="journals/:journalId" element={<JournalDetailView />} />
            <Route path="users" element={<UserManagementView />} />
            <Route path="users/:userId" element={<UserDetailView />} />
            <Route path="profile" element={<ProfileView />} />
            <Route path="search" element={<SearchResultsView />} />
            <Route path="economy" element={<EconomyView />} />
            <Route path="*" element={<Navigate to="/error" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardView;