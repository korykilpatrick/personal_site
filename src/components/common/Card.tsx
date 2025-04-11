import React, { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'hover' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
}) => {
  const baseClasses = 'rounded-lg overflow-hidden';

  const variantClasses = {
    default: 'bg-white shadow-sm',
    hover: 'bg-white shadow-sm transition hover:shadow-md',
    outline: 'bg-white border border-gray-200',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`;

  return (
    <div className={classes} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
};

export default Card;
