import React, { useState } from 'react';
import { NumberItem, MILESTONE_NUMBERS } from '../../data/numberBoardData';

interface CuteNumberCardProps {
  item: NumberItem;
  isExplored: boolean;
  onSelect: (item: NumberItem) => void;
}

const PASTEL_THEMES = [
  {
    bg: 'bg-gradient-to-b from-rose-100/95 via-pink-50 to-rose-50/90',
    border: 'border-rose-200/90',
    numberColor: 'text-rose-600',
    enColor: 'text-rose-950',
    msColor: 'text-rose-700/80',
    decor: 'text-rose-400',
    shadow: 'shadow-rose-100/70',
    badgeBg: 'bg-rose-200/70 text-rose-800'
  },
  {
    bg: 'bg-gradient-to-b from-amber-100/95 via-orange-50 to-amber-50/90',
    border: 'border-amber-200/90',
    numberColor: 'text-amber-700',
    enColor: 'text-amber-950',
    msColor: 'text-amber-700/80',
    decor: 'text-amber-400',
    shadow: 'shadow-amber-100/70',
    badgeBg: 'bg-amber-200/70 text-amber-800'
  },
  {
    bg: 'bg-gradient-to-b from-yellow-100/95 via-amber-50 to-yellow-50/90',
    border: 'border-yellow-200/90',
    numberColor: 'text-yellow-700',
    enColor: 'text-yellow-950',
    msColor: 'text-yellow-800/80',
    decor: 'text-yellow-500',
    shadow: 'shadow-yellow-100/70',
    badgeBg: 'bg-yellow-200/70 text-yellow-900'
  },
  {
    bg: 'bg-gradient-to-b from-emerald-100/95 via-teal-50 to-emerald-50/90',
    border: 'border-emerald-200/90',
    numberColor: 'text-emerald-700',
    enColor: 'text-emerald-950',
    msColor: 'text-emerald-700/80',
    decor: 'text-emerald-400',
    shadow: 'shadow-emerald-100/70',
    badgeBg: 'bg-emerald-200/70 text-emerald-800'
  },
  {
    bg: 'bg-gradient-to-b from-sky-100/95 via-blue-50 to-sky-50/90',
    border: 'border-sky-200/90',
    numberColor: 'text-sky-700',
    enColor: 'text-sky-950',
    msColor: 'text-sky-700/80',
    decor: 'text-sky-400',
    shadow: 'shadow-sky-100/70',
    badgeBg: 'bg-sky-200/70 text-sky-800'
  },
  {
    bg: 'bg-gradient-to-b from-purple-100/95 via-indigo-50 to-purple-50/90',
    border: 'border-purple-200/90',
    numberColor: 'text-purple-700',
    enColor: 'text-purple-950',
    msColor: 'text-purple-700/80',
    decor: 'text-purple-400',
    shadow: 'shadow-purple-100/70',
    badgeBg: 'bg-purple-200/70 text-purple-800'
  },
  {
    bg: 'bg-gradient-to-b from-pink-100/95 via-fuchsia-50 to-pink-50/90',
    border: 'border-pink-200/90',
    numberColor: 'text-pink-600',
    enColor: 'text-pink-950',
    msColor: 'text-pink-700/80',
    decor: 'text-pink-400',
    shadow: 'shadow-pink-100/70',
    badgeBg: 'bg-pink-200/70 text-pink-800'
  }
];

// Subtle decorative icons variations
const DECOR_PATTERNS = ['✦', '⭐', '☁️', '💖', '✨', '🌸', '•'];

export const CuteNumberCard: React.FC<CuteNumberCardProps> = ({
  item,
  isExplored,
  onSelect
}) => {
  const [isBouncing, setIsBouncing] = useState(false);

  const isMilestone = MILESTONE_NUMBERS.has(item.number);
  const theme = PASTEL_THEMES[item.number % PASTEL_THEMES.length];
  const decorIcon = DECOR_PATTERNS[item.number % DECOR_PATTERNS.length];

  const handleClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 400);
    onSelect(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Number ${item.number}, ${item.english}, ${item.malay}`}
      className={`group relative w-full aspect-[4/5] min-h-[92px] sm:min-h-[108px] rounded-3xl p-2 sm:p-2.5 border-2 flex flex-col items-center justify-between select-none shadow-md transition-all duration-200 active:scale-95 ${
        theme.bg
      } ${theme.border} ${theme.shadow} ${
        isMilestone
          ? 'ring-2 ring-amber-300/80 shadow-amber-200/60 shadow-lg scale-[1.02]'
          : 'hover:-translate-y-0.5 hover:shadow-lg'
      } ${isBouncing ? 'scale-105 animate-bounce-gentle' : ''}`}
    >
      {/* Top row: Explored badge & cute subtle decoration */}
      <div className="w-full flex items-center justify-between px-0.5 leading-none">
        {/* Explored star badge */}
        <span
          className={`text-[10px] sm:text-xs transition-opacity duration-300 ${
            isExplored ? 'opacity-100 animate-bounce-gentle' : 'opacity-0'
          }`}
          title="Diteroka / Explored"
        >
          ⭐
        </span>

        {/* Milestone badge or tiny subtle decorative sparkle */}
        {isMilestone ? (
          <span className="bg-amber-300 text-amber-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse-subtle">
            ✨ {item.number === 100 ? '100!' : 'TOP'}
          </span>
        ) : (
          <span className={`text-[10px] ${theme.decor} font-extrabold opacity-75`}>
            {decorIcon}
          </span>
        )}
      </div>

      {/* Main Number - Big, clear, playful */}
      <div className="flex flex-col items-center justify-center my-auto">
        <span
          className={`font-black text-2xl sm:text-3xl md:text-4xl tracking-tight drop-shadow-sm transition-transform group-hover:scale-105 ${theme.numberColor}`}
        >
          {item.number}
        </span>
      </div>

      {/* Words section: English -> Malay */}
      <div className="w-full flex flex-col items-center text-center gap-0.5 mt-auto pb-0.5">
        <span
          className={`font-black text-[9.5px] sm:text-[11px] uppercase tracking-wide leading-tight truncate w-full px-0.5 ${theme.enColor}`}
        >
          {item.english}
        </span>
        <span
          className={`font-bold text-[8.5px] sm:text-[9.5px] uppercase leading-tight truncate w-full px-0.5 ${theme.msColor}`}
        >
          {item.malay}
        </span>
      </div>

      {/* Subtle bottom corner sparkle for visual charm */}
      <div className="absolute bottom-1 right-2 pointer-events-none opacity-40 text-[9px]">
        {item.number % 3 === 0 ? '✨' : item.number % 3 === 1 ? '☁️' : '•'}
      </div>
    </button>
  );
};
