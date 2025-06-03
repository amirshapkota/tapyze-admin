import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  CreditCard, 
  User,
  Calendar,
  Phone,
  Mail,
  Filter,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { Button, Input, Modal, StatusBadge, Pagination, LoadingSpinner } from '../../components/common';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerCards, setCustomerCards] = useState([]);
  const [filters, setFilters] = useState({
    gender: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchTerm, filters]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      };
      
      const response = await apiService.get('/admin/customers', params);
      setCustomers(response.data?.customers || []);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load customers:', error);
      addNotification('error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (customer) => {
    try {
      setSelectedCustomer(customer);
      setShowDetailsModal(true);
      
      // Load customer's cards
      const cardsResponse = await apiService.get(`/devices/admin/customers/${customer._id}/cards`);
      setCustomerCards(cardsResponse.data?.cards || []);
    } catch (error) {
      console.error('Failed to load customer details:', error);
      addNotification('error', 'Failed to load customer details');
    }
  };

  const exportCustomers = () => {
    // Implementation for CSV export
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Phone,Gender,Registration Date\n"
      + customers.map(c => 
          `"${c.fullName}","${c.email}","${c.phone}","${c.gender}","${new Date(c.createdAt).toLocaleDateString()}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification('success', 'Customers exported successfully');
  };

  const clearFilters = () => {
    setFilters({
      gender: '',
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
            Customer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all customer accounts
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
            onClick={loadCustomers}
            leftIcon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          <Button
            onClick={exportCustomers}
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
                placeholder="Search customers by name, email, or phone..."
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
                  Gender
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
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

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gender
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
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-tapyze-orange flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {customer.fullName?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {customer._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <Mail size={14} className="mr-1 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Phone size={14} className="mr-1 text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {customer.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status="ACTIVE" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadCustomerDetails(customer)}
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No customers found</h3>
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

      {/* Customer Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedCustomer.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedCustomer.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Cards */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <CreditCard className="mr-2" size={20} />
                RFID Cards ({customerCards.length})
              </h3>
              {customerCards.length > 0 ? (
                <div className="space-y-2">
                  {customerCards.map((card) => (
                    <div key={card._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {card.cardUid}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Issued: {new Date(card.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={card.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No cards assigned</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;