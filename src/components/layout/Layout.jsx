import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { NotificationList } from '../notifications';
import { usePage } from '../../contexts/PageContext';

// Import all pages
import Dashboard from '../../pages/dashboard/Dashboard';
import CustomersPage from '../../pages/users/CustomersPage';
import MerchantsPage from '../../pages/users/MerchantsPage';
import AdminsPage from '../../pages/users/AdminsPage';
import RFIDCardsPage from '../../pages/devices/RFIDCardsPage';
import NFCScannersPage from '../../pages/devices/NFCScannersPage';
import TransactionsPage from '../../pages/transactions/TransactionsPage';
import ReportsPage from '../../pages/reports/ReportsPage';

const MainContent = () => {
  const { currentPage } = usePage();
  
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomersPage />;
      case 'merchants':
        return <MerchantsPage />;
      case 'admins':
        return <AdminsPage />;
      case 'cards':
        return <RFIDCardsPage />;
      case 'scanners':
        return <NFCScannersPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 dark:bg-gray-900">
      <div className="animate-fade-in">
        {renderPage()}
      </div>
    </main>
  );
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <MainContent />
      </div>
      
      <NotificationList />
    </div>
  );
};

export default Layout;