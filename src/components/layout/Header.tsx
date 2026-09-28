import React from 'react';
import { Language, UserStats, UserSettings } from '../../types/curriculum';
import { soundFx } from '../../services/soundEffects';
import { voiceService } from '../../services/voice';

interface HeaderProps {
  language: Language;
  stats: UserStats;
  settings: UserSettings;
  onLanguageToggle: () => void;
  onToggleSound: () => void;
  onOpenParent: () => void;
  onGoHome: () => void;
  isHome?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  stats,
  settings,
  onLanguageToggle,
  onToggleSound,
  onOpenParent,
  onGoHome,
  isHome = false
}) => {
  return (
    <header className="w-full bg-indigo-600/95 backdrop-blur text-white px-2.5 sm:px-3 py-2.5 flex items-center justify-between gap-2 shadow-md sticky top-0 z-40 select-none">
      {/* Brand logo & home button — allowed to shrink so the badges and controls
          on the right are never clipped on a narrow phone */}
      <div
        onClick={() => {
          soundFx.playClick();
          onGoHome();
        }}
        className="flex items-center gap-2 min-w-0 cursor-pointer active:scale-95 transition-transform"
      >
        <div className="w-9 h-9 rounded-2xl bg-amber-400 flex items-center justify-center text-xl shadow-inner font-black text-indigo-950 shrink-0">
          📐
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-black text-sm sm:text-base md:text-lg leading-tight tracking-tight truncate">
            Matematik<span className="text-amber-300">Pintar</span>
          </span>
          <span className="text-[10px] text-indigo-200 font-bold hidden sm:inline">
            {language === 'bm' ? 'Dunia Matematik Ceria' : 'Joyful Math World'}
          </span>
        </div>
      </div>

      {/* Center badges: Streak & Stars */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Streak */}
        <div
          title={language === 'bm' ? 'Hari berturut-turut' : 'Day streak'}
          className="flex items-center gap-1 bg-indigo-700/80 px-2.5 py-1 rounded-full text-xs font-black text-amber-300 border border-indigo-500/50"
        >
          <span>🔥</span>
          <span>{stats.currentStreak}</span>
        </div>

        {/* Stars */}
        <div
          title={language === 'bm' ? 'Bintang terkumpul' : 'Stars earned'}
          className="flex items-center gap-1 bg-amber-400 px-2.5 py-1 rounded-full text-xs font-black text-indigo-950 shadow-sm animate-pulse-subtle"
        >
          <span>⭐</span>
          <span>{stats.stars}</span>
        </div>
      </div>

      {/* Right Controls: Sound FX, Language toggle, Parent Zone */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Sound toggle */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onToggleSound();
          }}
          title={settings.soundFxEnabled ? 'Mute sound' : 'Unmute sound'}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
            settings.soundFxEnabled ? 'bg-indigo-700 hover:bg-indigo-800 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {settings.soundFxEnabled ? '🔔' : '🔕'}
        </button>

        {/* Language switch button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onLanguageToggle();
          }}
          title="Tukar Bahasa / Switch Language"
          className="flex items-center gap-1 bg-indigo-700 hover:bg-indigo-800 active:scale-95 px-2 py-1 rounded-xl text-xs font-black border border-indigo-500 transition-transform"
        >
          <span>{language === 'bm' ? '🇲🇾 BM' : '🇬🇧 EN'}</span>
        </button>

        {/* Parent Zone Button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onOpenParent();
          }}
          title={language === 'bm' ? 'Zon Ibu Bapa' : 'Parent Zone'}
          className="bg-indigo-800 hover:bg-indigo-900 active:scale-95 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border border-indigo-500 shadow-sm"
        >
          <span>👨‍👩‍👧</span>
        </button>
      </div>
    </header>
  );
};
