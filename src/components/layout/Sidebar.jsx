import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  CreditCard, 
  Wifi, 
  Receipt, 
  BarChart3, 
  X,
  ChevronDown,
  ChevronRight,
  Shield
} from 'lucide-react';
import { usePage } from '../../contexts/PageContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { currentPage, navigateTo } = usePage();
  const [expandedItems, setExpandedItems] = useState({
    users: true,
    devices: true
  });

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const navigation = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Home,
      href: 'dashboard'
    },
    { 
      id: 'users', 
      name: 'User Management', 
      icon: Users,
      expandable: true,
      children: [
        { id: 'customers', name: 'Customers', href: 'customers' },
        { id: 'merchants', name: 'Merchants', href: 'merchants' },
        { id: 'admins', name: 'Administrators', href: 'admins' }
      ]
    },
    { 
      id: 'devices', 
      name: 'Device Management', 
      icon: CreditCard,
      expandable: true,
      children: [
        { id: 'cards', name: 'RFID Cards', href: 'cards', icon: CreditCard },
        { id: 'scanners', name: 'NFC Scanners', href: 'scanners', icon: Wifi }
      ]
    },
    { 
      id: 'transactions', 
      name: 'Transactions', 
      icon: Receipt,
      href: 'transactions'
    },
    { 
      id: 'reports', 
      name: 'Reports & Analytics', 
      icon: BarChart3,
      href: 'reports'
    }
  ];

  const handleNavigation = (href) => {
    navigateTo(href);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={onClose} 
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 bg-tapyze-orange">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-lg font-bold text-white">Tapyze</h1>
              <p className="text-xs text-orange-100">Admin Panel</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden text-white hover:bg-orange-600 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.id}>
                {/* Main navigation item */}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 ${
                    (currentPage === item.href || 
                     (item.children && item.children.some(child => child.href === currentPage)))
                      ? 'bg-tapyze-orange-50 text-tapyze-orange border border-tapyze-orange-200' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => {
                    if (item.expandable) {
                      toggleExpanded(item.id);
                    } else if (item.href) {
                      handleNavigation(item.href);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </div>
                  
                  {item.expandable && (
                    <div className="text-gray-400">
                      {expandedItems[item.id] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                  )}
                </div>
                
                {/* Sub-navigation items */}
                {item.expandable && expandedItems[item.id] && item.children && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <div
                        key={child.id}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors duration-200 ${
                          currentPage === child.href
                            ? 'bg-tapyze-orange text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        onClick={() => handleNavigation(child.href)}
                      >
                        {child.icon && <child.icon size={16} />}
                        <span>{child.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tapyze Admin Panel
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;