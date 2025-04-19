import React from 'react';
import MarkdownToJsx from 'markdown-to-jsx';
import { WorkEntry, WorkEntryLink } from 'types/index'; // Correct import path
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon'; // Import the Icon component

interface WorkCardProps {
  work: WorkEntry;
}

const WorkCard: React.FC<WorkCardProps> = ({ work }) => {
  // Defensive check
  if (!work) {
    return null;
  }

  return (
    <Card variant="outline" padding="md" className="work-card">
      <div className="flex flex-col gap-3">
        {/* Header Section */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-grow">
            <h3 className="text-md font-semibold text-textPrimary">{work.role}</h3>
            <p className="text-sm text-textSecondary">{work.company}</p>
          </div>
          <span className="text-xs text-textTertiary flex-shrink-0 pt-1">{work.duration}</span>
        </div>

        {/* Achievements Section */}
        {work.achievements && (
          <div className="prose prose-sm max-w-none text-textSecondary">
            <MarkdownToJsx>{work.achievements}</MarkdownToJsx>
          </div>
        )}

        {/* Links Section */}
        {work.links && work.links.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 mt-1">
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