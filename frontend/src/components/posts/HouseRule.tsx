import React from 'react';

interface HouseRuleProps {
  className?: string;
}

const HouseRule: React.FC<HouseRuleProps> = ({ className = '' }) => (
  <div aria-hidden="true" className={`flex items-center gap-3 ${className}`}>
    <span className="h-px flex-1 bg-[rgba(74,52,35,0.22)]" />
    <span className="text-[0.65rem] leading-none text-oxblood/85">◆</span>
    <span className="h-px flex-1 bg-[rgba(74,52,35,0.22)]" />
  </div>
);

export default HouseRule;
