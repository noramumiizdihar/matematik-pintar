import React, { useState } from 'react';
import { Question, Language } from '../../types/curriculum';
import { soundFx } from '../../services/soundEffects';

interface NumberLineJumpProps {
  question: Question;
  language: Language;
  onAnswer: (val: number) => void;
  disabled?: boolean;
}

export const NumberLineJump: React.FC<NumberLineJumpProps> = ({
  question,
  language,
  onAnswer,
  disabled
}) => {
  const { numberLine } = question.visualData || {};
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  if (!numberLine) return null;

  const points: number[] = [];
  for (let i = numberLine.min; i <= numberLine.max; i += (numberLine.step || 1)) {
    points.push(i);
  }

  const handleSelect = (val: number) => {
    if (disabled) return;
    setSelectedPoint(val);
    soundFx.playPop(1.1);
    onAnswer(val);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md px-2 py-4">
      {/* Number Line Visual Card */}
      <div className="bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-emerald-200 w-full mb-6">
        {/* Hop banner */}
        <div className="flex items-center justify-center gap-2 mb-4 bg-emerald-50 text-emerald-800 font-extrabold px-4 py-2 rounded-full border border-emerald-200 text-sm">
          <span>🐸 {language === 'bm' ? 'Lompat:' : 'Jump:'}</span>
          <span className="text-emerald-600 text-base font-black">
            {numberLine.jump > 0 ? `+${numberLine.jump}` : `${numberLine.jump}`}
          </span>
        </div>

        {/* Scrollable Number Line */}
        <div className="relative py-10 px-2 overflow-x-auto">
          {/* Main Axis Line */}
          <div className="absolute top-1/2 left-4 right-4 h-2 bg-emerald-300 rounded-full -translate-y-1/2" />

          {/* Points */}
          <div className="flex justify-between items-center relative z-10 min-w-[280px]">
            {points.map((pt) => {
              const isStart = pt === numberLine.start;
              const isSelected = selectedPoint === pt;

              return (
                <div key={pt} className="flex flex-col items-center">
                  {/* Frog icon above start point */}
                  {isStart && (
                    <div className="absolute -top-7 text-2xl animate-bounce-gentle">
                      🐸
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelect(pt)}
                    className={`w-10 h-10 rounded-full font-black text-sm flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-300 scale-125'
                        : isStart
                        ? 'bg-amber-400 text-amber-900 ring-2 ring-amber-300 font-black'
                        : 'bg-white text-slate-700 hover:bg-emerald-50 border-2 border-slate-300'
                    }`}
                  >
                    {pt}
                  </button>
                  <span className="text-xs text-slate-500 font-bold mt-1">|</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Answer options */}
      <div className="w-full">
        <p className="text-center font-extrabold text-slate-700 mb-3 text-lg">
          {language === 'bm' ? 'Pilih nombor tempat katak mendarat:' : 'Pick where the frog lands:'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {question.options?.map((opt, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                soundFx.playClick();
                onAnswer(Number(opt));
              }}
              className="btn-fun bg-white text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 border-2 border-emerald-300 font-black text-3xl py-4 rounded-2xl flex items-center justify-center shadow-lg transition-transform"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
