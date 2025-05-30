import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default Loading;
