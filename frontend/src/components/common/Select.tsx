import React, { SelectHTMLAttributes, ChangeEvent } from 'react';

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  options: Array<{
    value: string;
    label: string;
  }>;
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses =
    'block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500';

  const sizeClasses = {
    sm: 'py-1 text-xs',
    md: 'py-2 text-sm',
    lg: 'py-3 text-base',
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${className}`;

  return (
    <select
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      className={classes}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
