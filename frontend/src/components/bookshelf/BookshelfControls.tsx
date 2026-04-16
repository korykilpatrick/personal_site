import React, { useEffect, useRef, useState } from 'react';
import { Bookshelf, SortOption } from 'types/index';
import Icon from '@/components/common/Icon';

interface BookshelfControlsProps {
  sortOptions: SortOption[];
  selectedSortBy: string;
  onSortChange: (value: string) => void;
  allBookshelves: Bookshelf[];
  selectedShelfIds: number[];
  onToggleShelf: (id: number) => void;
  onClearShelves: () => void;
  bookCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

// Navy / ink / cream on pale sky — chromeless register
const INK_NAVY = '#15263f';
const INK_NAVY_DIM = 'rgba(21, 38, 63, 0.55)';
const INK_NAVY_QUIET = 'rgba(21, 38, 63, 0.35)';
const CREAM = '#f4ecd8';
const INK = '#2a1f14';
const INK_DIM = '#6d6046';
const INK_RULE = 'rgba(58, 42, 30, 0.18)';

// ─── Popover ────────────────────────────────────────────────────────────────
const Popover: React.FC<{
  open: boolean;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement>;
  align?: 'left' | 'center' | 'right';
}> = ({ open, onClose, width = 240, children, anchorRef, align = 'left' }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const panel = panelRef.current;
      const anchor = anchorRef.current;
      if (!panel || !anchor) return;
      const target = e.target as Node;
      if (!panel.contains(target) && !anchor.contains(target)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const alignStyle =
    align === 'center'
      ? { left: '50%', transform: 'translateX(-50%)' }
      : align === 'right'
      ? { right: 0 }
      : { left: 0 };

  return (
    <div
      ref={panelRef}
      className="absolute z-40"
      style={{
        top: 'calc(100% + 10px)',
        width,
        backgroundColor: CREAM,
        color: INK,
        border: `1px solid ${INK_RULE}`,
        borderRadius: 3,
        boxShadow: '0 16px 30px -16px rgba(8, 15, 28, 0.35)',
        ...alignStyle,
      }}
    >
      {children}
    </div>
  );
};

// ─── Sort anchor ("[sort-icon] Recent") ────────────────────────────────────
interface SortAnchorProps {
  value: string;
  ariaLabel: string;
  open: boolean;
  onToggle: () => void;
  renderPopover: (ctx: { close: () => void }) => React.ReactNode;
}

const SortAnchor: React.FC<SortAnchorProps> = ({
  value,
  ariaLabel,
  open,
  onToggle,
  renderPopover,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <span className="relative inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        style={{
          color: INK_NAVY_DIM,
          display: 'inline-flex',
          alignItems: 'center',
          width: 18,
          height: 18,
        }}
      >
        <Icon name="sort" size="md" />
      </span>
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center font-mono uppercase transition focus:outline-none"
        style={{
          color: INK_NAVY,
          fontSize: '0.7rem',
          letterSpacing: '0.14em',
          fontWeight: 600,
          borderBottom: `1px solid ${open ? INK_NAVY : INK_NAVY_QUIET}`,
          paddingBottom: 2,
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.borderBottomColor = INK_NAVY_DIM;
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.borderBottomColor = INK_NAVY_QUIET;
        }}
      >
        {value}
      </button>
      <Popover open={open} onClose={onToggle} width={220} anchorRef={ref}>
        {renderPopover({ close: onToggle })}
      </Popover>
    </span>
  );
};

