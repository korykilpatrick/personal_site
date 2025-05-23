import React from 'react';
import Card from '@/components/common/Card';

const PersonalNote: React.FC = () => {
  return (
    <Card variant="default" className="mb-5 border-l-4 border-l-secondary">
      <p className="text-base text-textSecondary italic leading-tight">
       Books have been my guides, mentors, and friends. No matter what I'm going through, someone else has faced it before and found just the right words. They've opened doors, connected me deeply with souls both living and dead, and been an endless source of wisdom, comfort, and joy. Each one adds a thread to the tapestry of my journey.
      </p>
    </Card>
  );
};

export default PersonalNote; 