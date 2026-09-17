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
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  stats,
  allProgress,
  onSelectLevel,
  onQuickPlay
}) => {
  return (
    <div className="flex flex-col items-center w-full px-4 py-6 max-w-lg mx-auto pb-20">
      {/* Friendly Greeting Header */}
      <div className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
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

      {/* Level Selection Section Header */}
      <div className="w-full flex items-center justify-between mb-4 px-1">
        <h2 className="font-black text-white text-xl flex items-center gap-2">
          <span>🗺️</span>
          <span>{t('chooseLevel', language)}</span>
        </h2>
        <span className="text-xs font-bold text-slate-400">9 {language === 'bm' ? 'Peringkat' : 'Levels'}</span>
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
              className={`btn-fun w-full text-left bg-white/95 backdrop-blur hover:bg-white p-4 rounded-3xl border-3 transition-all flex items-center justify-between shadow-md active:scale-98 ${
                isBeginner
                  ? 'border-amber-400 ring-2 ring-amber-300/50 bg-amber-50/40'
                  : 'border-indigo-100 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Level Icon Avatar */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md bg-gradient-to-br ${lvl.themeColor} text-white shrink-0`}
                >
                  {lvl.icon}
                </div>

                {/* Level Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-lg">
                      {lvl.name[language]}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {lvl.ageRange}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold line-clamp-1 mt-0.5">
                    {lvl.description[language]}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] font-extrabold text-indigo-600">
                    <span>{lvl.topics.length} {language === 'bm' ? 'topik' : 'topics'}</span>
                    {masteredCount > 0 && (
                      <span className="text-emerald-600 font-black">
                        ⭐ {masteredCount} {language === 'bm' ? 'mahir' : 'mastered'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Chevron */}
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0 ml-2">
                ➔
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