// ─── Icon button (shelf, search) ───────────────────────────────────────────
interface IconButtonProps {
  icon: 'shelf' | 'search';
  ariaLabel: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  popoverWidth?: number;
  popoverAlign?: 'left' | 'center' | 'right';
  renderPopover: (ctx: { close: () => void }) => React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { icon, ariaLabel, active, open, onToggle, popoverWidth, popoverAlign, renderPopover },
    ref,
  ) => {
    const localRef = useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

    const color = active || open ? INK_NAVY : INK_NAVY_DIM;

    return (
      <span className="relative inline-flex items-center">
        <button
          ref={localRef}
          type="button"
          onClick={onToggle}
          aria-label={ariaLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex items-center justify-center transition focus:outline-none"
          style={{
            color,
            width: 24,
            height: 24,
            padding: 0,
            backgroundColor: 'transparent',
            borderBottom: `1px solid ${open ? INK_NAVY : 'transparent'}`,
            paddingBottom: 2,
            marginBottom: -3,
          }}
          onMouseEnter={(e) => {
            if (!open && !active) e.currentTarget.style.color = INK_NAVY;
          }}
          onMouseLeave={(e) => {
            if (!open && !active) e.currentTarget.style.color = INK_NAVY_DIM;
          }}
        >
          <Icon name={icon} size="md" />
        </button>
        <Popover
          open={open}
          onClose={onToggle}
          width={popoverWidth}
          anchorRef={localRef}
          align={popoverAlign}
        >
          {renderPopover({ close: onToggle })}
        </Popover>
      </span>
    );
  },
);
IconButton.displayName = 'IconButton';

// ─── Active-filter chip ─────────────────────────────────────────────────────
const FilterChip: React.FC<{ label: string; onRemove: () => void; title?: string }> = ({
  label,
  onRemove,
  title,
}) => (
  <button
    type="button"
    onClick={onRemove}
    className="inline-flex items-center gap-1.5 font-mono uppercase transition"
    style={{
      color: INK_NAVY,
      fontSize: '0.6rem',
      letterSpacing: '0.16em',
      backgroundColor: 'transparent',
      padding: '2px 8px',
      border: `1px solid ${INK_NAVY_QUIET}`,
      borderRadius: 2,
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(21, 38, 63, 0.05)';
      e.currentTarget.style.borderColor = INK_NAVY_DIM;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.borderColor = INK_NAVY_QUIET;
    }}
    title={title}
  >
    {label}
    <span aria-hidden="true" style={{ color: INK_NAVY_DIM, fontSize: '0.72rem', lineHeight: 1 }}>
      ×
    </span>
  </button>
);

