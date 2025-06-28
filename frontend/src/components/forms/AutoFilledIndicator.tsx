import React from 'react';

interface AutoFilledIndicatorProps {
  isAutoFilled: boolean;
}

const AutoFilledIndicator: React.FC<AutoFilledIndicatorProps> = ({ isAutoFilled }) => {
  if (!isAutoFilled) return null;

  return (
    <span className="ml-2 inline-flex items-center text-xs text-green-600" title="Auto-filled from URL">
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a1 1 0 100 2H6a4 4 0 01-4-4V5a4 4 0 014-4h4a1 1 0 010 2H6z" clipRule="evenodd" />
        <path d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H7a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" />
      </svg>
      Auto-filled
    </span>
  );
};

export default AutoFilledIndicator;