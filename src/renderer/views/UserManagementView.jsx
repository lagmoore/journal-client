// src/renderer/views/UserManagementView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

// Import components
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

const UserManagementView = () => {
  const { t } = useTranslation();
  const { currentUser, accessToken } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteUser, setDeleteUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all', // all, admin, manager, staff
    status: 'all', // all, active, locked
    sortBy: 'username', // username, email, role, status
    sortOrder: 'asc' // asc, desc
  });
  
  // Check if user is admin
  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      toast.error(t('users.errors.unauthorized'));
      navigate('/dashboard');
    }
  }, [currentUser, navigate, t]);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          toast.error(t('users.errors.loadFailed'));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(t('users.errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [accessToken, currentUser, t]);
  
  // Apply filters and search
  const filteredUsers = users.filter(user => {
    // Filter out current user
    if (user.id === currentUser.id) {
      return false;
    }
    
    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      if (
        !user.username.toLowerCase().includes(lowerSearchTerm) &&
        !user.email.toLowerCase().includes(lowerSearchTerm) &&
        !(user.firstName && user.firstName.toLowerCase().includes(lowerSearchTerm)) &&
        !(user.lastName && user.lastName.toLowerCase().includes(lowerSearchTerm)) &&
        !user.role.toLowerCase().includes(lowerSearchTerm)
      ) {
        return false;
      }
    }
    
    // Apply role filter
    if (filters.role !== 'all' && user.role !== filters.role) {
      return false;
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active' && (!user.isActive || user.isLocked)) {
        return false;
      }
      if (filters.status === 'locked' && !user.isLocked) {
        return false;
      }
      if (filters.status === 'inactive' && user.isActive) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case 'username':
        comparison = a.username.localeCompare(b.username);
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'role':
        comparison = a.role.localeCompare(b.role);
        break;
      case 'status':
        // Sort by isActive first, then by isLocked
        if (a.isActive !== b.isActive) {
          comparison = a.isActive ? -1 : 1;
        } else if (a.isLocked !== b.isLocked) {
          comparison = a.isLocked ? 1 : -1;
        }
        break;
      case 'lastLogin':
        comparison = (new Date(a.lastLogin || 0) - new Date(b.lastLogin || 0));
        break;
      default:
        comparison = a.username.localeCompare(b.username);
    }
    
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t('common.never');
    return new Date(dateString).toLocaleString();
  };
  
  // Handle user detail view
  const handleViewUser = (userId) => {
    navigate(`/dashboard/users/${userId}`);
  };
  
  // Handle create user
  const handleCreateUser = () => {
    navigate('/dashboard/users/new');
  };
  
  // Handle delete user
  const confirmDelete = (user) => {
    setDeleteUser(user);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    
    try {
      const response = await api.delete(`/admin/users/${deleteUser.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.data.success) {
        toast.success(t('users.success.deleted'));
        // Remove user from the state
        setUsers(users.filter(user => user.id !== deleteUser.id));
      } else {
        toast.error(response.data.message || t('users.errors.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('users.errors.deleteFailed'));
    }
    
    setShowDeleteDialog(false);
    setDeleteUser(null);
  };
  
  // Handle toggle user status (active/inactive)
  const handleToggleActive = async (user) => {
    try {
      const response = await api.put(`/admin/users/${user.id}`, {
        isActive: !user.isActive
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.data.success) {
        toast.success(user.isActive ? t('users.success.deactivated') : t('users.success.activated'));
        
        // Update user in state
        setUsers(users.map(u => 
          u.id === user.id ? response.data.user : u
        ));
      } else {
        toast.error(response.data.message || t('users.errors.updateFailed'));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(t('users.errors.updateFailed'));
    }
  };
  
  // Handle toggle user lock status
  const handleToggleLock = async (user) => {
    try {
      const response = await api.put(`/admin/users/${user.id}`, {
        isLocked: !user.isLocked
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.data.success) {
        toast.success(user.isLocked ? t('users.success.unlocked') : t('users.success.locked'));
        
        // Update user in state
        setUsers(users.map(u => 
          u.id === user.id ? response.data.user : u
        ));
      } else {
        toast.error(response.data.message || t('users.errors.updateFailed'));
      }
    } catch (error) {
      console.error('Error updating user lock status:', error);
      toast.error(t('users.errors.updateFailed'));
    }
  };
  
  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };
  
  // Get status badge class and text
  const getUserStatusBadge = (user) => {
    if (user.isLocked) {
      return {
        class: 'bg-error bg-opacity-10 text-error',
        text: t('users.status.locked')
      };
    } else if (!user.isActive) {
      return {
        class: 'bg-warning bg-opacity-10 text-warning',
        text: t('users.status.inactive')
      };
    } else {
      return {
        class: 'bg-success bg-opacity-10 text-success',
        text: t('users.status.active')
      };
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('users.management')}</h1>
        <button
          onClick={handleCreateUser}
          className="btn btn-primary"
        >
          {t('users.actions.create')}
        </button>
      </div>
      
      {/* Search and filters */}
      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search input */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={t('users.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Role filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="all">{t('users.filters.allRoles')}</option>
              <option value="admin">{t('users.roles.admin')}</option>
              <option value="manager">{t('users.roles.manager')}</option>
              <option value="staff">{t('users.roles.staff')}</option>
            </select>
          </div>
          
          {/* Status filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">{t('users.filters.allStatus')}</option>
              <option value="active">{t('users.status.active')}</option>
              <option value="inactive">{t('users.status.inactive')}</option>
              <option value="locked">{t('users.status.locked')}</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Sort by */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('users.filters.sortBy')}
            </label>
            <select
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="username">{t('users.fields.username')}</option>
              <option value="email">{t('users.fields.email')}</option>
              <option value="role">{t('users.fields.role')}</option>
              <option value="status">{t('users.fields.status')}</option>
              <option value="lastLogin">{t('users.fields.lastLogin')}</option>
            </select>
          </div>
          
          {/* Sort order */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('users.filters.sortOrder')}
            </label>
            <div className="flex gap-2">
              <button
                className={`flex-1 px-3 py-2 rounded-md border ${
                  filters.sortOrder === 'asc'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-base-100 text-base-content border-base-300'
                }`}
                onClick={() => handleFilterChange('sortOrder', 'asc')}
              >
                {t('users.filters.ascending')}
              </button>
              <button
                className={`flex-1 px-3 py-2 rounded-md border ${
                  filters.sortOrder === 'desc'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-base-100 text-base-content border-base-300'
                }`}
                onClick={() => handleFilterChange('sortOrder', 'desc')}
              >
                {t('users.filters.descending')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* User list */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredUsers.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                  {t('users.fields.username')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                  {t('users.fields.email')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                  {t('users.fields.role')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                  {t('users.fields.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
                  {t('users.fields.lastLogin')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral uppercase tracking-wider">
                  {t('users.fields.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-base-100 divide-y divide-base-300">
              {filteredUsers.map((user) => {
                const statusBadge = getUserStatusBadge(user);
                return (
                  <tr 
                    key={user.id} 
                    className="hover:bg-base-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-base-content">
                          {user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{t(`users.roles.${user.role}`)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral">{formatDate(user.lastLogin)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-primary hover:text-primary-focus"
                        >
                          {t('users.actions.edit')}
                        </button>
                        <span className="text-neutral">|</span>
                        {user.isLocked ? (
                          <button
                            onClick={() => handleToggleLock(user)}
                            className="text-success hover:text-success"
                          >
                            {t('users.actions.unlock')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleLock(user)}
                            className="text-warning hover:text-warning"
                          >
                            {t('users.actions.lock')}
                          </button>
                        )}
                        <span className="text-neutral">|</span>
                        {user.isActive ? (
                          <button
                            onClick={() => handleToggleActive(user)}
                            className="text-warning hover:text-warning"
                          >
                            {t('users.actions.deactivate')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(user)}
                            className="text-success hover:text-success"
                          >
                            {t('users.actions.activate')}
                          </button>
                        )}
                        <span className="text-neutral">|</span>
                        <button
                          onClick={() => confirmDelete(user)}
                          className="text-error hover:text-error"
                        >
                          {t('users.actions.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral text-lg">
            {searchTerm || filters.role !== 'all' || filters.status !== 'all'
              ? t('users.noResults')
              : t('users.empty')}
          </p>
          {!searchTerm && filters.role === 'all' && filters.status === 'all' && (
            <button
              onClick={handleCreateUser}
              className="btn btn-primary mt-4"
            >
              {t('users.actions.createFirst')}
            </button>
          )}
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={t('users.deleteDialog.title')}
        message={t('users.deleteDialog.message', { name: deleteUser?.username || '' })}
        confirmText={t('users.deleteDialog.confirm')}
        cancelText={t('users.deleteDialog.cancel')}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeleteUser(null);
        }}
        variant="danger"
      />
    </div>
  );
};

export default UserManagementView;