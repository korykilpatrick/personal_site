import React from 'react';

interface ErrorDisplayProps {
  error: Error | string | null;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, className = '' }) => {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <div className={`site-error-state ${className}`} role="alert">
      <p>{errorMessage}</p>
    </div>
  );
};

export default ErrorDisplay;
