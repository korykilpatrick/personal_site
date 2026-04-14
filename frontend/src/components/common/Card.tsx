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
  const baseClasses =
    'site-card overflow-hidden transition duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]';

  const variantClasses = {
    default: '',
    hover:
      'hover:-translate-y-0.5 hover:border-secondary/20 hover:shadow-[0_24px_52px_rgba(21,38,63,0.1)]',
    outline: 'bg-[rgba(250,252,255,0.72)] shadow-[0_10px_28px_rgba(21,38,63,0.05)]',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7 sm:p-8',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`;

  return (
    <div className={classes} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
};

export default Card;
