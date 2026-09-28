import React, { useState, useEffect, useMemo } from 'react';
import { NUMBER_BOARD_DATA, NumberItem } from '../../data/numberBoardData';
import { Language } from '../../types/curriculum';
import { CuteNumberCard } from './CuteNumberCard';
import { NumberDetailModal } from './NumberDetailModal';
import { soundFx } from '../../services/soundEffects';

interface CuteNumberBoardProps {
  language: Language;
  initialSelected?: number;
}

type FilterRange =
  | 'all'
  | '0-10'
  | '11-20'
  | '21-30'
  | '31-40'
  | '41-50'
  | '51-60'
  | '61-70'
  | '71-80'
  | '81-90'
  | '91-100';

const FILTER_OPTIONS: { id: FilterRange; labelBm: string; labelEn: string; icon: string }[] = [
  { id: 'all', labelBm: 'Semua (0–100)', labelEn: 'All (0–100)', icon: '🌈' },
  { id: '0-10', labelBm: '0 – 10', labelEn: '0 – 10', icon: '🌱' },
  { id: '11-20', labelBm: '11 – 20', labelEn: '11 – 20', icon: '🌸' },
  { id: '21-30', labelBm: '21 – 30', labelEn: '21 – 30', icon: '⭐' },
  { id: '31-40', labelBm: '31 – 40', labelEn: '31 – 40', icon: '🌈' },
  { id: '41-50', labelBm: '41 – 50', labelEn: '41 – 50', icon: '☁️' },
  { id: '51-60', labelBm: '51 – 60', labelEn: '51 – 60', icon: '✨' },
  { id: '61-70', labelBm: '61 – 70', labelEn: '61 – 70', icon: '🌼' },
  { id: '71-80', labelBm: '71 – 80', labelEn: '71 – 80', icon: '🦋' },
  { id: '81-90', labelBm: '81 – 90', labelEn: '81 – 90', icon: '🌟' },
  { id: '91-100', labelBm: '91 – 100', labelEn: '91 – 100', icon: '🎈' }
];

const EXPLORED_STORAGE_KEY = 'mp_cute_board_explored';

