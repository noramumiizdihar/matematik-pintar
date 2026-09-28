import React, { useEffect } from 'react';
import { NumberItem } from '../../data/numberBoardData';
import { Language } from '../../types/curriculum';
import { voiceService } from '../../services/voice';
import { soundFx } from '../../services/soundEffects';

interface NumberDetailModalProps {
  item: NumberItem | null;
  language: Language;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const NumberDetailModal: React.FC<NumberDetailModalProps> = ({
  item,
  language,
  onClose,
  onPrev,
  onNext
}) => {
  useEffect(() => {
    if (!item) return;

    // Automatically speak in the currently active app language when modal opens
    if (language === 'bm') {
      voiceService.speak(`${item.number}`, 'bm');
    } else {
      voiceService.speak(item.english, 'en');
    }
  }, [item?.number, language]);

  if (!item) return null;

  const tens = Math.floor(item.number / 10);
  const ones = item.number % 10;

  const handleSpeakEnglish = () => {
    soundFx.playClick();
    voiceService.speak(item.english, 'en');
  };

  const handleSpeakMalay = () => {
    soundFx.playClick();
    voiceService.speak(`${item.number}`, 'bm');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-white via-amber-50/60 to-pink-50/70 rounded-3xl p-6 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-sm flex items-center justify-center transition-colors shadow-sm"
          title="Tutup / Close"
        >
          ✕
        </button>

        {/* Mascot / Floating Sparkle Top */}
        <div className="flex items-center gap-1.5 mb-1 text-2xl animate-bounce-gentle">
          <span>✨</span>
          <span>🐰</span>
          <span>✨</span>
        </div>

        {/* Huge Central Number */}
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-300 to-pink-300 text-indigo-950 font-black text-6xl flex items-center justify-center shadow-lg border-4 border-white my-2 select-none">
          {item.number}
        </div>

        {/* English Pronunciation Banner */}
        <div className="w-full mt-3 flex flex-col items-center">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            ENGLISH
          </span>
          <span className="text-xl sm:text-2xl font-black text-indigo-900 tracking-wide mt-0.5">
            {item.english}
          </span>
        </div>

        {/* Malay Pronunciation Banner */}
        <div className="w-full mt-2 flex flex-col items-center">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            BAHASA MELAYU
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-700 tracking-wide mt-0.5">
            {item.malay}
          </span>
        </div>

        {/* Place Value Concept Ribbon */}
        <div className="mt-3.5 px-3 py-1.5 rounded-2xl bg-amber-100/90 text-amber-950 border border-amber-200 text-xs font-black flex items-center gap-1.5 shadow-inner">
          {item.number === 100 ? (
            <span>💯 1 Ratus = 100 (One Hundred)</span>
          ) : item.number >= 10 ? (
            <span>
              💡 {tens} {language === 'bm' ? 'Puluh' : 'Tens'} + {ones} {language === 'bm' ? 'Sa' : 'Ones'}
            </span>
          ) : (
            <span>💡 {item.number} {language === 'bm' ? 'Sa' : 'Ones'}</span>
          )}
        </div>

        {/* Pronunciation Audio Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 w-full mt-5">
          <button
            type="button"
            onClick={handleSpeakEnglish}
            className="btn-fun bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <span>🔊</span>
            <span>ENGLISH</span>
          </button>

          <button
            type="button"
            onClick={handleSpeakMalay}
            className="btn-fun bg-rose-500 hover:bg-rose-400 text-white font-black py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <span>🔊</span>
            <span>MELAYU</span>
          </button>
        </div>

        {/* Bottom Navigation: Prev / Next buttons */}
        <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onPrev}
            disabled={!onPrev || item.number <= 0}
            className="btn-fun px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 text-xs font-black flex items-center gap-1"
          >
            <span>◀</span>
            <span>{language === 'bm' ? 'Sebelum' : 'Prev'}</span>
          </button>

          <span className="text-[11px] font-bold text-slate-400">
            {item.number} / 100
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={!onNext || item.number >= 100}
            className="btn-fun px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 text-xs font-black flex items-center gap-1"
          >
            <span>{language === 'bm' ? 'Seterusnya' : 'Next'}</span>
            <span>▶</span>
          </button>
        </div>
      </div>
    </div>
  );
};
