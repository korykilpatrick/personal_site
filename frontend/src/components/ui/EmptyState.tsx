import React from 'react';

interface EmptyStateProps {
  message: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, className = '' }) => {
  return (
    <div className={`site-empty-state ${className}`}>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
