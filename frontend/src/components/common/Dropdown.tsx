import React, { useState, useRef, useEffect, ReactNode } from 'react';

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  width?: string;
  align?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  className = '',
  width = 'w-56',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const positionClasses = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {React.isValidElement(trigger)
          ? React.cloneElement(trigger as React.ReactElement<any>, {
              'aria-haspopup': 'true',
              'aria-expanded': isOpen,
            })
          : trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-10 mt-1 ${width} ${positionClasses} bg-white border border-gray-300 rounded-md shadow-lg`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
