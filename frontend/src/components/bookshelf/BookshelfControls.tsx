import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bookshelf, SortOption } from 'types/index';
import SearchInput from '@/components/common/SearchInput';
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

type ControlType = 'sort' | 'shelves' | 'search';

const DEFAULT_SORT = 'date_read';

interface RibbonTheme {
  key: ControlType;
  label: string;
  gradient: string;
  accent: string;
  sheenColor: string;
  edgeDark: string;
}

const RIBBONS: RibbonTheme[] = [
  {
    key: 'sort',
    label: 'Sort',
    gradient: 'linear-gradient(180deg, #c0606e 0%, #a84858 40%, #8e3848 70%, #783040 100%)',
    accent: '#a84858',
    sheenColor: 'rgba(255,200,210,0.18)',
    edgeDark: '#6a2838',
  },
  {
    key: 'shelves',
    label: 'Shelves',
    gradient: 'linear-gradient(180deg, #6e9872 0%, #5e8862 40%, #4e7652 70%, #3e6444 100%)',
    accent: '#5e8862',
    sheenColor: 'rgba(200,255,210,0.14)',
    edgeDark: '#345a3a',
  },
  {
    key: 'search',
    label: 'Search',
    gradient: 'linear-gradient(180deg, #7a9ebe 0%, #6a8eae 40%, #5a7e9e 70%, #4a6e8e 100%)',
    accent: '#6a8eae',
    sheenColor: 'rgba(200,220,255,0.16)',
    edgeDark: '#40607a',
  },
];

const TAB_WIDTH = 62;
const TAB_HEIGHT = 32;
const V_CUT = 9;

const ribbonSatin = (gradient: string, sheenColor: string) => `
  linear-gradient(115deg, transparent 28%, ${sheenColor} 46%, transparent 64%),
  repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(255,255,255,0.04) 1px, rgba(255,255,255,0.04) 2px),
  ${gradient}
`;

