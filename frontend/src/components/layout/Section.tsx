import React, { ReactNode } from 'react';

/**
 * Section – lightweight page block wrapper.
 * Provides consistent vertical rhythm and max width.
 */
interface SectionProps {
  children: ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ children, className = '' }) => (
  <section className={`mb-10 max-w-3xl mx-auto ${className}`}>{children}</section>
);

export default Section;