import React from 'react';
import { Language } from '../types/curriculum';
import { CuteNumberBoard } from '../components/board/CuteNumberBoard';
import { soundFx } from '../services/soundEffects';

interface CuteNumberBoardViewProps {
  language: Language;
  onBack: () => void;
}

export const CuteNumberBoardView: React.FC<CuteNumberBoardViewProps> = ({
  language,
  onBack
}) => {
  return (
    <div className="flex flex-col items-center w-full px-3 sm:px-4 py-4 max-w-lg mx-auto pb-20">
      {/* Top Navigation Bar with Back Button */}
      <div className="w-full flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="btn-fun bg-white/90 hover:bg-white text-indigo-950 font-black px-3.5 py-2 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <span>←</span>
          <span>{language === 'bm' ? 'Kembali' : 'Back'}</span>
        </button>

        <span className="text-xs font-black text-amber-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-400/40 shadow-sm">
          💯 0 – 100
        </span>
      </div>

      {/* Main Cute Number Board */}
      <CuteNumberBoard language={language} />
    </div>
  );
};
