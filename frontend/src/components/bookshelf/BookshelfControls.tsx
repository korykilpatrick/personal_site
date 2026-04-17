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

// Palette — the four-note library chord: paper / ink / wood / stamp.
// Paper is cream, ink is navy, wood is walnut, stamp is oxblood (used sparingly).
// The whole filter row is a typographic slip pinned to the page in these four tones.
const INK_NAVY = '#15263f';            // primary ink — anchors, body text
const INK_NAVY_SOFT = '#172331';
const WALNUT_MID = '#6b4f35';                     // body of walnut tones — inactive menu rows
const WALNUT_MUTED = 'rgba(74, 52, 35, 0.55)';    // muted walnut — × glyphs, meta text
const WALNUT_HAIRLINE = 'rgba(74, 52, 35, 0.18)'; // chip / popover borders, anchor underlines
const WALNUT_WHISPER = 'rgba(74, 52, 35, 0.08)';  // active-row tint
const WALNUT_BREATH = 'rgba(74, 52, 35, 0.04)';   // hover-row tint
const OXBLOOD = '#9e3a2a';                        // stamp accent — selection markers, hover bump
const OXBLOOD_SOFT = 'rgba(158, 58, 42, 0.45)';
const CREAM_PAPER = 'rgba(250, 245, 234, 0.94)';  // slip of paper over the page
const CREAM_CHIP = 'rgba(250, 245, 234, 0.7)';    // chip fill — warmer paper
const CREAM_CHIP_HOT = 'rgba(250, 245, 234, 0.95)';

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
      className="absolute z-40 backdrop-blur-[6px]"
      style={{
        top: 'calc(100% + 10px)',
        width,
        backgroundColor: CREAM_PAPER,
        color: INK_NAVY_SOFT,
        border: `1px solid ${WALNUT_HAIRLINE}`,
        borderRadius: 14,
        // Warm shadow (walnut-ink, not navy-ink) + inset cream highlight.
        // Reads as a slip of paper laid on the page.
        boxShadow:
          'inset 0 1px 0 rgba(255, 253, 244, 0.9), 0 18px 36px -18px rgba(74, 52, 35, 0.28), 0 2px 6px -2px rgba(74, 52, 35, 0.12)',
        ...alignStyle,
      }}
    >
      {children}
    </div>
  );
};

// ─── Text anchor — a clickable underlined value that opens a popover ───────
interface TextAnchorProps {
  value: string;
  ariaLabel: string;
  open: boolean;
  onToggle: () => void;
  popoverWidth?: number;
  renderPopover: (ctx: { close: () => void }) => React.ReactNode;
}

const TextAnchor: React.FC<TextAnchorProps> = ({
  value,
  ariaLabel,
  open,
  onToggle,
  popoverWidth = 240,
  renderPopover,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <span className="relative inline-flex items-center">
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
          borderBottom: `1px solid ${open ? INK_NAVY : WALNUT_HAIRLINE}`,
          paddingBottom: 2,
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.borderBottomColor = WALNUT_MUTED;
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.borderBottomColor = WALNUT_HAIRLINE;
        }}
      >
        {value}
      </button>
      <Popover open={open} onClose={onToggle} width={popoverWidth} anchorRef={ref}>
        {renderPopover({ close: onToggle })}
      </Popover>
    </span>
  );
};

// ─── Inline search — icon expands to input on the same row, no popover ─────
interface InlineSearchProps {
  searchQuery: string;
  searchDraft: string;
  setSearchDraft: (val: string) => void;
  onSearchChange: (val: string) => void;
}

