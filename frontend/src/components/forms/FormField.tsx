import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string | ReactNode;
  htmlFor: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  children,
  className = '', // Optional classes for the wrapping div
  labelClassName = 'block mb-1 font-medium text-gray-700', // Default label style
}) => {
  return (
    <div className={className}> {/* Apply wrapper class */} 
      <label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </label>
      {children} {/* Render the input/select/textarea component */} 
    </div>
  );
};

export default FormField; 