const tabClip = `polygon(0 0, 100% 0, 100% calc(100% - ${V_CUT}px), 50% 100%, 0 calc(100% - ${V_CUT}px))`;

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
  const [activeRibbon, setActiveRibbon] = useState<ControlType | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const selectedShelfSet = useMemo(() => new Set(selectedShelfIds), [selectedShelfIds]);
  const hasSearchQuery = Boolean(searchQuery.trim());
  const hasAnyFilters =
    selectedShelfIds.length > 0 || selectedSortBy !== DEFAULT_SORT || hasSearchQuery;

  useEffect(() => {
    if (!activeRibbon) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (!controlsRef.current?.contains(e.target as Node)) {
        setActiveRibbon(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveRibbon(null);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeRibbon]);

  useEffect(() => {
    if (activeRibbon !== 'search') return;
    const frame = requestAnimationFrame(() => {
      controlsRef.current?.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [activeRibbon]);

  const handleReset = () => {
    onClearShelves();
    if (selectedSortBy !== DEFAULT_SORT) onSortChange(DEFAULT_SORT);
    if (hasSearchQuery) onSearchChange('');
  };

  const toggleRibbon = (key: ControlType) => {
    setActiveRibbon((c) => (c === key ? null : key));
  };

  return (
    <div
      ref={controlsRef}
      className="pointer-events-none absolute -top-[22px] left-0 right-0 z-30 flex items-start justify-center gap-5"
    >
      {RIBBONS.map((ribbon) => {
        const isActive = activeRibbon === ribbon.key;
        const hasIndicator =
          (ribbon.key === 'sort' && selectedSortBy !== DEFAULT_SORT) ||
          (ribbon.key === 'shelves' && selectedShelfIds.length > 0) ||
          (ribbon.key === 'search' && hasSearchQuery);

        return (
          <div key={ribbon.key} className="pointer-events-auto relative flex flex-col items-center">
            {/* === Ribbon Tab === */}
            <button
              type="button"
              aria-label={`${ribbon.label} controls`}
              onClick={() => toggleRibbon(ribbon.key)}
              className={[
                'relative z-10 flex cursor-pointer items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)]',
                isActive
                  ? 'translate-y-[3px] scale-[1.06] brightness-[1.12]'
                  : 'hover:translate-y-[3px] hover:brightness-105',
              ].join(' ')}
              style={{
                width: TAB_WIDTH,
                height: TAB_HEIGHT,
                background: ribbonSatin(ribbon.gradient, ribbon.sheenColor),
                clipPath: tabClip,
                filter: `drop-shadow(0 ${isActive ? 4 : 2}px ${isActive ? 8 : 5}px rgba(0,0,0,${isActive ? 0.35 : 0.22}))`,
              }}
            >
              {/* Stitched edges */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[4px] inset-y-[3px]"
                style={{
                  border: '1px dashed rgba(255,255,255,0.18)',
                  clipPath: tabClip,
                }}
              />
              {/* Label */}
              <span className="relative z-10 -mt-[3px] font-mono text-[0.44rem] font-medium uppercase tracking-[0.18em] text-white/80">
                {ribbon.label}
              </span>
              {/* Filter active dot */}
              {hasIndicator && !isActive && (
                <div className="absolute right-[10px] top-[6px] h-[5px] w-[5px] rounded-full bg-white/60 shadow-[0_0_4px_rgba(255,255,255,0.3)]" />
              )}
            </button>

            {/* === Pulled Ribbon + Panel === */}
            {isActive && (
              <div className="relative -mt-[1px] flex flex-col items-center">
                {/* Connector strip */}
                <div
                  style={{
                    width: TAB_WIDTH,
                    height: 12,
                    background: ribbonSatin(ribbon.gradient, ribbon.sheenColor),
                  }}
                />

                {/* Fold crease where ribbon bends over frame edge */}
                <div
                  aria-hidden="true"
                  className="absolute top-[8px]"
                  style={{
                    width: TAB_WIDTH + 4,
                    left: -2,
                    height: '3px',
                    background: `linear-gradient(90deg, transparent 5%, rgba(0,0,0,0.18) 30%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.18) 70%, transparent 95%)`,
                    borderRadius: '50%',
                  }}
                />

                {/* Tag panel */}
                <div className="animate-in fade-in-0 slide-in-from-top-3 relative overflow-visible duration-350 ease-[cubic-bezier(0.19,1,0.22,1)]">
                  {/* Ribbon header */}
                  <div
                    className="relative overflow-hidden rounded-t-[4px] px-4 py-2.5 text-center"
                    style={{ background: ribbonSatin(ribbon.gradient, ribbon.sheenColor) }}
                  >
                    {/* Stitched edges on header */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-[4px] inset-y-[3px] border border-dashed border-white/[0.18]"
                    />
                    <span className="relative font-mono text-[0.54rem] font-medium uppercase tracking-[0.24em] text-white/90">
                      {ribbon.label}
                    </span>
                  </div>

                  {/* Cream body */}
                  <div className="border-x border-[rgba(180,160,120,0.15)] bg-[linear-gradient(180deg,rgba(253,249,240,0.99),rgba(244,235,216,0.99))] p-3 shadow-[0_18px_40px_rgba(8,15,27,0.22),0_6px_14px_rgba(8,15,27,0.1)]">
                    {activeRibbon === 'sort' && (
                      <div className="w-52 space-y-1">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              onSortChange(option.value);
                              setActiveRibbon(null);
                            }}
                            className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left font-mono text-[0.56rem] uppercase tracking-[0.15em] transition ${
                              selectedSortBy === option.value
                                ? 'bg-[rgba(77,104,145,0.12)] text-[#30496d]'
                                : 'text-[#5f7286] hover:bg-[rgba(77,104,145,0.07)] hover:text-[#223248]'
                            }`}
                          >
                            <span>{option.label}</span>
                            {selectedSortBy === option.value && (
                              <Icon name="chevron-right" size="sm" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {activeRibbon === 'shelves' && (
                      <div className="w-56">
                        <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                          {allBookshelves.map((shelf) => (
                            <label
                              key={shelf.id}
                              className={`flex cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2 transition ${
                                selectedShelfSet.has(shelf.id)
                                  ? 'bg-[rgba(77,104,145,0.12)] text-[#30496d]'
                                  : 'text-[#5f7286] hover:bg-[rgba(77,104,145,0.07)] hover:text-[#223248]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedShelfSet.has(shelf.id)}
                                onChange={() => onToggleShelf(shelf.id)}
                                className="h-3.5 w-3.5 rounded border-[#b6c4d8] bg-transparent text-secondary focus:ring-secondary/16"
                              />
                              <span className="font-mono text-[0.54rem] uppercase tracking-[0.14em]">
                                {shelf.name}
                              </span>
                            </label>
                          ))}
                        </div>
                        {hasAnyFilters && (
                          <div className="mt-2 border-t border-[rgba(77,104,145,0.1)] pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleReset();
                                setActiveRibbon(null);
                              }}
                              className="w-full rounded-[10px] border border-[rgba(77,104,145,0.12)] bg-white/[0.48] px-3 py-2 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-[#5f7286] transition hover:border-secondary/18 hover:text-[#223248]"
                            >
                              Reset Filters
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {activeRibbon === 'search' && (
                      <div className="w-60">
                        <SearchInput
                          value={searchQuery}
                          onChange={onSearchChange}
                          placeholder="Search title or author..."
                          debounceMs={300}
                          className="w-full"
                          inputClassName="rounded-[10px] border-[rgba(77,104,145,0.12)] bg-white/[0.52] py-[0.42rem] pl-8 text-[0.84rem] text-[#223248] shadow-none placeholder:text-[#7a8ca2] focus:ring-secondary/16"
                          iconClassName="text-[#7a8ca2]"
                          clearButtonClassName="text-[#7a8ca2] hover:text-[#223248]"
                        />
                      </div>
                    )}
                  </div>

                  {/* V-cut bottom */}
                  <div
                    className="relative"
                    style={{
                      height: 14,
                      background: 'linear-gradient(180deg, rgba(244,235,216,0.99), rgba(236,226,204,0.99))',
                      clipPath: 'polygon(0 0, 100% 0, 100% 3px, 50% 100%, 0 3px)',
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Book count - subtle, to the right */}
      <div className="absolute right-6 top-[6px] font-mono text-[0.42rem] uppercase tracking-[0.14em] text-slate-300/35">
        {bookCount}
      </div>
    </div>
  );
};

export default BookshelfControls;
