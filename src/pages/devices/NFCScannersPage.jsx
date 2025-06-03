import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  Building,
  Settings,
  RefreshCw,
  Download,
  Activity,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { Button, Input, Select, Modal, StatusBadge, Pagination, LoadingSpinner } from '../../components/common';

const NFCScannersPage = () => {
  const [scanners, setScanners] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedScanner, setSelectedScanner] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { addNotification } = useNotification();

  const [newScanner, setNewScanner] = useState({
    merchantId: '',
    deviceId: '',
    model: '',
    firmwareVersion: ''
  });

  const [scannerUpdate, setScannerUpdate] = useState({
    status: '',
    firmwareVersion: ''
  });

  const [filters, setFilters] = useState({
    isActive: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadScanners();
    loadMerchants();
  }, [currentPage, searchTerm, statusFilter, filters]);

  const loadScanners = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(filters.isActive !== '' && { isActive: filters.isActive }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      };
      
      const response = await apiService.get('/devices/admin/scanners', params);
      setScanners(response.data?.scanners || []);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load scanners:', error);
      addNotification('error', 'Failed to load NFC scanners');
    } finally {
      setLoading(false);
    }
  };

  const loadMerchants = async () => {
    try {
      const response = await apiService.get('/admin/merchants', { limit: 1000 });
      setMerchants(response.data?.merchants || []);
    } catch (error) {
      console.error('Failed to load merchants for dropdown');
    }
  };

  const handleAssignScanner = async (e) => {
    e.preventDefault();
    
    if (!newScanner.merchantId || !newScanner.deviceId || !newScanner.model) {
      addNotification('error', 'Please fill all required fields');
      return;
    }

    try {
      setAssignLoading(true);
      await apiService.post(`/devices/admin/scanners/assign/${newScanner.merchantId}`, {
        deviceId: newScanner.deviceId,
        model: newScanner.model,
        firmwareVersion: newScanner.firmwareVersion
      });
      addNotification('success', 'NFC scanner assigned successfully');
      setShowAssignModal(false);
      setNewScanner({ merchantId: '', deviceId: '', model: '', firmwareVersion: '' });
      loadScanners();
    } catch (error) {
      addNotification('error', error.message || 'Failed to assign scanner');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUpdateScanner = async (e) => {
    e.preventDefault();
    
    if (!scannerUpdate.status && !scannerUpdate.firmwareVersion) {
      addNotification('error', 'Please provide at least one field to update');
      return;
    }

    try {
      setUpdateLoading(true);
      await apiService.patch(`/devices/scanners/${selectedScanner._id}`, scannerUpdate);
      addNotification('success', 'Scanner updated successfully');
      setShowUpdateModal(false);
      setScannerUpdate({ status: '', firmwareVersion: '' });
      setSelectedScanner(null);
      loadScanners();
    } catch (error) {
      addNotification('error', error.message || 'Failed to update scanner');
    } finally {
      setUpdateLoading(false);
    }
  };

  const openUpdateModal = (scanner) => {
    setSelectedScanner(scanner);
    setScannerUpdate({
      status: scanner.status,
      firmwareVersion: scanner.firmwareVersion || ''
    });
    setShowUpdateModal(true);
  };

  const openScannerDetails = (scanner) => {
    setSelectedScanner(scanner);
    setShowDetailsModal(true);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setFilters({
      isActive: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
    setSearchTerm('');
  };

  const exportScanners = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Device ID,Business Name,Owner Name,Model,Firmware,Status,Registration Date,Last Connected\n"
      + scanners.map(s => 
          `"${s.deviceId}","${s.owner?.businessName || 'N/A'}","${s.owner?.ownerName || 'N/A'}","${s.model}","${s.firmwareVersion || 'N/A'}","${s.status}","${new Date(s.registeredAt).toLocaleDateString()}","${s.lastConnected ? new Date(s.lastConnected).toLocaleDateString() : 'Never'}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nfc_scanners_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification('success', 'Scanners exported successfully');
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'OFFLINE', label: 'Offline' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'PENDING_ACTIVATION', label: 'Pending Activation' }
  ];

  const updateStatusOptions = [
    { value: 'ONLINE', label: 'Online' },
    { value: 'OFFLINE', label: 'Offline' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'PENDING_ACTIVATION', label: 'Pending Activation' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE':
        return 'text-green-600 bg-green-100 dark:bg-green-800 dark:text-green-100';
      case 'OFFLINE':
        return 'text-red-600 bg-red-100 dark:bg-red-800 dark:text-red-100';
      case 'MAINTENANCE':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-100';
      case 'PENDING_ACTIVATION':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-800 dark:text-blue-100';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONLINE':
        return <Activity size={14} className="text-green-500" />;
      case 'OFFLINE':
        return <AlertCircle size={14} className="text-red-500" />;
      case 'MAINTENANCE':
        return <Settings size={14} className="text-yellow-500" />;
      case 'PENDING_ACTIVATION':
        return <RefreshCw size={14} className="text-blue-500" />;
      default:
        return <AlertCircle size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            NFC Scanners Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage merchant NFC scanners and their status
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter size={16} />}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="secondary"
            onClick={loadScanners}
            leftIcon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={exportScanners}
            leftIcon={<Download size={16} />}
          >
            Export
          </Button>
          <Button
            onClick={() => setShowAssignModal(true)}
            leftIcon={<Plus size={16} />}
          >
            Assign Scanner
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by device ID or business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Active Status
                </label>
                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Scanners</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Scanners Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Device Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Model & Firmware
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Connected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : scanners.length > 0 ? (
                scanners.map((scanner) => (
                  <tr key={scanner._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Wifi className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {scanner.deviceId}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {scanner._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {scanner.owner ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {scanner.owner.businessName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {scanner.owner.ownerName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No owner</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {scanner.model}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        v{scanner.firmwareVersion || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(scanner.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scanner.status)}`}>
                          {scanner.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {scanner.lastConnected ? (
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {new Date(scanner.lastConnected).toLocaleDateString()}
                        </div>
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {new Date(scanner.registeredAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openScannerDetails(scanner)}
                          className="text-tapyze-orange hover:text-tapyze-orange-dark transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => openUpdateModal(scanner)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                          title="Update Scanner"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Wifi className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No scanners found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Try adjusting your search or filter criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Assign Scanner Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign NFC Scanner"
      >
        <form onSubmit={handleAssignScanner} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Merchant
            </label>
            <select
              value={newScanner.merchantId}
              onChange={(e) => setNewScanner({ ...newScanner, merchantId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select a merchant</option>
              {merchants.map(merchant => (
                <option key={merchant._id} value={merchant._id}>
                  {merchant.businessName} ({merchant.ownerName})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Device ID"
            value={newScanner.deviceId}
            onChange={(e) => setNewScanner({ ...newScanner, deviceId: e.target.value })}
            placeholder="Enter unique device identifier"
            required
            helperText="Enter the unique identifier of the NFC scanner device"
          />
          <Input
            label="Model"
            value={newScanner.model}
            onChange={(e) => setNewScanner({ ...newScanner, model: e.target.value })}
            placeholder="Enter scanner model"
            required
          />
          <Input
            label="Firmware Version"
            value={newScanner.firmwareVersion}
            onChange={(e) => setNewScanner({ ...newScanner, firmwareVersion: e.target.value })}
            placeholder="Enter firmware version (optional)"
            helperText="Current firmware version of the scanner"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              loading={assignLoading}
            >
              Assign Scanner
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Scanner Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update Scanner"
      >
        <form onSubmit={handleUpdateScanner} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={scannerUpdate.status}
              onChange={(e) => setScannerUpdate({ ...scannerUpdate, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select status</option>
              {updateStatusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Firmware Version"
            value={scannerUpdate.firmwareVersion}
            onChange={(e) => setScannerUpdate({ ...scannerUpdate, firmwareVersion: e.target.value })}
            placeholder="Enter new firmware version"
            helperText="Update to new firmware version"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => setShowUpdateModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              loading={updateLoading}
            >
              Update Scanner
            </Button>
          </div>
        </form>
      </Modal>

      {/* Scanner Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="NFC Scanner Details"
        size="lg"
      >
        {selectedScanner && (
          <div className="space-y-6">
            {/* Scanner Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Scanner Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Device ID</label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedScanner.deviceId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1 flex items-center">
                    {getStatusIcon(selectedScanner.status)}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedScanner.status)}`}>
                      {selectedScanner.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedScanner.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Firmware Version</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedScanner.firmwareVersion || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedScanner.registeredAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Connected</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedScanner.lastConnected ? new Date(selectedScanner.lastConnected).toLocaleDateString() : 'Never connected'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedScanner.isActive ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            {selectedScanner.owner && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Building className="mr-2" size={20} />
                  Business Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedScanner.owner.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner Name</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedScanner.owner.ownerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedScanner.owner.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedScanner.owner.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Address</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedScanner.owner.businessAddress}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NFCScannersPage;