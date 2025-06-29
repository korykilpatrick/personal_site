import React, { useEffect } from 'react';
import { useContentExtractionWithDebounce } from '../../hooks';
import FormInput from './FormInput';
import { Loading } from '../ui';
import type { ExtractedContent } from 'types/index';
import type { ExtractionError } from '../../utils/extractionErrors';

interface SmartLinkInputProps {
  id: string;
  name?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExtractedData?: (data: ExtractedContent) => void;
  onExtractionError?: (error: ExtractionError) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  debounceDelay?: number;
}

/**
 * An intelligent URL input component that automatically extracts metadata
 * when a URL is pasted or typed. Shows loading state during extraction
 * and calls onExtractedData callback when metadata is successfully extracted.
 */
const SmartLinkInput: React.FC<SmartLinkInputProps> = ({
  id,
  name = 'url',
  value,
  onChange,
  onExtractedData,
  onExtractionError,
  placeholder = 'Enter or paste a URL...',
  required = false,
  disabled = false,
  className,
  debounceDelay = 1000
}) => {
  
  // Use the debounced extraction hook
  const { data, loading, error, reset } = useContentExtractionWithDebounce(value, {
    enabled: !disabled && value.length > 0,
    debounceDelay,
    onSuccess: (extractedData) => {
      onExtractedData?.(extractedData);
    },
    onError: (err) => {
      onExtractionError?.(err);
    }
  });

  // Reset extraction data when URL is cleared
  useEffect(() => {
    if (!value || value.trim() === '') {
      reset();
    }
  }, [value, reset]);

  return (
    <div className="relative">
      <FormInput
        id={id}
        name={name}
        type="url"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled || loading}
        className={className}
        aria-busy={loading}
        aria-invalid={!!error && !loading}
        aria-describedby={error && !loading ? `${id}-error` : undefined}
      />
      
      {/* Loading indicator */}
      {loading && (
        <div 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center"
          role="status"
          aria-live="polite"
        >
          <Loading size="small" className="mr-2" />
          <span className="text-sm text-gray-500" aria-label="Extracting metadata">
            Extracting...
          </span>
        </div>
      )}
      
      {/* Success indicator */}
      {data && !loading && (
        <div 
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          role="status"
          aria-live="polite"
          aria-label="Metadata extracted successfully"
        >
          <svg 
            className="h-5 w-5 text-green-500" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      )}
      
      {/* Error message */}
      {error && !loading && (
        <p 
          className="text-red-600 text-xs mt-1"
          role="alert"
          aria-live="assertive"
          id={`${id}-error`}
        >
          {error.message}
        </p>
      )}
    </div>
  );
};

export default SmartLinkInput;