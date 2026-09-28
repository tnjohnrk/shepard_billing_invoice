import React from 'react';

export function PageContainer({ children, className = '' }) {
  return (
    <div className={`p-3 sm:p-5 md:p-6 2xl:p-8 w-full max-w-[2560px] mx-auto space-y-4 sm:space-y-6 2xl:space-y-8 animate-fade-in ${className}`}>
      {children}
    </div>
  );
}