export const CuteNumberBoard: React.FC<CuteNumberBoardProps> = ({
  language,
  initialSelected
}) => {
  const [selectedRange, setSelectedRange] = useState<FilterRange>('all');
  const [selectedItem, setSelectedItem] = useState<NumberItem | null>(() => {
    if (initialSelected !== undefined && initialSelected >= 0 && initialSelected <= 100) {
      return NUMBER_BOARD_DATA[initialSelected];
    }
    return null;
  });

  // Persistent explored numbers set
  const [exploredNumbers, setExploredNumbers] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(EXPLORED_STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Ignored
    }
    return new Set<number>();
  });

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (selectedRange === 'all') return NUMBER_BOARD_DATA;

    const [startStr, endStr] = selectedRange.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    return NUMBER_BOARD_DATA.filter((item) => item.number >= start && item.number <= end);
  }, [selectedRange]);

  const handleCardSelect = (item: NumberItem) => {
    soundFx.playPop(1.0 + (item.number % 10) * 0.05);

    // Mark as explored
    if (!exploredNumbers.has(item.number)) {
      setExploredNumbers((prev) => {
        const next = new Set(prev);
        next.add(item.number);
        try {
          localStorage.setItem(EXPLORED_STORAGE_KEY, JSON.stringify(Array.from(next)));
        } catch {
          // Ignored
        }
        return next;
      });
    }

    setSelectedItem(item);
  };

  const handlePrevItem = () => {
    if (!selectedItem || selectedItem.number <= 0) return;
    const prev = NUMBER_BOARD_DATA[selectedItem.number - 1];
    handleCardSelect(prev);
  };

  const handleNextItem = () => {
    if (!selectedItem || selectedItem.number >= 100) return;
    const next = NUMBER_BOARD_DATA[selectedItem.number + 1];
    handleCardSelect(next);
  };

  const exploredCount = exploredNumbers.size;
  const progressPercent = Math.round((exploredCount / 101) * 100);

  // Mascot dynamic reaction text
  const mascotQuote = useMemo(() => {
    if (exploredCount === 0) {
      return language === 'bm'
        ? 'Hai kawan! Ketik mana-mana kad nombor comel di bawah!'
        : 'Hello friend! Tap any cute number card below!';
    }
    if (exploredCount >= 101) {
      return language === 'bm'
        ? 'Tahniah! Semua 101 nombor telah berjaya diteroka! 🏆⭐'
        : 'Hooray! You explored all 101 numbers! 🏆⭐';
    }
    if (exploredCount >= 50) {
      return language === 'bm'
        ? `Hebat! ${exploredCount} nombor telah diteroka! Teruskan lagi! 🌟`
        : `Awesome! ${exploredCount} numbers explored! Keep going! 🌟`;
    }
    return language === 'bm'
      ? `Bagus! Dah teroka ${exploredCount} nombor. Jom cari lagi! 🐰`
      : `Great! ${exploredCount} numbers explored. Let's find more! 🐰`;
  }, [exploredCount, language]);

  return (
    <div className="w-full flex flex-col items-center select-none pb-8">
      {/* Board Mascot & Header Card */}
      <div className="w-full bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 rounded-3xl p-4 sm:p-5 border-3 border-white/80 shadow-xl mb-4 text-indigo-950 relative overflow-hidden">
        <div className="relative z-10 flex items-start gap-3 sm:gap-4">
          {/* Bunny Mascot Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/90 border-2 border-pink-300 flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0 animate-bounce-gentle">
            🐰
          </div>

          {/* Title & Speech Bubble */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🌈</span>
              <h2 className="text-lg sm:text-xl font-black text-indigo-950 tracking-tight leading-tight">
                {language === 'bm' ? 'Papan Nombor Comel 0 – 100' : 'Cute Number Board 0 – 100'}
              </h2>
            </div>

            {/* Bunny Speech Dialogue */}
            <p className="text-xs sm:text-sm font-extrabold text-pink-900 mt-1 leading-snug">
              {mascotQuote}
            </p>

            {/* Exploration Progress Pill */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 bg-white/60 h-2.5 rounded-full overflow-hidden border border-white/80 p-0.5">
                <div
                  className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] sm:text-xs font-black text-indigo-950 bg-white/80 px-2.5 py-0.5 rounded-full shadow-sm shrink-0">
                ✨ {exploredCount} / 101
              </span>
            </div>
          </div>
        </div>

        {/* Soft Background Accents */}
        <div className="absolute -right-4 -bottom-4 text-5xl opacity-15 pointer-events-none">⭐</div>
        <div className="absolute right-14 top-2 text-3xl opacity-20 pointer-events-none">☁️</div>
      </div>

      {/* Cute Filter Pill Tabs Bar */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto py-1 px-1 mb-4 no-scrollbar scroll-smooth">
        {FILTER_OPTIONS.map((opt) => {
          const isSelected = selectedRange === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSelectedRange(opt.id);
              }}
              className={`btn-fun whitespace-nowrap px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 ${
                isSelected
                  ? 'bg-amber-400 text-indigo-950 shadow-md ring-2 ring-white scale-105'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-sm'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{language === 'bm' ? opt.labelBm : opt.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Number Cards Grid - Generous, airy, cheerful */}
      <div className="w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3 p-1">
        {filteredData.map((item) => (
          <CuteNumberCard
            key={item.number}
            item={item}
            isExplored={exploredNumbers.has(item.number)}
            onSelect={handleCardSelect}
          />
        ))}
      </div>

      {/* Cute Peaceful Footer Decoration */}
      <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold opacity-60">
        <span>☁️</span>
        <span>✨</span>
        <span>🌸</span>
        <span>{language === 'bm' ? 'Terokai nombor mengikut rentak anda' : 'Explore numbers at your own pace'}</span>
        <span>🌸</span>
        <span>✨</span>
        <span>☁️</span>
      </div>

      {/* Detail Popup Modal */}
      <NumberDetailModal
        item={selectedItem}
        language={language}
        onClose={() => setSelectedItem(null)}
        onPrev={handlePrevItem}
        onNext={handleNextItem}
      />
    </div>
  );
};
