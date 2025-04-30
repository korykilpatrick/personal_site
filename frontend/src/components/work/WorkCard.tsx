import React from 'react';
import { WorkEntry, WorkEntryLink } from 'types/index';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

interface WorkCardProps {
  work: WorkEntry;
}

const WorkCard: React.FC<WorkCardProps> = ({ work }) => {
  if (!work) {
    return null;
  }

  return (
    <Card variant="outline" padding="md" className="work-card">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-grow">
            <p className="text-md font-semibold text-textPrimary mb-0">
              {work.role}
              {work.company && (
                <span className="text-sm text-textSecondary font-normal"> at {work.company}</span>
              )}
            </p>
          </div>
          <span className="text-xs text-textTertiary flex-shrink-0 pt-1">{work.duration}</span>
        </div>

        {work.achievements && (
          <div className="prose prose-sm max-w-none text-textSecondary pt-1">
            <MarkdownRenderer>{work.achievements}</MarkdownRenderer>
          </div>
        )}

        {work.links && work.links.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 mt-2">
            {work.links.map((link: WorkEntryLink, index: number) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-primary hover:underline"
                aria-label={`Link to ${link.title}`}
              >
                <Icon name="external-link" size="sm" className="mr-1" />
                {link.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default WorkCard; 