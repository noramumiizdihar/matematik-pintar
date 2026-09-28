import React, { useState, useEffect } from 'react';
import { Question, Language } from '../../types/curriculum';
import { soundFx } from '../../services/soundEffects';
import { voiceService } from '../../services/voice';
import { numberToWords } from '../../utils/numberWords';

interface TapToCountProps {
  question: Question;
  language: Language;
  onAnswer: (selected: number) => void;
  disabled?: boolean;
}

export const TapToCount: React.FC<TapToCountProps> = ({
  question,
  language,
  onAnswer,
  disabled
}) => {
  const items = question.visualData?.items || [];
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);
  const targetCount = question.visualData?.targetCount || Number(question.answer);

  // Load the counting words ahead of time so the very first tap speaks instantly
  useEffect(() => {
    for (let n = 1; n <= items.length; n++) {
      voiceService.prefetch(numberToWords(n, language), language);
    }
  }, [question.id, language, items.length]);

  const handleTapItem = (index: number) => {
    if (disabled || tappedIndices.includes(index)) return;

    const nextCount = tappedIndices.length + 1;
    setTappedIndices(prev => [...prev, index]);

    // Play bubble pop with rising pitch
    const pitch = 0.8 + (nextCount * 0.12);
    soundFx.playPop(pitch);

    // Count aloud. Queued rather than interrupting, so tapping quickly still
    // gives whole words: "satu, dua, tiga" instead of "sa-, du-, ti-".
    voiceService.speakInSequence(numberToWords(nextCount, language), language);
  };

  const isAllTapped = tappedIndices.length === items.length;

  return (
    <div className="flex flex-col items-center w-full max-w-md px-2 py-4">
      {/* Visual item grid */}
      <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-indigo-100 w-full mb-6">
        <div className="flex flex-wrap justify-center items-center gap-4 min-h-[160px]">
          {items.map((item, idx) => {
            const tapOrder = tappedIndices.indexOf(idx);
            const isTapped = tapOrder !== -1;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTapItem(idx)}
                disabled={disabled || isTapped}
                aria-label={`Item ${idx + 1}`}
                className={`relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 active:scale-95 ${
                  isTapped
                    ? 'bg-amber-100 ring-4 ring-amber-400 scale-105 rotate-3'
                    : 'bg-indigo-50/80 hover:bg-indigo-100 ring-2 ring-indigo-200 animate-bounce-gentle cursor-pointer'
                }`}
              >
                <span>{item.emoji}</span>
                {isTapped && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white font-black text-sm w-7 h-7 rounded-full flex items-center justify-center shadow-md animate-pop">
                    {tapOrder + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic tap counter progress bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-600">
          <span>{language === 'bm' ? 'Telah dikira:' : 'Counted:'}</span>
          <span className="text-indigo-600 text-lg font-black">{tappedIndices.length} / {items.length}</span>
        </div>
      </div>

      {/* Answer selection tiles */}
      <div className="w-full">
        <p className="text-center font-extrabold text-slate-700 mb-3 text-lg">
          {language === 'bm' ? 'Berapakah jumlahnya? Pilih jawapan:' : 'How many are there? Pick answer:'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(question.options || [targetCount - 1, targetCount, targetCount + 1, targetCount + 2]).map((opt, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                soundFx.playClick();
                onAnswer(Number(opt));
              }}
              className="btn-fun bg-white text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 border-2 border-indigo-300 font-black text-3xl py-4 rounded-2xl flex items-center justify-center shadow-lg transition-transform"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