const InlineSearch: React.FC<InlineSearchProps> = ({
  searchQuery,
  searchDraft,
  setSearchDraft,
  onSearchChange,
}) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchActive = searchQuery.trim().length > 0;
  const showInput = open || searchActive;

  const openSearch = () => {
    setOpen(true);
    // Focus the input once it renders
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const clearAndClose = () => {
    setSearchDraft('');
    onSearchChange('');
    setOpen(false);
  };

  return (
    <span className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={openSearch}
        aria-label={searchActive ? `Search: ${searchQuery}` : 'Search books'}
        className="inline-flex items-center justify-center transition focus:outline-none"
        style={{
          color: showInput ? INK_NAVY : WALNUT_MUTED,
          width: 24,
          height: 24,
          padding: 0,
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!showInput) e.currentTarget.style.color = INK_NAVY;
        }}
        onMouseLeave={(e) => {
          if (!showInput) e.currentTarget.style.color = WALNUT_MUTED;
        }}
      >
        <Icon name="search" size="md" />
      </button>
      {showInput && (
        <>
          <input
            ref={inputRef}
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onBlur={() => {
              if (!searchDraft.trim()) setOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') clearAndClose();
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            placeholder="title, author"
            className="bg-transparent font-mono uppercase outline-none placeholder:normal-case"
            style={{
              color: INK_NAVY,
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              fontWeight: 600,
              width: 160,
              borderBottom: `1px solid ${WALNUT_HAIRLINE}`,
              paddingBottom: 2,
            }}
          />
          {searchActive && (
            <button
              type="button"
              onClick={clearAndClose}
              aria-label="Clear search"
              className="transition"
              style={{
                color: WALNUT_MUTED,
                fontSize: '0.9rem',
                lineHeight: 1,
                background: 'transparent',
                padding: '0 2px',
                marginLeft: -4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = INK_NAVY)}
              onMouseLeave={(e) => (e.currentTarget.style.color = WALNUT_MUTED)}
            >
              ×
            </button>
          )}
        </>
      )}
    </span>
  );
};

// ─── Active-filter chip (for selected shelves) ─────────────────────────────
// A slip of cream paper with a walnut hairline, navy ink, and a walnut ×.
// On hover the border warms to oxblood and the × follows — a quiet stamp
// that says "this is removable" without shouting.
const FilterChip: React.FC<{ label: string; onRemove: () => void; title?: string }> = ({
  label,
  onRemove,
  title,
}) => {
  const xRef = useRef<HTMLSpanElement>(null);
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 font-mono font-medium uppercase transition"
      style={{
        color: INK_NAVY_SOFT,
        fontSize: '0.64rem',
        letterSpacing: '0.14em',
        backgroundColor: CREAM_CHIP,
        padding: '3px 10px',
        border: `1px solid ${WALNUT_HAIRLINE}`,
        borderRadius: 12,
        boxShadow: 'inset 0 1px 0 rgba(255, 253, 244, 0.75), 0 1px 2px rgba(74, 52, 35, 0.08)',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = CREAM_CHIP_HOT;
        e.currentTarget.style.borderColor = OXBLOOD_SOFT;
        if (xRef.current) xRef.current.style.color = OXBLOOD;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = CREAM_CHIP;
        e.currentTarget.style.borderColor = WALNUT_HAIRLINE;
        if (xRef.current) xRef.current.style.color = WALNUT_MUTED;
      }}
      title={title}
    >
      {label}
      <span
        ref={xRef}
        aria-hidden="true"
        style={{
          color: WALNUT_MUTED,
          fontSize: '0.78rem',
          lineHeight: 1,
          transition: 'color 200ms',
        }}
      >
        ×
      </span>
    </button>
  );
};

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
  const [openSegment, setOpenSegment] = useState<null | 'sort' | 'shelves'>(null);
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

  const shelvesLabel =
    selectedShelfIds.length === 0
      ? 'ALL'
      : selectedShelfIds.length === 1
      ? (allBookshelves.find((s) => s.id === selectedShelfIds[0])?.name ?? '1').toUpperCase()
      : `${selectedShelfIds.length} SELECTED`;

  const handleToggle = (which: 'sort' | 'shelves') =>
    setOpenSegment((cur) => (cur === which ? null : which));

  const selectedShelves = allBookshelves.filter((s) => selectedShelfIds.includes(s.id));

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {/* Sort — clickable value ("RECENT") */}
        <TextAnchor
          value={sortLabel}
          ariaLabel={`Sort by ${sortLabel.toLowerCase()}`}
          open={openSegment === 'sort'}
          onToggle={() => handleToggle('sort')}
          popoverWidth={220}
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
                      className="flex w-full items-center gap-2 px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition"
                      style={{
                        color: active ? INK_NAVY : WALNUT_MID,
                        backgroundColor: active ? WALNUT_WHISPER : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.backgroundColor = WALNUT_BREATH;
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{ width: '0.7rem', color: OXBLOOD, opacity: active ? 1 : 0 }}
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

        {/* Shelf — clickable value ("ALL" by default) */}
        <TextAnchor
          value={shelvesLabel}
          ariaLabel={
            selectedShelves.length > 0
              ? `Filter by shelf (${selectedShelves.length} selected)`
              : 'Filter by shelf'
          }
          open={openSegment === 'shelves'}
          onToggle={() => handleToggle('shelves')}
          popoverWidth={260}
          renderPopover={() => (
            <ul className="max-h-72 overflow-y-auto py-1.5" role="menu">
              {allBookshelves.map((shelf) => {
                  const selected = selectedShelfIds.includes(shelf.id);
                  return (
                    <li key={shelf.id}>
                      <button
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={selected}
                        onClick={() => onToggleShelf(shelf.id)}
                        className="flex w-full items-center gap-2 px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition"
                        style={{
                          color: selected ? INK_NAVY : WALNUT_MID,
                          backgroundColor: selected ? WALNUT_WHISPER : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!selected) e.currentTarget.style.backgroundColor = WALNUT_BREATH;
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span aria-hidden="true" style={{ width: '0.7rem', color: OXBLOOD }}>
                          {selected ? '◆' : ''}
                        </span>
                        {shelf.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
          )}
        />

        {/* Search — inline expand, no popover */}
        <InlineSearch
          searchQuery={searchQuery}
          searchDraft={searchDraft}
          setSearchDraft={setSearchDraft}
          onSearchChange={onSearchChange}
        />

        {/* Active-shelf chips — sit on the same horizontal plane */}
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
          color: WALNUT_MUTED,
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
