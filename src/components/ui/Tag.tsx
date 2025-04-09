import React from 'react';

interface TagProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, onClick, className = '' }) => {
  return (
    <span 
      className={`px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {label}
    </span>
  );
};

export default Tag;