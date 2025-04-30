import React from 'react';
import Card from '@/components/common/Card';

const PersonalNote: React.FC = () => {
  return (
    <Card variant="default" className="mb-5">
      <p className="text-base text-stone-700 italic leading-tight">
        I've always found solace in books. This collection represents my journey through different
        worlds, ideas, and perspectives. Each book has left its mark on me in some way. I hope you
        find something here that piques your interest too!
      </p>
    </Card>
  );
};

export default PersonalNote; 