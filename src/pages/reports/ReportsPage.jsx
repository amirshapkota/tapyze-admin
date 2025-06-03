import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  CreditCard,
  DollarSign,
  FileText,
  PieChart,
  Activity,
  Building
} from 'lucide-react';
import { Button } from '../../components/common';

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedReport, setSelectedReport] = useState('overview');

  const reportTypes = [
    {
      id: 'overview',
      name: 'System Overview',
      description: 'General system performance and statistics',
      icon: BarChart3,
      color: 'bg-blue-600'
    },
    {
      id: 'transactions',
      name: 'Transaction Analytics',
      description: 'Detailed transaction volume and trends',
      icon: TrendingUp,
      color: 'bg-green-600'
    },
    {
      id: 'users',
      name: 'User Analytics',
      description: 'Customer and merchant growth analysis',
      icon: Users,
      color: 'bg-purple-600'
    },
    {
      id: 'devices',
      name: 'Device Usage',
      description: 'RFID cards and NFC scanner utilization',
      icon: CreditCard,
      color: 'bg-tapyze-orange'
    },
    {
      id: 'financial',
      name: 'Financial Reports',
      description: 'Revenue, volume, and financial insights',
      icon: DollarSign,
      color: 'bg-emerald-600'
    },
    {
      id: 'compliance',
      name: 'Compliance Reports',
      description: 'Audit trails and regulatory compliance',
      icon: FileText,
      color: 'bg-red-600'
    }
  ];

  const periodOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const quickStats = [
    {
      title: 'Monthly Revenue',
      value: 'NPR 2,45,678',
      change: '+15.3%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+8.7%',
      changeType: 'increase',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Transaction Volume',
      value: '15,678',
      change: '+23.1%',
      changeType: 'increase',
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'Device Utilization',
      value: '87.5%',
      change: '+2.4%',
      changeType: 'increase',
      icon: CreditCard,
      color: 'text-tapyze-orange'
    }
  ];

  const generateReport = () => {
    // Placeholder for report generation
    alert(`Generating ${reportTypes.find(r => r.id === selectedReport)?.name} report for ${periodOptions.find(p => p.value === selectedPeriod)?.label}`);
  };

  const exportReport = (format) => {
    // Placeholder for export functionality
    alert(`Exporting report as ${format.toUpperCase()}`);
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <div className="flex items-center mt-1">
              <TrendingUp className={`mr-1 ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`} size={16} />
              <span className={`text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const ReportCard = ({ report, isSelected, onClick }) => (
    <div 
      onClick={onClick}
      className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-tapyze-orange bg-tapyze-orange-50 dark:bg-tapyze-orange-900/20' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-tapyze-orange-300'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${report.color}`}>
          <report.icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${isSelected ? 'text-tapyze-orange' : 'text-gray-900 dark:text-white'}`}>
            {report.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {report.description}
          </p>
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
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate comprehensive reports and analyze system performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => exportReport('pdf')}
            leftIcon={<Download size={16} />}
          >
            Export PDF
          </Button>
          <Button
            variant="secondary"
            onClick={() => exportReport('csv')}
            leftIcon={<Download size={16} />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generate Custom Report
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range (if custom is selected) */}
          {selectedPeriod === 'custom' && (
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tapyze-orange focus:border-tapyze-orange dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Type Selection */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Report Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              isSelected={selectedReport === report.id}
              onClick={() => setSelectedReport(report.id)}
            />
          ))}
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="flex justify-center">
        <Button
          onClick={generateReport}
          size="lg"
          leftIcon={<FileText size={20} />}
          className="px-8 py-3"
        >
          Generate Report
        </Button>
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Report Preview
        </h2>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Report Generated Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Select a report type and time period, then click "Generate Report" to see the preview here.
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <PieChart size={16} className="mr-1" />
                Charts
              </div>
              <div className="flex items-center">
                <BarChart3 size={16} className="mr-1" />
                Graphs
              </div>
              <div className="flex items-center">
                <FileText size={16} className="mr-1" />
                Tables
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Reports
        </h2>
        
        <div className="space-y-3">
          {[
            { name: 'Monthly Transaction Report', date: '2024-01-15', type: 'Transaction Analytics', size: '2.3 MB' },
            { name: 'User Growth Analysis', date: '2024-01-10', type: 'User Analytics', size: '1.8 MB' },
            { name: 'Device Utilization Report', date: '2024-01-08', type: 'Device Usage', size: '956 KB' },
            { name: 'Financial Summary Q4', date: '2024-01-05', type: 'Financial Reports', size: '3.1 MB' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-tapyze-orange rounded">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {report.type} • {report.date} • {report.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-tapyze-orange hover:text-tapyze-orange-dark text-sm">
                  View
                </button>
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-gradient-to-r from-tapyze-orange to-tapyze-orange-dark rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Advanced Analytics Coming Soon</h2>
            <p className="text-tapyze-orange-100 mb-4">
              We're working on advanced features including real-time dashboards, predictive analytics, and custom report builders.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">Real-time Dashboards</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Predictive Analytics</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Custom Report Builder</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">API Integration</span>
            </div>
          </div>
          <div className="hidden md:block">
            <Building className="h-16 w-16 text-white/50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;