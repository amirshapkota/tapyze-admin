import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Shield, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Mail,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Button, Input, Select, Modal, StatusBadge, LoadingSpinner } from '../../components/common';

const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const { addNotification } = useNotification();
  const { user } = useAuth();

  const [newAdmin, setNewAdmin] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN'
  });

  const [editAdmin, setEditAdmin] = useState({
    fullName: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/admins');
      setAdmins(response.data?.admins || []);
    } catch (error) {
      console.error('Failed to load admins:', error);
      addNotification('error', 'Failed to load administrators');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      addNotification('error', 'Passwords do not match');
      return;
    }

    if (newAdmin.password.length < 8) {
      addNotification('error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setCreateLoading(true);
      await apiService.post('/auth/admin/create', newAdmin);
      addNotification('success', 'Administrator created successfully');
      setShowCreateModal(false);
      setNewAdmin({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'ADMIN'
      });
      loadAdmins();
    } catch (error) {
      addNotification('error', error.message || 'Failed to create administrator');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditAdmin({
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role
    });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    
    try {
      setUpdateLoading(true);
      await apiService.patch(`/admin/admins/${selectedAdmin._id}`, editAdmin);
      addNotification('success', 'Administrator updated successfully');
      setShowEditModal(false);
      setSelectedAdmin(null);
      loadAdmins();
    } catch (error) {
      addNotification('error', error.message || 'Failed to update administrator');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeactivateAdmin = async (adminId, adminName) => {
    if (adminId === user?.id) {
      addNotification('error', 'You cannot deactivate your own account');
      return;
    }

    if (!window.confirm(`Are you sure you want to deactivate ${adminName}?`)) {
      return;
    }

    try {
      await apiService.patch(`/admin/admins/${adminId}/deactivate`);
      addNotification('success', 'Administrator deactivated successfully');
      loadAdmins();
    } catch (error) {
      addNotification('error', 'Failed to deactivate administrator');
    }
  };

  const roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MANAGER', label: 'Manager' }
  ];

  // Only SUPER_ADMIN can create other SUPER_ADMINs
  if (user?.role === 'SUPER_ADMIN') {
    roleOptions.unshift({ value: 'SUPER_ADMIN', label: 'Super Admin' });
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'MANAGER':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Administrator Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage system administrators and their permissions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={loadAdmins}
            leftIcon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<UserPlus size={16} />}
          >
            Create Admin
          </Button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Administrator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            admin.role === 'SUPER_ADMIN' 
                              ? 'bg-red-600' 
                              : admin.role === 'ADMIN' 
                              ? 'bg-tapyze-orange' 
                              : 'bg-green-600'
                          }`}>
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {admin.fullName}
                            {admin._id === user?.id && (
                              <span className="ml-2 text-xs text-tapyze-orange">(You)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {admin._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <Mail size={14} className="mr-1 text-gray-400" />
                        {admin.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={admin.isActive !== false ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="text-tapyze-orange hover:text-tapyze-orange-dark transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        {admin._id !== user?.id && (
                          <button
                            onClick={() => handleDeactivateAdmin(admin._id, admin.fullName)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            title="Deactivate"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No administrators found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Create the first administrator to get started.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Administrator"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <Input
            label="Full Name"
            value={newAdmin.fullName}
            onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
            required
            placeholder="Enter full name"
          />
          <Input
            label="Email"
            type="email"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            required
            placeholder="Enter email address"
          />
          <Input
            label="Password"
            type="password"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            required
            placeholder="Enter password (min 8 characters)"
            helperText="Password must be at least 8 characters long"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={newAdmin.confirmPassword}
            onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
            required
            placeholder="Confirm password"
          />
          <Select
            label="Role"
            value={newAdmin.role}
            onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
            options={roleOptions}
            required
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              loading={createLoading}
            >
              Create Administrator
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Administrator"
      >
        <form onSubmit={handleUpdateAdmin} className="space-y-4">
          <Input
            label="Full Name"
            value={editAdmin.fullName}
            onChange={(e) => setEditAdmin({ ...editAdmin, fullName: e.target.value })}
            required
            placeholder="Enter full name"
          />
          <Input
            label="Email"
            type="email"
            value={editAdmin.email}
            onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
            required
            placeholder="Enter email address"
          />
          <Select
            label="Role"
            value={editAdmin.role}
            onChange={(e) => setEditAdmin({ ...editAdmin, role: e.target.value })}
            options={roleOptions}
            required
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              loading={updateLoading}
            >
              Update Administrator
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminsPage;