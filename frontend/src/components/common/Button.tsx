import React, { ButtonHTMLAttributes } from 'react';

// Variants:
//   primary — navy cloth-binding fill, oxblood-accent on hover
//   outline — cream field with walnut hairline, oxblood on hover
//   text    — unstyled; walnut text, oxblood on hover
// The former `secondary` variant (cool-blue filled) was removed in the
// warm-palette cleanup — it duplicated `outline` semantically once the
// cool-blue token was dropped, and having two "second-tier" button
// styles only created drift. All old `secondary` consumers now use
// `outline`.
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'text';
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
    'inline-flex items-center justify-center font-mono font-medium uppercase tracking-[0.1em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

  const variantClasses = {
    primary:
      'border border-primary/16 bg-[linear-gradient(180deg,rgba(21,38,63,0.98),rgba(12,23,39,0.98))] text-cream-light shadow-[0_14px_30px_rgba(13,24,39,0.18)] hover:-translate-y-0.5 hover:border-oxblood/40 hover:text-oxblood-light',
    outline:
      'border border-[rgba(74,52,35,0.16)] bg-[rgba(250,245,234,0.78)] text-primary shadow-[inset_0_1px_0_rgba(255,253,244,0.72)] hover:-translate-y-0.5 hover:border-oxblood/40 hover:bg-[rgba(250,245,234,0.96)] hover:text-oxblood',
    text: 'bg-transparent text-textSecondary hover:text-oxblood',
  };

  const sizeClasses = {
    sm: 'rounded-[12px] px-3 py-1.5 text-[0.64rem]',
    md: 'rounded-[14px] px-4 py-2.5 text-[0.68rem]',
    lg: 'rounded-[16px] px-5 py-3 text-[0.72rem]',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
