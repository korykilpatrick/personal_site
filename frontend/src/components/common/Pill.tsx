import React from 'react';
import Icon from './Icon';

// The former `secondary` Pill variant was unused (grep confirmed zero
// consumers) and was removed alongside the `secondary` Button variant
// in the warm-palette cleanup. Primary = navy cloth fill with cream-light
// text; success/warning/danger are semantic states, unchanged.
export interface PillProps {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

const Pill: React.FC<PillProps> = ({
  label,
  onRemove,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const baseClasses =
    'inline-flex items-center rounded-[12px] border font-mono uppercase tracking-[0.08em] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]';

  const variantClasses = {
    primary: 'border-primary/16 bg-primary/92 text-cream-light',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-[0.6rem]',
    md: 'px-3 py-1.5 text-[0.62rem]',
  };

  const cursorClass = onClick ? 'cursor-pointer' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${cursorClass} ${className}`.replace(/\s+/g, ' ').trim();

  return (
    <div className={classes} onClick={onClick}>
      <span className={onRemove ? 'mr-1' : ''}>{label}</span>

      {onRemove && (
        <button
          onClick={(e) => { 
            e.stopPropagation();
            if(onRemove) onRemove(); 
          }}
          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-white/74 transition hover:bg-white/10 hover:text-white focus:outline-none"
          aria-label={`Remove ${label}`}
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
};

export default Pill;
