import React from 'react';
import { Button } from '../common';
import type { ButtonProps } from '../common/Button';

interface FilterButtonProps extends Omit<ButtonProps, 'variant' | 'children'> {
  label: string;
  active: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, active, className = '', ...props }) => {
  return (
    <Button variant={active ? 'primary' : 'secondary'} className={className} {...props}>
      {label}
    </Button>
  );
};

export default FilterButton;
