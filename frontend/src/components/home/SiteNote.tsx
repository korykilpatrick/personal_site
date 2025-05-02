import React from 'react';
import Card from '@/components/common/Card';

const note = `🔄 **May 2025:** Refactoring this site, automating my workflow
with AI agents, and rehabbing Winnie’s knee between coffee runs.`;

const SiteNote: React.FC = () => (
  <Card padding="lg">
    <h2 className="text-xl font-semibold mb-3">Quick&nbsp;Note</h2>
    <div
      className="prose prose-base max-w-none text-textSecondary"
      dangerouslySetInnerHTML={{ __html: note.replace(/\n/g, '<br/>') }}
    />
  </Card>
);

export default SiteNote;