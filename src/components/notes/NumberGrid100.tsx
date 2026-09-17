import React, { useState } from 'react';
import { Language } from '../../types/curriculum';
import { numberToWords } from '../../utils/numberWords';
import { soundFx } from '../../services/soundEffects';
import { voiceService } from '../../services/voice';

interface NumberGrid100Props {
  language: Language;
  initialSelected?: number;
}

export const NumberGrid100: React.FC<NumberGrid100Props> = ({
  language,
  initialSelected = 1
}) => {
  const [selectedNumber, setSelectedNumber] = useState<number>(initialSelected);
  const [rangeFilter, setRangeFilter] = useState<'0-10' | '1-20' | 'tens' | 'all'>('0-10');

  const handleSelect = (n: number) => {
    setSelectedNumber(n);
    soundFx.playPop(1.0 + (n % 10) * 0.05);

    const word = numberToWords(n, language);
    voiceService.speak(`${n}. ${word}`, language);
  };

  const tens = Math.floor(selectedNumber / 10);
  const ones = selectedNumber % 10;
  const word = numberToWords(selectedNumber, language);

  // Filter numbers to display
  let displayNumbers: number[] = [];
  if (rangeFilter === '0-10') {
    displayNumbers = Array.from({ length: 11 }, (_, i) => i); // 0 to 10
  } else if (rangeFilter === '1-20') {
    displayNumbers = Array.from({ length: 21 }, (_, i) => i); // 0 to 20
  } else if (rangeFilter === 'tens') {
    displayNumbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  } else {
    displayNumbers = Array.from({ length: 101 }, (_, i) => i); // 0 to 100
  }

  return (
    <div className="w-full bg-indigo-900/40 border-2 border-indigo-300/40 rounded-3xl p-4 md:p-5 flex flex-col items-center select-none shadow-lg">
      {/* Header & Filter Tabs */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce-gentle">💯</span>
          <div>
            <h3 className="font-black text-white text-base md:text-lg leading-tight">
              {language === 'bm' ? 'Carta Nombor 0 – 100 Interaktif' : 'Interactive 0 – 100 Chart'}
            </h3>
            <p className="text-indigo-200 text-xs font-bold">
              {language === 'bm' ? 'Ketik mana-mana nombor untuk dengar sebutan' : 'Tap any number to hear pronunciation'}
            </p>
          </div>
        </div>

        {/* Range Selector Pill Buttons */}
        <div className="flex items-center gap-1 bg-indigo-950/80 p-1 rounded-2xl text-[11px] font-black">
          {[
            { id: '0-10', label: '0 – 10' },
            { id: '1-20', label: '0 – 20' },
            { id: 'tens', label: '10, 20... 100' },
            { id: 'all', label: 'Semua 0–100' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundFx.playClick();
                setRangeFilter(tab.id as any);
              }}
              className={`px-2.5 py-1.5 rounded-xl transition-all ${
                rangeFilter === tab.id
                  ? 'bg-amber-400 text-indigo-950 shadow-md font-black'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Number Spotlight Card */}
      <div className="w-full bg-white rounded-3xl p-4 shadow-xl border-3 border-amber-300 mb-4 flex items-center justify-between animate-pop">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-indigo-950 font-black text-3xl flex items-center justify-center shadow-md">
            {selectedNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-xl font-black text-slate-800">
                {word}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  voiceService.speak(`${selectedNumber}. ${word}`, language);
                }}
                className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs hover:bg-indigo-200"
                title="Dengar Sebutan"
              >
                🔊
              </button>
            </div>

            {/* Place Value Breakdown */}
            <div className="flex items-center gap-2 mt-1 text-xs font-bold text-slate-500">
              {selectedNumber === 100 ? (
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
                  1 Ratus (100)
                </span>
              ) : selectedNumber >= 10 ? (
                <>
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-black">
                    {tens} {language === 'bm' ? 'Puluh' : 'Tens'} ({tens * 10})
                  </span>
                  <span>+</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black">
                    {ones} {language === 'bm' ? 'Sa' : 'Ones'} ({ones})
                  </span>
                </>
              ) : (
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black">
                  {selectedNumber} {language === 'bm' ? 'Sa' : 'Ones'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Visual object dots for numbers <= 10 */}
        {selectedNumber <= 10 && (
          <div className="hidden sm:flex flex-wrap gap-1 max-w-[120px] justify-end text-xl">
            {Array.from({ length: selectedNumber }).map((_, i) => (
              <span key={i} className="animate-bounce-gentle">🍎</span>
            ))}
          </div>
        )}
      </div>

      {/* Number Buttons Grid */}
      <div
        className={`w-full grid gap-1.5 max-h-[280px] overflow-y-auto p-1.5 bg-indigo-950/50 rounded-2xl border border-indigo-800/60 ${
          rangeFilter === '0-10'
            ? 'grid-cols-4 sm:grid-cols-6'
            : rangeFilter === 'tens'
            ? 'grid-cols-3 sm:grid-cols-4'
            : 'grid-cols-5 sm:grid-cols-10'
        }`}
      >
        {displayNumbers.map((n) => {
          const isSelected = selectedNumber === n;
          const isMultipleOfTen = n > 0 && n % 10 === 0;

          return (
            <button
              key={n}
              type="button"
              onClick={() => handleSelect(n)}
              className={`btn-fun h-11 rounded-xl font-black text-sm md:text-base flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-amber-400 text-indigo-950 ring-3 ring-white shadow-lg scale-105 z-10'
                  : isMultipleOfTen
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                  : 'bg-white/90 hover:bg-white text-slate-800'
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
};
