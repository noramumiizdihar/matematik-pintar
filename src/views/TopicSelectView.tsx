import React from 'react';
import { LevelId, Language, TopicProgress } from '../types/curriculum';
import { getLevelById } from '../curriculum/kpmCurriculum';
import { soundFx } from '../services/soundEffects';
import { t, getMasteryLabel } from '../i18n/translations';

interface TopicSelectViewProps {
  levelId: LevelId;
  language: Language;
  allProgress: Record<string, TopicProgress>;
  onSelectTopic: (topicId: string, mode: 'lesson' | 'practice') => void;
  onBack: () => void;
}

// How full the rail sits at each stage of mastery, and the colour it fills with
const masteryPercent: Record<string, number> = {
  not_started: 0,
  learning: 25,
  practising: 50,
  confident: 75,
  mastered: 100
};

const masteryFill: Record<string, string> = {
  not_started: 'bg-slate-300',
  learning: 'bg-blue-400',
  practising: 'bg-amber-400',
  confident: 'bg-indigo-500',
  mastered: 'bg-gradient-to-r from-emerald-400 to-teal-500'
};

export const TopicSelectView: React.FC<TopicSelectViewProps> = ({
  levelId,
  language,
  allProgress,
  onSelectTopic,
  onBack
}) => {
  const level = getLevelById(levelId);
  if (!level) return null;

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Top navigation & level header */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="btn-fun bg-white/90 hover:bg-white text-slate-700 px-3.5 py-1.5 rounded-2xl font-black text-sm flex items-center gap-1.5 shadow"
        >
          <span>⬅</span>
          <span>{t('back', language)}</span>
        </button>
        <span className="text-xs font-black uppercase text-amber-300 bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-500/40">
          {level.shortName}
        </span>
      </div>

      {/* Level Info Banner */}
      <div
        className={`w-full bg-gradient-to-r ${level.themeColor} text-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl shadow-inner shrink-0">
            {level.icon}
          </div>
          <div>
            <h1 className="text-2xl font-black leading-tight">
              {level.name[language]}
            </h1>
            <p className="text-white/90 text-xs font-bold mt-1 line-clamp-2">
              {level.description[language]}
            </p>
          </div>
        </div>
      </div>

      {/* Topics List Header */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <h2 className="font-black text-white text-lg flex items-center gap-2">
          <span>📚</span>
          <span>{t('chooseTopic', language)}</span>
        </h2>
        <span className="text-xs font-bold text-slate-400">
          {level.topics.length} {language === 'bm' ? 'topik tersedia' : 'topics available'}
        </span>
      </div>

      {/* Topic Cards */}
      <div className="grid grid-cols-1 gap-4 w-full">
        {level.topics.map((topic) => {
          const prog = allProgress[`${level.id}_${topic.id}`] || {
            topicId: topic.id,
            level: level.id,
            attempted: 0,
            correct: 0,
            mastery: 'not_started',
            starsEarned: 0,
            lastAttemptedTimestamp: 0
          };

          const masteryColors: Record<string, string> = {
            not_started: 'bg-slate-100 text-slate-600',
            learning: 'bg-blue-100 text-blue-700',
            practising: 'bg-amber-100 text-amber-700',
            confident: 'bg-indigo-100 text-indigo-700',
            mastered: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400'
          };

          return (
            <div
              key={topic.id}
              className="bg-white/95 backdrop-blur p-4 rounded-3xl border-2 border-indigo-100 shadow-md flex flex-col justify-between"
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
                    {topic.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {topic.name[language]}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold line-clamp-1 mt-0.5">
                      {topic.description[language]}
                    </p>
                  </div>
                </div>

                {/* Stars earned badge */}
                {prog.starsEarned > 0 && (
                  <span className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-xs font-black shrink-0">
                    ⭐ {prog.starsEarned}
                  </span>
                )}
              </div>

              {/* Status row */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 w-full text-xs">
                <span className="font-bold text-slate-400">
                  {topic.standardContent ? `SK ${topic.standardContent}` : topic.learningArea}
                </span>

                <span
                  className={`font-black text-[11px] px-2.5 py-0.5 rounded-full ${
                    masteryColors[prog.mastery] || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {getMasteryLabel(prog.mastery, language)}
                </span>
              </div>

              {/* Mastery rail: how far this topic has progressed */}
              <div className="rail mt-2">
                <span
                  className={masteryFill[prog.mastery] || 'bg-slate-300'}
                  style={{ width: `${masteryPercent[prog.mastery] ?? 0}%` }}
                />
              </div>

              {/* Action Buttons: Sesi Belajar vs Sesi Latihan */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onSelectTopic(topic.id, 'lesson');
                  }}
                  className="btn-fun bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-indigo-200 shadow-sm active:scale-95"
                >
                  <span>📖</span>
                  <span>{language === 'bm' ? 'Sesi Belajar' : 'Learn Concept'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onSelectTopic(topic.id, 'practice');
                  }}
                  className="btn-fun bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-indigo-950 font-black py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>🎮</span>
                  <span>{language === 'bm' ? 'Mula Latihan' : 'Practice'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
