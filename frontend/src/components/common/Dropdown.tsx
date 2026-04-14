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
  const toggleDropdown = () => setIsOpen((open) => !open);
  const triggerElement = React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
        'aria-haspopup': 'true',
        'aria-expanded': isOpen,
        onClick: toggleDropdown,
      })
    : (
      <button type="button" onClick={toggleDropdown}>
        {trigger}
      </button>
    );

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {triggerElement}

      {isOpen && (
        <div
          className={`absolute z-10 mt-2 ${width} ${positionClasses} overflow-hidden rounded-[18px] border border-primary/10 bg-white/[0.96] shadow-[0_18px_40px_rgba(9,18,31,0.12)] backdrop-blur-[10px]`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
