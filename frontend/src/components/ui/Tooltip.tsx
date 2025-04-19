import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode | string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  delayDuration?: number;
  className?: string; // Allow passing custom classes to the Content
}

/**
 * Tooltip Component
 *
 * A reusable tooltip component built on Radix UI Tooltip primitives, styled with Tailwind CSS.
 * Provides accessible tooltips with customizable content and positioning.
 *
 * @param {React.ReactNode} children - The trigger element for the tooltip.
 * @param {React.ReactNode | string} content - The content to display inside the tooltip.
 * @param {'top' | 'right' | 'bottom' | 'left'} [side='top'] - Preferred side for the tooltip.
 * @param {number} [sideOffset=5] - Offset from the trigger element.
 * @param {number} [delayDuration=300] - Delay before the tooltip appears.
 * @param {string} [className] - Optional additional CSS classes for the tooltip content.
 */
const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  side = 'top',
  sideOffset = 5,
  delayDuration = 300,
  className = '',
}) => {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={sideOffset}
            className={`
              z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs
              text-gray-50 shadow-md animate-in fade-in-0 zoom-in-95
              data-[state=closed]:animate-out data-[state=closed]:fade-out-0
              data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2
              data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2
              data-[side=top]:slide-in-from-bottom-2
              ${className} // Apply additional custom classes
            `}
          >
            {content}
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip; 