import React from 'react';

export function PageContainer({ children, className = '' }) {
  return (
    <div className={`p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full animate-fade-in ${className}`}>
      {children}
    </div>
  );
}
