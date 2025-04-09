import React from 'react';
import Icon from './Icon';

export interface PillProps {
  label: string;
  onRemove?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

const Pill: React.FC<PillProps> = ({
  label,
  onRemove,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center rounded-full';

  const variantClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-gray-200 text-gray-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <div className={classes}>
      <span className={onRemove ? 'mr-1' : ''}>{label}</span>

      {onRemove && (
        <button
          onClick={onRemove}
          className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none"
          aria-label={`Remove ${label}`}
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
};

export default Pill;
