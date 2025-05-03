import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium focus:outline-none transition-colors';

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark',
    outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100',
    text: 'bg-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 rounded',
    md: 'text-xs px-3 py-1.5 rounded',
    lg: 'text-sm px-4 py-2 rounded-md',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;