import React from 'react';

export function PageContainer({ children, className = '' }) {
  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 animate-fade-in ${className}`}>
      {children}
    </div>
  );
}
