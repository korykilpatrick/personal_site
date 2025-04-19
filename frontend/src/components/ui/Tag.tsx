import React from 'react';

interface TagProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, onClick, className = '' }) => {
  return (
    <span
      className={`px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium ${onClick ? 'cursor-pointer hover:bg-primary/20' : ''} ${className}`}
      onClick={onClick}
    >
      {label}
    </span>
  );
};

export default Tag;
