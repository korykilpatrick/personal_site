import React from 'react';

interface EmptyStateProps {
  message: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, className = '' }) => {
  return (
    <div className={`bg-white p-8 rounded-lg shadow-md text-center ${className}`}>
      <p className="text-xl text-gray-600">{message}</p>
    </div>
  );
};

export default EmptyState;