// ─── Main component ─────────────────────────────────────────────────────────
const BookshelfControls: React.FC<BookshelfControlsProps> = ({
  sortOptions,
  selectedSortBy,
  onSortChange,
  allBookshelves,
  selectedShelfIds,
  onToggleShelf,
  onClearShelves,
  bookCount,
  searchQuery,
  onSearchChange,
}) => {
  const [openSegment, setOpenSegment] = useState<null | 'sort' | 'shelves' | 'search'>(null);
  const [searchDraft, setSearchDraft] = useState(searchQuery);

  useEffect(() => {
    setSearchDraft(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchDraft !== searchQuery) onSearchChange(searchDraft);
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const sortLabel =
    sortOptions.find((o) => o.value === selectedSortBy)?.label.toUpperCase() ?? '—';

  const handleToggle = (which: 'sort' | 'shelves' | 'search') =>
    setOpenSegment((cur) => (cur === which ? null : which));

  const searchActive = searchQuery.trim().length > 0;
  const selectedShelves = allBookshelves.filter((s) => selectedShelfIds.includes(s.id));

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* [sort-icon] · Recent */}
        <SortAnchor
          value={sortLabel}
          ariaLabel={`Sort by ${sortLabel.toLowerCase()}`}
          open={openSegment === 'sort'}
          onToggle={() => handleToggle('sort')}
          renderPopover={({ close }) => (
            <ul className="py-1.5" role="menu">
              {sortOptions.map((opt) => {
                const active = opt.value === selectedSortBy;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => {
                        onSortChange(opt.value);
                        close();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition"
                      style={{
                        color: active ? INK : INK_DIM,
                        backgroundColor: active ? 'rgba(58, 42, 30, 0.08)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!active)
                          e.currentTarget.style.backgroundColor = 'rgba(58, 42, 30, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{ width: '0.7rem', color: INK, opacity: active ? 1 : 0 }}
                      >
                        ◆
                      </span>
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        />

        {/* Shelf icon button */}
        <IconButton
          icon="shelf"
          ariaLabel={
            selectedShelves.length > 0
              ? `Filter by shelf (${selectedShelves.length} selected)`
              : 'Filter by shelf'
          }
          active={selectedShelves.length > 0}
          open={openSegment === 'shelves'}
          onToggle={() => handleToggle('shelves')}
          popoverWidth={260}
          renderPopover={() => (
            <div>
              <div
                className="flex items-center justify-between px-3 pt-2 pb-1 font-mono text-[0.6rem] uppercase tracking-[0.18em]"
                style={{ color: INK_DIM }}
              >
                <span>Select shelves</span>
                {selectedShelfIds.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearShelves}
                    className="transition"
                    style={{ color: INK_DIM }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = INK_DIM)}
                  >
                    Clear
                  </button>
                )}
              </div>
              <ul
                className="max-h-64 overflow-y-auto py-1"
                role="menu"
                style={{ borderTop: `1px solid ${INK_RULE}` }}
              >
                {allBookshelves.map((shelf) => {
                  const selected = selectedShelfIds.includes(shelf.id);
                  return (
                    <li key={shelf.id}>
                      <button
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={selected}
                        onClick={() => onToggleShelf(shelf.id)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition"
                        style={{
                          color: selected ? INK : INK_DIM,
                          backgroundColor: selected
                            ? 'rgba(58, 42, 30, 0.08)'
                            : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!selected)
                            e.currentTarget.style.backgroundColor = 'rgba(58, 42, 30, 0.04)';
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span aria-hidden="true" style={{ width: '0.7rem', color: INK }}>
                          {selected ? '◆' : ''}
                        </span>
                        {shelf.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        />

        {/* Search icon button */}
        <IconButton
          icon="search"
          ariaLabel={searchActive ? `Search: ${searchQuery}` : 'Search books'}
          active={searchActive}
          open={openSegment === 'search'}
          onToggle={() => handleToggle('search')}
          popoverWidth={300}
          renderPopover={({ close }) => (
            <div className="px-3 py-2">
              <label
                className="mb-1 block font-mono text-[0.6rem] uppercase tracking-[0.18em]"
                style={{ color: INK_DIM }}
              >
                Title or author
              </label>
              <input
                autoFocus
                type="text"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearchChange(searchDraft);
                    close();
                  }
                }}
                placeholder="e.g. Camus"
                className="w-full bg-transparent font-mono text-[0.82rem] outline-none"
                style={{
                  color: INK,
                  borderBottom: `1px solid ${INK_RULE}`,
                  paddingBottom: 4,
                }}
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSearchDraft('');
                    onSearchChange('');
                  }}
                  className="font-mono text-[0.6rem] uppercase tracking-[0.18em]"
                  style={{ color: INK_DIM }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="font-mono text-[0.6rem] uppercase tracking-[0.18em]"
                  style={{ color: INK }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        />

        {/* Inline active-filter chips — sit on the same horizontal plane */}
        {searchActive && (
          <FilterChip
            label={`"${searchQuery.trim()}"`}
            onRemove={() => onSearchChange('')}
            title="Clear search"
          />
        )}
        {selectedShelves.map((shelf) => (
          <FilterChip
            key={shelf.id}
            label={shelf.name}
            onRemove={() => onToggleShelf(shelf.id)}
            title="Remove shelf filter"
          />
        ))}
      </div>

      {/* Volume count — trailing colophon */}
      <div
        className="hidden font-mono uppercase sm:block"
        style={{
          color: INK_NAVY_DIM,
          fontSize: '0.58rem',
          letterSpacing: '0.24em',
          whiteSpace: 'nowrap',
          fontWeight: 500,
        }}
      >
        {bookCount} {bookCount === 1 ? 'vol' : 'vols'}
      </div>
    </div>
  );
};

export default BookshelfControls;
