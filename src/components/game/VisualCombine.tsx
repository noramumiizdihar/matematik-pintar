import React from 'react';
import { Question, Language } from '../../types/curriculum';
import { soundFx } from '../../services/soundEffects';

interface VisualCombineProps {
  question: Question;
  language: Language;
  onAnswer: (val: number | string) => void;
  disabled?: boolean;
}

export const VisualCombine: React.FC<VisualCombineProps> = ({
  question,
  language,
  onAnswer,
  disabled
}) => {
  const { groupA, groupB, items, operation } = question.visualData || {};

  return (
    <div className="flex flex-col items-center w-full max-w-md px-2 py-4">
      {/* Operation Display Box */}
      <div className="bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-amber-200 w-full mb-6">
        {operation === '+' && groupA && groupB && (
          <div className="flex items-center justify-around gap-2">
            {/* Group A */}
            <div className="flex flex-col items-center bg-amber-50 rounded-2xl p-3 border-2 border-amber-200 min-w-[100px]">
              <div className="flex flex-wrap justify-center gap-1 text-3xl max-w-[100px]">
                {groupA.map((it, idx) => (
                  <span key={idx} className="animate-bounce-gentle">{it.emoji}</span>
                ))}
              </div>
              <span className="font-black text-amber-700 text-xl mt-2">{groupA.length}</span>
            </div>

            {/* Plus Icon */}
            <div className="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center font-black text-2xl shadow">
              +
            </div>

            {/* Group B */}
            <div className="flex flex-col items-center bg-amber-50 rounded-2xl p-3 border-2 border-amber-200 min-w-[100px]">
              <div className="flex flex-wrap justify-center gap-1 text-3xl max-w-[100px]">
                {groupB.map((it, idx) => (
                  <span key={idx} className="animate-bounce-gentle">{it.emoji}</span>
                ))}
              </div>
              <span className="font-black text-amber-700 text-xl mt-2">{groupB.length}</span>
            </div>
          </div>
        )}

        {operation === '-' && items && (
          <div className="flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-3 text-3xl p-4 bg-rose-50 rounded-2xl border-2 border-rose-200 w-full">
              {items.map((it, idx) => {
                const isEaten = idx >= Number(question.answer);
                return (
                  <div key={idx} className="relative">
                    <span className={`text-4xl transition-all ${isEaten ? 'opacity-30 grayscale scale-90' : 'animate-bounce-gentle'}`}>
                      {it.emoji}
                    </span>
                    {isEaten && (
                      <span className="absolute inset-0 flex items-center justify-center text-rose-600 font-black text-2xl">
                        ✕
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-sm font-bold text-slate-600">
              {language === 'bm'
                ? `Mula dengan ${items.length} 🥕, ditolak ${items.length - Number(question.answer)}`
                : `Started with ${items.length} 🥕, minus ${items.length - Number(question.answer)}`}
            </div>
          </div>
        )}
      </div>

      {/* Answer selection tiles */}
      <div className="w-full">
        <p className="text-center font-extrabold text-slate-700 mb-3 text-lg">
          {language === 'bm' ? 'Pilih jawapan yang betul:' : 'Choose the correct answer:'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {question.options?.map((opt, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                soundFx.playClick();
                onAnswer(opt);
              }}
              className="btn-fun bg-white text-amber-700 hover:bg-amber-50 active:bg-amber-100 border-2 border-amber-300 font-black text-3xl py-4 rounded-2xl flex items-center justify-center shadow-lg transition-transform"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
