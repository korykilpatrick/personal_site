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
  /** Flat cloth tone — single solid, no gradient. */
  cloth: string;
  /** Darker selvedge (hem) color along the ribbon edges. */
  selvedge: string;
}

// Muted silk-ribbon palette — aged brick, moss, faded indigo.
// Pigments chosen from Everyman's Library / Fitzcarraldo bookcloth register:
// dense enough to read against the pale sky (page background), quiet enough
// not to compete with the books.
const RIBBONS: RibbonTheme[] = [
  {
    key: 'sort',
    label: 'Sort',
    cloth: '#8a3e44',
    selvedge: '#54242a',
  },
  {
    key: 'shelves',
    label: 'Shelves',
    cloth: '#5d6d3e',
    selvedge: '#3a4627',
  },
  {
    key: 'search',
    label: 'Search',
    cloth: '#3f5876',
    selvedge: '#263b53',
  },
];

const TAB_WIDTH = 64;
const TAB_HEIGHT = 34;
const V_CUT = 11;

// A cloth-ribbon surface: flat color + near-invisible horizontal weave.
// No satin sheen, no diagonal highlight — silk ribbon, not plastic ribbon.
const ribbonCloth = (cloth: string) => `
  repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(0,0,0,0.045) 1px, rgba(0,0,0,0.045) 2px),
  ${cloth}
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
      // Ribbons hang from the top edge of the shelf: most of the tab sits
      // ABOVE the frame on the pale sky, with the V-notched tail dipping into
      // the dark navy. This gives them a clean silhouette and a clear anchor.
      className="pointer-events-none absolute -top-[20px] left-0 right-0 z-30 flex items-start justify-center gap-7"
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
                'relative z-10 flex cursor-pointer items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]',
                isActive ? 'translate-y-[3px]' : 'hover:translate-y-[2px]',
              ].join(' ')}
              style={{
                width: TAB_WIDTH,
                height: TAB_HEIGHT,
                background: ribbonCloth(ribbon.cloth),
                clipPath: tabClip,
                filter: `drop-shadow(0 ${isActive ? 3 : 1.5}px ${isActive ? 4 : 2.5}px rgba(0,0,0,0.4))`,
              }}
            >
              {/* Selvedge — a darker hemmed edge along the ribbon outline, like a real silk bookmark */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: `inset 0 0 0 1px ${ribbon.selvedge}`,
                  clipPath: tabClip,
                }}
              />
              {/* Label — stamped ink on silk */}
              <span
                className="relative z-10 -mt-[3px] font-mono uppercase"
                style={{
                  fontSize: '0.58rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(250,244,232,0.96)',
                }}
              >
                {ribbon.label}
              </span>
              {/* Filter active dot */}
              {hasIndicator && !isActive && (
                <div
                  className="absolute right-[7px] top-[5px] h-[4px] w-[4px] rounded-full"
                  style={{ background: 'rgba(250,244,232,0.9)' }}
                />
              )}
            </button>

            {/* === Pulled Ribbon + Panel === */}
            {isActive && (
              <div className="relative -mt-[1px] flex flex-col items-center">
                {/* Connector strip — continuation of ribbon with selvedge */}
                <div
                  className="relative"
                  style={{
                    width: TAB_WIDTH,
                    height: 10,
                    background: ribbonCloth(ribbon.cloth),
                    boxShadow: `inset 1px 0 0 ${ribbon.selvedge}, inset -1px 0 0 ${ribbon.selvedge}`,
                  }}
                />

                {/* Tag panel — library-card feel: flat cream, ruled rows, quiet shadow */}
                <div className="animate-in fade-in-0 slide-in-from-top-2 relative overflow-visible duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]">
                  {/* Ribbon header — the "tag" stamped on the ribbon's end */}
                  <div
                    className="relative overflow-hidden px-5 py-2.5 text-center"
                    style={{
                      background: ribbonCloth(ribbon.cloth),
                      boxShadow: `inset 1px 0 0 ${ribbon.selvedge}, inset -1px 0 0 ${ribbon.selvedge}, inset 0 1px 0 ${ribbon.selvedge}`,
                    }}
                  >
                    <span
                      className="relative font-mono uppercase"
                      style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.3em',
                        color: 'rgba(250,244,232,0.98)',
                      }}
                    >
                      {ribbon.label}
                    </span>
                  </div>

                  {/* Library-card body */}
                  <div
                    className="border-x p-3"
                    style={{
                      borderColor: 'rgba(120,98,64,0.18)',
                      background: '#f4ecd8',
                      boxShadow: '0 10px 22px rgba(8,15,27,0.14), 0 2px 6px rgba(8,15,27,0.06)',
                    }}
                  >
                    {activeRibbon === 'sort' && (
                      <ul className="w-52">
                        {sortOptions.map((option, idx) => {
                          const selected = selectedSortBy === option.value;
                          return (
                            <li
                              key={option.value}
                              style={{
                                borderTop:
                                  idx === 0 ? 'none' : '1px solid rgba(120,98,64,0.14)',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  onSortChange(option.value);
                                  setActiveRibbon(null);
                                }}
                                className="group flex w-full items-center justify-between px-2 py-[0.45rem] text-left font-mono uppercase transition-colors"
                                style={{
                                  fontSize: '0.55rem',
                                  letterSpacing: '0.16em',
                                  color: selected ? '#3a3226' : '#6d6046',
                                }}
                              >
                                <span>{option.label}</span>
                                {selected && (
                                  <span
                                    aria-hidden="true"
                                    style={{
                                      fontSize: '0.55rem',
                                      color: ribbon.selvedge,
                                    }}
                                  >
                                    ◆
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {activeRibbon === 'shelves' && (
                      <div className="w-56">
                        <ul className="max-h-56 overflow-y-auto pr-1">
                          {allBookshelves.map((shelf, idx) => {
                            const selected = selectedShelfSet.has(shelf.id);
                            return (
                              <li
                                key={shelf.id}
                                style={{
                                  borderTop:
                                    idx === 0 ? 'none' : '1px solid rgba(120,98,64,0.14)',
                                }}
                              >
                                <label
                                  className="flex cursor-pointer items-center gap-2.5 px-2 py-[0.42rem]"
                                  style={{
                                    color: selected ? '#3a3226' : '#6d6046',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => onToggleShelf(shelf.id)}
                                    className="h-3 w-3"
                                    style={{
                                      accentColor: ribbon.selvedge,
                                    }}
                                  />
                                  <span
                                    className="font-mono uppercase"
                                    style={{
                                      fontSize: '0.53rem',
                                      letterSpacing: '0.14em',
                                    }}
                                  >
                                    {shelf.name}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                        {hasAnyFilters && (
                          <div
                            className="mt-2 pt-2"
                            style={{ borderTop: '1px solid rgba(120,98,64,0.2)' }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleReset();
                                setActiveRibbon(null);
                              }}
                              className="w-full px-2 py-[0.4rem] font-mono uppercase transition-colors"
                              style={{
                                fontSize: '0.52rem',
                                letterSpacing: '0.16em',
                                color: '#8a7858',
                              }}
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {activeRibbon === 'search' && (
                      <div
                        className="w-60"
                        style={{ ['--search-underline' as string]: ribbon.selvedge }}
                      >
                        <SearchInput
                          value={searchQuery}
                          onChange={onSearchChange}
                          placeholder="title or author..."
                          debounceMs={300}
                          className="w-full"
                          inputClassName="border-0 border-b-2 rounded-none bg-transparent py-[0.4rem] pl-7 text-[0.85rem] text-[#3a3226] placeholder:text-[#a89776] shadow-none focus:ring-0 focus:outline-none [border-bottom-color:var(--search-underline)]"
                          iconClassName="text-[#a89776]"
                          clearButtonClassName="text-[#a89776] hover:text-[#3a3226]"
                        />
                      </div>
                    )}
                  </div>

                  {/* V-cut bottom — continuation of the card, tapered */}
                  <div
                    className="relative"
                    style={{
                      height: 12,
                      background: '#f4ecd8',
                      clipPath: 'polygon(0 0, 100% 0, 100% 2px, 50% 100%, 0 2px)',
                      filter: 'drop-shadow(0 4px 6px rgba(8,15,27,0.08))',
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
