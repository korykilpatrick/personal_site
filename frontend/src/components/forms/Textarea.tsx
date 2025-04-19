import React, { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Add any custom props specific to your Textarea component if needed in the future
}

const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  // Base input styling using Tailwind classes (matches styles used in forms)
  // Combine base styles with minimum height specific to textarea
  const baseTextareaStyles =
    "w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[100px]";

  return (
    <textarea
      className={`${baseTextareaStyles} ${className}`}
      {...props}
    />
  );
};

export default Textarea; 