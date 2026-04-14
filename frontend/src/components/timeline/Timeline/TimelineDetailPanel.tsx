import React from 'react';
import type { MutableRefObject } from 'react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import type { TimelineItem } from '@/types/timeline';
import { TYPE_LABELS } from './timeline.constants';
import TimelineMedia from './TimelineMedia';
import { getAccentStyles } from './timelineTheme';

interface TimelineDetailPanelProps {
  activeItem: TimelineItem | null;
  detailRef: MutableRefObject<HTMLDivElement | null>;
}

const TimelineDetailPanel: React.FC<TimelineDetailPanelProps> = ({
  activeItem,
  detailRef,
}) => (
  <div
    id="timeline-detail-panel"
    ref={detailRef}
    className={`timeline-detail-panel mt-2 ${activeItem ? 'timeline-detail-panel--open' : ''}`}
    aria-live="polite"
  >
    <div className="timeline-detail-panel__inner">
      {activeItem && (
        <div
          key={activeItem.id}
          className="timeline-detail-content px-2 pb-1 pt-4 md:px-6"
        >
          <div className="site-card-soft rounded-[20px] px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
              <div className="min-w-0 flex-1">
                <div className="mb-4 flex flex-wrap items-center gap-2.5">
                  <span
                    className="inline-flex rounded-full border px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em]"
                    style={{
                      color: getAccentStyles(activeItem.accent).text,
                      borderColor: getAccentStyles(activeItem.accent).border,
                      background: getAccentStyles(activeItem.accent).surface,
                    }}
                  >
                    {TYPE_LABELS[activeItem.type]}
                  </span>
                </div>

                <h3 className="mb-2 text-[1.2rem] font-semibold leading-[1.2] text-primary sm:text-[1.35rem]">
                  {activeItem.label}
                </h3>

                {activeItem.narrative && (
                  <div className="text-[0.94rem] leading-[1.72] text-textSecondary">
                    <MarkdownRenderer>{activeItem.narrative}</MarkdownRenderer>
                  </div>
                )}

                {activeItem.links && activeItem.links.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeItem.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="site-link-chip"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {activeItem.media && activeItem.media.length > 0 && (
                <div className="flex flex-shrink-0 flex-col gap-3 sm:w-[240px]">
                  {activeItem.media.map((media, index) => (
                    <TimelineMedia key={`${media.url}-${index}`} media={media} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default TimelineDetailPanel;
