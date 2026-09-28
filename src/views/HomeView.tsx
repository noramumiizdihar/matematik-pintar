import React from 'react';
import { LevelId, Language, UserStats, TopicProgress } from '../types/curriculum';
import { CURRICULUM_LEVELS } from '../curriculum/kpmCurriculum';
import { soundFx } from '../services/soundEffects';
import { t } from '../i18n/translations';

interface HomeViewProps {
  language: Language;
  stats: UserStats;
  allProgress: Record<string, TopicProgress>;
  onSelectLevel: (levelId: LevelId) => void;
  onQuickPlay: () => void;
  onOpenNumberBoard: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  stats,
  allProgress,
  onSelectLevel,
  onQuickPlay,
  onOpenNumberBoard
}) => {
  return (
    <div className="flex flex-col items-center w-full px-4 py-6 max-w-lg mx-auto pb-20">
      {/* Friendly Greeting Header */}
      <div className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl mb-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl animate-bounce-gentle">👋</span>
            <h1 className="text-2xl font-black">
              {language === 'bm' ? 'Hai Kawan Pintar!' : 'Hello Smart Friend!'}
            </h1>
          </div>
          <p className="text-indigo-100 text-sm font-bold mb-4">
            {language === 'bm'
              ? 'Mari terokai dunia matematik yang ceria & menyeronokkan!'
              : "Let's explore the joyful world of math together!"}
          </p>

          {/* Quick Play Banner */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onQuickPlay();
            }}
            className="btn-fun w-full bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black py-3 px-5 rounded-2xl shadow-lg flex items-center justify-between text-base"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <span>{t('todayPractice', language)}</span>
            </div>
            <span className="text-xs bg-indigo-900/20 px-2 py-0.5 rounded-full font-extrabold">
              {language === 'bm' ? 'Jom Mula!' : "Let's Go!"} ➔
            </span>
          </button>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute right-12 top-2 text-4xl opacity-20 pointer-events-none">✨</div>
      </div>

      {/* Cute Number Board 0-100 Quick Access Banner */}
      <button
        type="button"
        onClick={() => {
          soundFx.playSparkle();
          onOpenNumberBoard();
        }}
        className="btn-fun w-full mb-6 p-4 rounded-3xl bg-gradient-to-r from-pink-100 via-amber-100 to-sky-100 hover:from-pink-200 hover:via-amber-200 hover:to-sky-200 text-indigo-950 font-black shadow-lg hover:shadow-xl active:scale-98 transition-all border-3 border-pink-300/80 flex items-center justify-between group relative overflow-hidden"
      >
        {/* Soft pastel sparkles background */}
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-pink-300/20 rounded-full blur-lg pointer-events-none" />
        <div className="absolute left-1/2 -bottom-6 w-24 h-24 bg-amber-200/30 rounded-full blur-lg pointer-events-none" />

        <div className="flex items-center gap-3.5 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center text-2xl shadow-md border-2 border-white group-hover:scale-105 transition-transform shrink-0">
            🐰
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-purple-950 leading-tight">
                {language === 'bm' ? '🌈 Papan Nombor 0–100' : '🌈 Cute Number Board 0–100'}
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-500 text-white shadow-xs">
                HOT 🔥
              </span>
            </div>
            <p className="text-xs text-purple-800/80 font-bold mt-0.5">
              {language === 'bm'
                ? 'Kad comel & suara dwi-bahasa (BM & EN)!'
                : 'Cute cards & bilingual voice (EN & BM)!'}
            </p>
          </div>
        </div>

        <div className="z-10 shrink-0 ml-2">
          <span className="text-xs bg-indigo-900 text-amber-300 px-3 py-1.5 rounded-full font-black shadow-md flex items-center gap-1">
            <span>✨</span>
            <span className="hidden sm:inline">{language === 'bm' ? 'Teroka' : 'Play'}</span>
            <span>➔</span>
          </span>
        </div>
      </button>

      {/* Level Selection Section Header */}
      <div className="w-full flex items-center justify-between mb-4 px-1">
        <h2 className="font-black text-white text-xl flex items-center gap-2">
          <span>🗺️</span>
          <span>{t('chooseLevel', language)}</span>
        </h2>
        <span className="text-xs font-bold text-slate-300/80">
          {CURRICULUM_LEVELS.length} {language === 'bm' ? 'Peringkat' : 'Levels'}
        </span>
      </div>

      {/* Grid of Learning Worlds */}
      <div className="grid grid-cols-1 gap-3.5 w-full">
        {CURRICULUM_LEVELS.map((lvl) => {
          // Calculate level completion
          const levelTopics = lvl.topics;
          let masteredCount = 0;
          levelTopics.forEach(top => {
            const prog = allProgress[`${lvl.id}_${top.id}`];
            if (prog && prog.mastery === 'mastered') {
              masteredCount++;
            }
          });

          const isBeginner = lvl.id === 'beginner';

          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => {
                soundFx.playClick();
                onSelectLevel(lvl.id);
              }}
              className={`btn-fun w-full text-left bg-white/95 backdrop-blur hover:bg-white p-4 rounded-3xl border-3 transition-all flex flex-col shadow-md active:scale-98 ${
                isBeginner
                  ? 'border-amber-400 ring-2 ring-amber-300/50 bg-amber-50/40'
                  : 'border-indigo-100 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-3.5 w-full">
                {/* Level Icon Avatar */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md bg-gradient-to-br ${lvl.themeColor} text-white shrink-0`}
                >
                  {lvl.icon}
                </div>

                {/* Level Details — min-w-0 lets the title truncate instead of
                    wrapping under its own age badge on narrow phones */}
                <div className="min-w-0 flex-1">
                  {/* The title owns its own line so long level names are never
                      truncated by the age badge sitting next to them */}
                  <span className="block font-black text-slate-900 text-lg leading-tight truncate">
                    {lvl.name[language]}
                  </span>
                  <p className="text-xs text-slate-500 font-bold line-clamp-1 mt-0.5">
                    {lvl.description[language]}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] font-extrabold text-indigo-600 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
                      {lvl.ageRange}
                    </span>
                    <span>{lvl.topics.length} {language === 'bm' ? 'topik' : 'topics'}</span>
                    {masteredCount > 0 && (
                      <span className="text-emerald-600 font-black">
                        ⭐ {masteredCount} {language === 'bm' ? 'mahir' : 'mastered'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${lvl.themeColor} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}
                >
                  ➔
                </div>
              </div>

              {/* Mastery rail — a glance at how far this world has been explored */}
              <div className="rail mt-3">
                <span
                  className={`bg-gradient-to-r ${lvl.themeColor}`}
                  style={{ width: `${Math.round((masteredCount / Math.max(1, levelTopics.length)) * 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
