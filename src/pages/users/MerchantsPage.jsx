import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  Wifi, 
  Building,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Filter,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { Button, Modal, StatusBadge, Pagination, LoadingSpinner } from '../../components/common';

const MerchantsPage = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [merchantScanners, setMerchantScanners] = useState([]);
  const [filters, setFilters] = useState({
    businessType: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadMerchants();
  }, [currentPage, searchTerm, filters]);

  const loadMerchants = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.businessType && { businessType: filters.businessType }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      };
      
      const response = await apiService.get('/admin/merchants', params);
      setMerchants(response.data?.merchants || []);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load merchants:', error);
      addNotification('error', 'Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const loadMerchantDetails = async (merchant) => {
    try {
      setSelectedMerchant(merchant);
      setShowDetailsModal(true);
      
      // Load merchant's scanners
      const scannersResponse = await apiService.get(`/devices/admin/merchants/${merchant._id}/scanners`);
      setMerchantScanners(scannersResponse.data?.scanners || []);
    } catch (error) {
      console.error('Failed to load merchant details:', error);
      addNotification('error', 'Failed to load merchant details');
    }
  };

  const exportMerchants = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Business Name,Owner Name,Email,Phone,Business Type,Business Address,Registration Date\n"
      + merchants.map(m => 
          `"${m.businessName}","${m.ownerName}","${m.email}","${m.phone}","${m.businessType}","${m.businessAddress}","${new Date(m.createdAt).toLocaleDateString()}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `merchants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification('success', 'Merchants exported successfully');
  };

  const clearFilters = () => {
    setFilters({
      businessType: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Merchant Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all merchant accounts
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter size={16} />}
          >
            Filters
          </Button>
          <Button
            variant="secondary"
            onClick={loadMerchants}
            leftIcon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          <Button
            onClick={exportMerchants}
            leftIcon={<Download size={16} />}
          >
            Export CSV
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
                placeholder="Search merchants by business name, owner, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Type
                </label>
                <select
                  value={filters.businessType}
                  onChange={(e) => setFilters(prev => ({ ...prev, businessType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Business Types</option>
                  <option value="Retail">Retail</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Service">Service</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
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

      {/* Merchants Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registered
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
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : merchants.length > 0 ? (
                merchants.map((merchant) => (
                  <tr key={merchant._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                            <Building className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {merchant.businessName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {merchant._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {merchant.ownerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <Mail size={14} className="mr-1 text-gray-400" />
                        {merchant.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Phone size={14} className="mr-1 text-gray-400" />
                        {merchant.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {merchant.businessType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {new Date(merchant.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status="ACTIVE" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadMerchantDetails(merchant)}
                          className="text-tapyze-orange hover:text-tapyze-orange-dark transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Building className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No merchants found</h3>
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

      {/* Merchant Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Merchant Details"
        size="lg"
      >
        {selectedMerchant && (
          <div className="space-y-6">
            {/* Business Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Business Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedMerchant.businessName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner Name</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedMerchant.ownerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedMerchant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedMerchant.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Type</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedMerchant.businessType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedMerchant.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <MapPin size={14} className="mr-1" />
                    Business Address
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedMerchant.businessAddress}</p>
                </div>
              </div>
            </div>

            {/* NFC Scanners */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Wifi className="mr-2" size={20} />
                NFC Scanners ({merchantScanners.length})
              </h3>
              {merchantScanners.length > 0 ? (
                <div className="space-y-2">
                  {merchantScanners.map((scanner) => (
                    <div key={scanner._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {scanner.deviceId}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Model: {scanner.model} | Firmware: {scanner.firmwareVersion || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last Connected: {scanner.lastConnected ? new Date(scanner.lastConnected).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <StatusBadge status={scanner.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No scanners assigned</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MerchantsPage;