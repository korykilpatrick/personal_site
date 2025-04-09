import React from 'react';

interface ErrorDisplayProps {
  error: Error | string | null;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, className = '' }) => {
  if (!error) return null;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return (
    <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${className}`}>
      <p>{errorMessage}</p>
    </div>
  );
};

export default ErrorDisplay;