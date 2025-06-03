import React, { createContext, useContext, useState } from 'react';

const PageContext = createContext();

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within PageProvider');
  }
  return context;
};

export const PageProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageHistory, setPageHistory] = useState(['dashboard']);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setPageHistory(prev => [...prev, page]);
  };

  const goBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = pageHistory.slice(0, -1);
      setPageHistory(newHistory);
      setCurrentPage(newHistory[newHistory.length - 1]);
    }
  };

  const value = {
    currentPage,
    pageHistory,
    navigateTo,
    goBack
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
};