import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Calendar,
  User,
  Shield,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Edit3,
  Ban
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { Button, Input, Select, Modal, StatusBadge, Pagination, LoadingSpinner } from '../../components/common';

const RFIDCardsPage = () => {
  const [cards, setCards] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [cardStats, setCardStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lost: 0,
    expired: 0
  });
  const { addNotification } = useNotification();

  const [newCard, setNewCard] = useState({
    customerId: '',
    cardUid: '',
    expiryMonths: 12
  });

  const [filters, setFilters] = useState({
    isActive: '',
    dateFrom: '',
    dateTo: '',
    expiryStatus: ''
  });

  useEffect(() => {
    loadCards();
    loadCustomers();
  }, [currentPage, searchTerm, statusFilter, filters]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(filters.isActive !== '' && { isActive: filters.isActive }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.expiryStatus && { expiryStatus: filters.expiryStatus })
      };
      
      const response = await apiService.get('/devices/admin/cards', params);
      const cardsData = response.data?.cards || [];
      setCards(cardsData);
      setTotalPages(response.data?.pagination?.pages || 1);

      // Calculate stats
      const stats = cardsData.reduce((acc, card) => {
        acc.total++;
        if (card.isActive) acc.active++;
        else acc.inactive++;
        
        switch (card.status) {
          case 'LOST':
            acc.lost++;
            break;
          case 'EXPIRED':
            acc.expired++;
            break;
          default:
            break;
        }
        return acc;
      }, { total: 0, active: 0, inactive: 0, lost: 0, expired: 0 });

      setCardStats(stats);

    } catch (error) {
      console.error('Failed to load cards:', error);
      addNotification('error', 'Failed to load RFID cards');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await apiService.get('/admin/customers', { limit: 1000 });
      setCustomers(response.data?.customers || []);
    } catch (error) {
      console.error('Failed to load customers for dropdown');
    }
  };

  const handleAssignCard = async (e) => {
    e.preventDefault();
    
    if (!newCard.customerId || !newCard.cardUid) {
      addNotification('error', 'Please fill all required fields');
      return;
    }

    try {
      setAssignLoading(true);
      await apiService.post(`/devices/admin/cards/assign/${newCard.customerId}`, { 
        cardUid: newCard.cardUid,
        expiryMonths: newCard.expiryMonths
      });
      addNotification('success', 'RFID card assigned successfully');
      setShowAssignModal(false);
      setNewCard({ customerId: '', cardUid: '', expiryMonths: 12 });
      loadCards();
    } catch (error) {
      addNotification('error', error.message || 'Failed to assign card');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeactivateCard = async (cardId, reason = 'INACTIVE') => {
    const confirmMessage = reason === 'LOST' 
      ? 'Are you sure you want to mark this card as LOST? This action cannot be undone.'
      : 'Are you sure you want to deactivate this card?';
      
    if (!window.confirm(confirmMessage)) return;
    
    try {
      await apiService.patch(`/devices/cards/${cardId}/deactivate`, { reason });
      addNotification('success', `Card ${reason.toLowerCase()} successfully`);
      loadCards();
    } catch (error) {
      addNotification('error', 'Failed to deactivate card');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCards.length === 0) {
      addNotification('error', 'Please select cards to perform bulk action');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action.toLowerCase()} ${selectedCards.length} selected cards?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await apiService.post('/devices/admin/cards/bulk-action', {
        cardIds: selectedCards,
        action: action
      });
      addNotification('success', `Bulk ${action.toLowerCase()} completed successfully`);
      setSelectedCards([]);
      setShowBulkModal(false);
      loadCards();
    } catch (error) {
      addNotification('error', `Failed to perform bulk ${action.toLowerCase()}`);
    }
  };

  const openCardDetails = (card) => {
    setSelectedCard(card);
    setShowDetailsModal(true);
  };

  const toggleCardSelection = (cardId) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const selectAllCards = () => {
    if (selectedCards.length === cards.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(cards.map(card => card._id));
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setFilters({
      isActive: '',
      dateFrom: '',
      dateTo: '',
      expiryStatus: ''
    });
    setCurrentPage(1);
    setSearchTerm('');
  };

  const exportCards = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Card UID,Owner Name,Owner Email,Issue Date,Expiry Date,Status,Last Used,Active\n"
      + cards.map(c => 
          `"${c.cardUid}","${c.owner?.fullName || 'N/A'}","${c.owner?.email || 'N/A'}","${new Date(c.issuedAt).toLocaleDateString()}","${new Date(c.expiryDate).toLocaleDateString()}","${c.status}","${c.lastUsed ? new Date(c.lastUsed).toLocaleDateString() : 'Never'}","${c.isActive ? 'Yes' : 'No'}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rfid_cards_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification('success', 'Cards exported successfully');
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'LOST', label: 'Lost' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'PENDING_ACTIVATION', label: 'Pending Activation' }
  ];

  const expiryOptions = [
    { value: 6, label: '6 months' },
    { value: 12, label: '1 year' },
    { value: 24, label: '2 years' },
    { value: 36, label: '3 years' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'INACTIVE':
        return <XCircle className="text-gray-500" size={16} />;
      case 'LOST':
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'EXPIRED':
        return <Clock className="text-orange-500" size={16} />;
      case 'PENDING_ACTIVATION':
        return <Clock className="text-blue-500" size={16} />;
      default:
        return <XCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100 dark:bg-green-800 dark:text-green-100';
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-100';
      case 'LOST':
        return 'text-red-600 bg-red-100 dark:bg-red-800 dark:text-red-100';
      case 'EXPIRED':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-800 dark:text-orange-100';
      case 'PENDING_ACTIVATION':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-800 dark:text-blue-100';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const isCardExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const StatsCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            RFID Cards Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer RFID cards, track status, and monitor usage
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedCards.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setShowBulkModal(true)}
              leftIcon={<MoreVertical size={16} />}
            >
              Bulk Actions ({selectedCards.length})
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter size={16} />}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="secondary"
            onClick={loadCards}
            leftIcon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={exportCards}
            leftIcon={<Download size={16} />}
          >
            Export
          </Button>
          <Button
            onClick={() => setShowAssignModal(true)}
            leftIcon={<Plus size={16} />}
          >
            Assign Card
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total Cards"
          value={cardStats.total}
          icon={CreditCard}
          color="bg-blue-600"
        />
        <StatsCard
          title="Active"
          value={cardStats.active}
          icon={CheckCircle}
          color="bg-green-600"
        />
        <StatsCard
          title="Inactive"
          value={cardStats.inactive}
          icon={XCircle}
          color="bg-gray-600"
        />
        <StatsCard
          title="Lost"
          value={cardStats.lost}
          icon={AlertTriangle}
          color="bg-red-600"
        />
        <StatsCard
          title="Expired"
          value={cardStats.expired}
          icon={Clock}
          color="bg-orange-600"
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by card UID, owner name, or email..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Active Status
                </label>
                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Cards</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry Status
                </label>
                <select
                  value={filters.expiryStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, expiryStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Cards</option>
                  <option value="expiring_soon">Expiring Soon (30 days)</option>
                  <option value="expired">Already Expired</option>
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
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Cards Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCards.length === cards.length && cards.length > 0}
                    onChange={selectAllCards}
                    className="h-4 w-4 text-tapyze-orange focus:ring-tapyze-orange border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Card Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Used
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
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : cards.length > 0 ? (
                cards.map((card) => (
                  <tr key={card._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card._id)}
                        onChange={() => toggleCardSelection(card._id)}
                        className="h-4 w-4 text-tapyze-orange focus:ring-tapyze-orange border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-tapyze-orange flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {card.cardUid}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {card._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {card.owner ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {card.owner.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {card.owner.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No owner</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {new Date(card.issuedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {new Date(card.expiryDate).toLocaleDateString()}
                        {new Date(card.expiryDate) < new Date() && (
                          <AlertTriangle size={14} className="ml-1 text-red-500" title="Expired" />
                        )}
                        {isCardExpiringSoon(card.expiryDate) && (
                          <Clock size={14} className="ml-1 text-orange-500" title="Expiring Soon" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(card.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                          {card.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {card.lastUsed ? (
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1 text-gray-400" />
                          {new Date(card.lastUsed).toLocaleDateString()}
                        </div>
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openCardDetails(card)}
                          className="text-tapyze-orange hover:text-tapyze-orange-dark transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {card.isActive && (
                          <>
                            <button 
                              onClick={() => handleDeactivateCard(card._id, 'INACTIVE')}
                              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                              title="Deactivate Card"
                            >
                              <Ban size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeactivateCard(card._id, 'LOST')}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                              title="Mark as Lost"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No cards found</h3>
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

      {/* Assign Card Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign RFID Card"
      >
        <form onSubmit={handleAssignCard} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer
            </label>
            <select
              value={newCard.customerId}
              onChange={(e) => setNewCard({ ...newCard, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.fullName} ({customer.email})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Card UID"
            value={newCard.cardUid}
            onChange={(e) => setNewCard({ ...newCard, cardUid: e.target.value })}
            placeholder="Enter unique card identifier"
            required
            helperText="Enter the unique identifier printed on the RFID card"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Validity Period
            </label>
            <select
              value={newCard.expiryMonths}
              onChange={(e) => setNewCard({ ...newCard, expiryMonths: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange dark:bg-gray-700 dark:text-white"
            >
              {expiryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
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
              Assign Card
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Actions"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selected {selectedCards.length} cards. Choose an action to apply:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => handleBulkAction('DEACTIVATE')}
              fullWidth
            >
              Deactivate All
            </Button>
            <Button
              variant="danger"
              onClick={() => handleBulkAction('MARK_LOST')}
              fullWidth
            >
              Mark as Lost
            </Button>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => setShowBulkModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Card Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="RFID Card Details"
        size="lg"
      >
        {selectedCard && (
          <div className="space-y-6">
            {/* Card Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Card Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Card UID</label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedCard.cardUid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1 flex items-center">
                    {getStatusIcon(selectedCard.status)}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCard.status)}`}>
                      {selectedCard.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Date</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedCard.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiry Date</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedCard.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Used</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedCard.lastUsed ? new Date(selectedCard.lastUsed).toLocaleDateString() : 'Never used'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedCard.isActive ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            {selectedCard.owner && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  Owner Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedCard.owner.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedCard.owner.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedCard.owner.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedCard.owner.gender}</p>
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

export default RFIDCardsPage;