import React from 'react';
import { Question, Language } from '../../types/curriculum';
import { soundFx } from '../../services/soundEffects';

interface ComparisonPairProps {
  question: Question;
  language: Language;
  onAnswer: (val: string) => void;
  disabled?: boolean;
}

export const ComparisonPair: React.FC<ComparisonPairProps> = ({
  question,
  language,
  onAnswer,
  disabled
}) => {
  const { comparisonPair, groupA, groupB } = question.visualData || {};

  if (!comparisonPair) return null;

  const handleSelect = (val: string) => {
    if (disabled) return;
    soundFx.playPop(1.1);
    onAnswer(val);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md px-2 py-4">
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Left card */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSelect(comparisonPair.left.value as string)}
          className="btn-fun bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-amber-200 hover:border-amber-400 active:scale-95 flex flex-col items-center justify-center min-h-[180px] transition-all"
        >
          {groupA ? (
            <div className="flex flex-wrap justify-center gap-1 text-3xl mb-3">
              {groupA.map((it, idx) => (
                <span key={idx}>{it.emoji}</span>
              ))}
            </div>
          ) : (
            <span className="text-6xl mb-3 animate-bounce-gentle">{comparisonPair.left.emoji}</span>
          )}
          <span className="font-black text-slate-800 text-lg text-center">
            {comparisonPair.left.label[language]}
          </span>
        </button>

        {/* Right card */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSelect(comparisonPair.right.value as string)}
          className="btn-fun bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-amber-200 hover:border-amber-400 active:scale-95 flex flex-col items-center justify-center min-h-[180px] transition-all"
        >
          {groupB ? (
            <div className="flex flex-wrap justify-center gap-1 text-3xl mb-3">
              {groupB.map((it, idx) => (
                <span key={idx}>{it.emoji}</span>
              ))}
            </div>
          ) : (
            <span className="text-6xl mb-3 animate-bounce-gentle">{comparisonPair.right.emoji}</span>
          )}
          <span className="font-black text-slate-800 text-lg text-center">
            {comparisonPair.right.label[language]}
          </span>
        </button>
      </div>
    </div>
  );
};
