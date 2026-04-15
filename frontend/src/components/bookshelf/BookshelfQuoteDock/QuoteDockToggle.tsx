import React from 'react';
import Icon from '@/components/common/Icon';

interface QuoteDockToggleProps {
  onShowDock: () => void;
}

const QuoteDockToggle: React.FC<QuoteDockToggleProps> = ({ onShowDock }) => (
  <button
    type="button"
    onClick={onShowDock}
    aria-label="Show quote dock"
    className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-[14px] border border-primary/12 bg-[rgba(247,250,255,0.52)] px-4 py-2 text-[0.72rem] font-mono font-medium uppercase tracking-[0.1em] text-textSecondary shadow-[0_10px_24px_rgba(12,23,39,0.08)] backdrop-blur-[6px] backdrop-saturate-135 transition-all duration-[820ms] ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-0.5 hover:border-secondary/30 hover:bg-[rgba(247,250,255,0.68)] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
    style={{ bottom: 'calc(env(safe-area-inset-bottom) + 0.875rem)' }}
  >
    <Icon name="quote-left" className="h-3 w-3" />
    <span>Quotes</span>
  </button>
);

export default QuoteDockToggle;
