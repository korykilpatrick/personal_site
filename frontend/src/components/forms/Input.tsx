import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Add any custom props specific to your Input component if needed in the future
  // e.g., error?: string;
}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  // Base input styling using Tailwind classes (matches styles used in forms)
  const baseInputStyles =
    "w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100";

  return (
    <input
      className={`${baseInputStyles} ${className}`}
      {...props}
    />
  );
};

export default Input; 