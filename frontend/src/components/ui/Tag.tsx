import React from 'react';
import Pill from '@/components/common/Pill';

interface TagProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, onClick, className = '' }) => {
  return (
    <Pill
      label={label}
      variant="primary"
      size="md"
      onClick={onClick}
      className={className}
    />
  );
};

export default Tag;
