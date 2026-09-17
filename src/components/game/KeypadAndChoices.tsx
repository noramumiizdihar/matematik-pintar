import React, { useState } from 'react';
import { Question, Language } from '../../types/curriculum';
import { soundFx } from '../../services/soundEffects';
import { t } from '../../i18n/translations';

interface KeypadAndChoicesProps {
  question: Question;
  language: Language;
  onAnswer: (val: number | string) => void;
  disabled?: boolean;
}

export const KeypadAndChoices: React.FC<KeypadAndChoicesProps> = ({
  question,
  language,
  onAnswer,
  disabled
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleKeyPress = (digit: string) => {
    if (disabled) return;
    soundFx.playClick();
    if (inputValue.length < 8) {
      setInputValue(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (disabled) return;
    soundFx.playClick();
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (disabled || !inputValue) return;
    soundFx.playClick();
    onAnswer(Number(inputValue));
  };

  // Pattern Complete Type
  if (question.type === 'pattern_complete' && question.visualData?.patternSequence) {
    return (
      <div className="flex flex-col items-center w-full max-w-md px-2 py-4">
        {/* Pattern Sequence Ribbon */}
        <div className="bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-purple-200 w-full mb-6">
          <div className="flex items-center justify-center gap-3 py-4 flex-wrap">
            {question.visualData.patternSequence.map((item, idx) => (
              <div
                key={idx}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black shadow-sm ${
                  item === '?'
                    ? 'bg-purple-100 border-2 border-dashed border-purple-400 text-purple-600 animate-pulse-subtle'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="w-full">
          <p className="text-center font-extrabold text-slate-700 mb-3 text-lg">
            {language === 'bm' ? 'Pilih corak yang sesuai:' : 'Pick the matching pattern:'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {question.options?.map((opt, i) => (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => {
                  soundFx.playClick();
                  onAnswer(opt);
                }}
                className="btn-fun bg-white text-3xl py-4 rounded-2xl border-2 border-purple-300 shadow-md flex items-center justify-center active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Numeric Keypad Type
  if (question.type === 'numeric_keypad') {
    return (
      <div className="flex flex-col items-center w-full max-w-sm px-2 py-2">
        {/* Numerical Display Box */}
        <div className="w-full bg-white rounded-2xl p-4 border-3 border-indigo-200 shadow-inner mb-4 flex items-center justify-between min-h-[64px]">
          <span className="text-xs font-bold text-slate-400 uppercase">
            {language === 'bm' ? 'Jawapan Anda:' : 'Your Answer:'}
          </span>
          <span className="text-3xl font-black text-indigo-700 tracking-wider">
            {inputValue || <span className="text-slate-300">_</span>}
          </span>
        </div>

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              disabled={disabled}
              onClick={() => handleKeyPress(num)}
              className="btn-fun bg-white hover:bg-indigo-50 active:bg-indigo-100 border-2 border-indigo-100 text-slate-800 font-black text-2xl py-3.5 rounded-2xl shadow flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={disabled || !inputValue}
            onClick={handleBackspace}
            className="btn-fun bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-600 font-black text-xl py-3.5 rounded-2xl shadow flex items-center justify-center"
            aria-label="Padam"
          >
            ⌫
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleKeyPress('0')}
            className="btn-fun bg-white hover:bg-indigo-50 border-2 border-indigo-100 text-slate-800 font-black text-2xl py-3.5 rounded-2xl shadow flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            disabled={disabled || !inputValue}
            onClick={handleSubmit}
            className="btn-fun bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black text-lg py-3.5 rounded-2xl shadow-lg flex items-center justify-center"
          >
            ✓
          </button>
        </div>
      </div>
    );
  }

  // Default Multiple Choice Type
  return (
    <div className="w-full max-w-md px-2 py-4">
      <div className="grid grid-cols-1 gap-3">
        {question.options?.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => {
              soundFx.playClick();
              onAnswer(opt);
            }}
            className="btn-fun w-full bg-white hover:bg-indigo-50 active:bg-indigo-100 border-3 border-indigo-200 hover:border-indigo-400 font-black text-xl md:text-2xl py-4 px-6 rounded-2xl flex items-center justify-between shadow-md transition-all text-slate-800"
          >
            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-black flex items-center justify-center mr-3 shrink-0">
              {['A', 'B', 'C', 'D'][i]}
            </span>
            <span className="flex-1 text-center font-extrabold">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
