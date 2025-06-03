import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  Wifi, 
  Receipt,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import StatsCard from './StatsCard';
import { StatusBadge, LoadingSpinner } from '../../components/common';

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    merchants: 0,
    activeCards: 0,
    activeScanners: 0,
    totalTransactions: 0,
    totalVolume: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [
        customersRes,
        merchantsRes,
        cardsRes,
        scannersRes,
        transactionsRes
      ] = await Promise.allSettled([
        apiService.get('/admin/customers', { limit: 1 }),
        apiService.get('/admin/merchants', { limit: 1 }),
        apiService.get('/devices/admin/cards', { isActive: 'true', limit: 1 }),
        apiService.get('/devices/admin/scanners', { status: 'ONLINE', limit: 1 }),
        apiService.get('/admin/transactions', { limit: 10 })
      ]);

      // Process results safely
      setStats({
        customers: customersRes.status === 'fulfilled' ? customersRes.value.results || 0 : 0,
        merchants: merchantsRes.status === 'fulfilled' ? merchantsRes.value.results || 0 : 0,
        activeCards: cardsRes.status === 'fulfilled' ? cardsRes.value.results || 0 : 0,
        activeScanners: scannersRes.status === 'fulfilled' ? scannersRes.value.results || 0 : 0,
        totalTransactions: transactionsRes.status === 'fulfilled' ? transactionsRes.value.data?.pagination?.total || 0 : 0,
        totalVolume: transactionsRes.status === 'fulfilled' ? 
          transactionsRes.value.data?.transactions?.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) || 0 : 0
      });

      setRecentTransactions(
        transactionsRes.status === 'fulfilled' ? 
        transactionsRes.value.data?.transactions || [] : []
      );

    } catch (error) {
      console.error('Dashboard data load error:', error);
      addNotification('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboardData = async () => {
    try {
      setRefreshing(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Dashboard refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to Tapyze Admin Panel
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {refreshing && <LoadingSpinner size="sm" />}
          <button
            onClick={refreshDashboardData}
            disabled={refreshing}
            className="px-4 py-2 bg-tapyze-orange text-white rounded-lg hover:bg-tapyze-orange-dark transition-colors duration-200 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={stats.customers.toLocaleString()}
          icon={Users}
          color="blue"
          trend="+12%"
          trendDirection="up"
        />
        <StatsCard
          title="Total Merchants"
          value={stats.merchants.toLocaleString()}
          icon={Wifi}
          color="green"
          trend="+8%"
          trendDirection="up"
        />
        <StatsCard
          title="Active RFID Cards"
          value={stats.activeCards.toLocaleString()}
          icon={CreditCard}
          color="purple"
          trend="+15%"
          trendDirection="up"
        />
        <StatsCard
          title="Online Scanners"
          value={stats.activeScanners.toLocaleString()}
          icon={Activity}
          color="orange"
          trend="+5%"
          trendDirection="up"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          icon={Receipt}
          color="indigo"
          trend="+23%"
          trendDirection="up"
          subtitle="This month"
        />
        <StatsCard
          title="Transaction Volume"
          value={formatCurrency(stats.totalVolume)}
          icon={DollarSign}
          color="emerald"
          trend="+18%"
          trendDirection="up"
          subtitle="This month"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
            <button className="text-tapyze-orange hover:text-tapyze-orange-dark text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.status || 'COMPLETED'} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No recent transactions</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 bg-tapyze-orange-50 hover:bg-tapyze-orange-100 text-tapyze-orange rounded-lg transition-colors duration-200">
              Create New Admin
            </button>
            <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200">
              Assign RFID Card
            </button>
            <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors duration-200">
              Add NFC Scanner
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Payment Gateway</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activities
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">New customer registered</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">RFID card activated</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-tapyze-orange rounded-full mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">Scanner status updated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;