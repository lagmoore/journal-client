// src/renderer/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'medium', center = true }) => {
  // Determine size
  let sizeClasses = 'h-8 w-8';
  if (size === 'small') {
    sizeClasses = 'h-4 w-4';
  } else if (size === 'large') {
    sizeClasses = 'h-16 w-16';
  }
  
  // Determine if centered
  const wrapperClasses = center ? 'flex items-center justify-center py-8' : '';
  
  return (
    <div className={wrapperClasses}>
      <div className={`${sizeClasses} animate-spin rounded-full border-t-2 border-b-2 border-primary`}></div>
    </div>
  );
};

export default LoadingSpinner;