import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LevelId, Language, UserSettings } from '../types/curriculum';
import { getLessonForTopic } from '../curriculum/topicLessons';
import { soundFx } from '../services/soundEffects';
import { voiceService } from '../services/voice';
import { t } from '../i18n/translations';
import { NumberGrid100 } from '../components/notes/NumberGrid100';

interface LessonViewProps {
  levelId: LevelId;
  topicId: string;
  language: Language;
  settings: UserSettings;
  onStartPractice: () => void;
  onBack: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  levelId,
  topicId,
  language,
  settings,
  onStartPractice,
  onBack
}) => {
  const lesson = getLessonForTopic(levelId, topicId);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'notes' | 'chart100'>('notes');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const step = lesson.steps[currentStepIndex];
  const isLastStep = currentStepIndex === lesson.steps.length - 1;

  // Check if topic relates to numbers or counting
  const isNumberTopic =
    topicId.includes('num') ||
    topicId.includes('count') ||
    topicId.includes('seq') ||
    topicId.includes('place') ||
    levelId === 'beginner' ||
    levelId === 'preschool' ||
    levelId === 'foundation' ||
    levelId === 'year_1';

  useEffect(() => {
    const unsub = voiceService.subscribeSpeakingState(setIsSpeaking);
    return () => unsub();
  }, []);

  // Speak current step aloud automatically
  const readCurrentStep = (stepToRead = step) => {
    if (!settings.voiceEnabled || activeTab !== 'notes') return;
    const text = stepToRead.voiceText
      ? stepToRead.voiceText[language]
      : `${stepToRead.title[language]}. ${stepToRead.concept[language]}`;
    voiceService.speak(text, language);
  };

  useEffect(() => {
    if (activeTab === 'notes') {
      readCurrentStep();
    }
    return () => {
      voiceService.stop();
    };
  }, [currentStepIndex, language, activeTab]);

  const handleNextStep = () => {
    soundFx.playClick();
    if (isLastStep) {
      soundFx.playFanfare();
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.6 }
      });
      onStartPractice();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    soundFx.playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-70px)] px-3 py-4 max-w-lg mx-auto justify-between select-none pb-12">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="btn-fun bg-white/90 hover:bg-white text-slate-700 px-3 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1 shadow"
        >
          <span>⬅</span>
          <span>{t('back', language)}</span>
        </button>

        {/* Step dots (when viewing notes) */}
        {activeTab === 'notes' ? (
          <div className="flex items-center gap-1.5">
            {lesson.steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-6 bg-amber-400'
                    : idx < currentStepIndex
                    ? 'w-2 bg-emerald-400'
                    : 'w-2 bg-slate-600/50'
                }`}
              />
            ))}
          </div>
        ) : (
          <span className="text-xs font-black text-amber-300 uppercase bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-500/40">
            {language === 'bm' ? 'Carta 0–100' : '0–100 Chart'}
          </span>
        )}

        {/* Replay Voice button */}
        {activeTab === 'notes' ? (
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              readCurrentStep();
            }}
            className={`btn-fun px-3 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1 shadow transition-all ${
              isSpeaking
                ? 'bg-amber-400 text-indigo-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-indigo-700 hover:bg-indigo-600 text-white'
            }`}
            title={t('listen', language)}
          >
            <span>🔊</span>
            <span>{t('listen', language)}</span>
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>

      {/* Mode Switcher Tabs: Nota Konsep vs Carta Nombor 0-100 */}
      <div className="w-full grid grid-cols-2 gap-2 bg-indigo-950/80 p-1 rounded-2xl mb-4 text-xs font-black">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('notes');
          }}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'notes'
              ? 'bg-amber-400 text-indigo-950 shadow-md font-black'
              : 'text-indigo-200 hover:text-white'
          }`}
        >
          <span>📖</span>
          <span>{language === 'bm' ? 'Nota Konsep' : 'Concept Notes'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('chart100');
          }}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'chart100'
              ? 'bg-amber-400 text-indigo-950 shadow-md font-black'
              : 'text-indigo-200 hover:text-white'
          }`}
        >
          <span>💯</span>
          <span>{language === 'bm' ? 'Carta Nombor 0–100' : '0–100 Numbers Grid'}</span>
        </button>
      </div>

      {/* TAB 1: NOTA KONSEP BERGAMBAR */}
      {activeTab === 'notes' && (
        <div className="w-full bg-white rounded-3xl p-6 shadow-2xl border-4 border-indigo-200 flex flex-col items-center my-auto animate-pop">
          {/* Topic Header Badge */}
          <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-black px-3.5 py-1 rounded-full text-xs mb-3 border border-indigo-100">
            <span>{lesson.icon}</span>
            <span>{lesson.title[language]}</span>
          </div>

          {/* Big Step Illustration */}
          <div className="w-20 h-20 rounded-3xl bg-amber-100/80 border-2 border-amber-300 flex items-center justify-center text-5xl mb-3 shadow-sm animate-bounce-gentle">
            {step.illustrationEmoji}
          </div>

          {/* Step Title */}
          <h2 className="text-xl md:text-2xl font-black text-slate-800 text-center leading-snug mb-2">
            {step.title[language]}
          </h2>

          {/* Concept Explanation Note */}
          <p className="text-sm md:text-base font-bold text-slate-600 text-center leading-relaxed mb-3 max-w-sm">
            {step.concept[language]}
          </p>

          {/* Interactive Visual Items (if present) */}
          {step.visualItems && step.visualItems.length > 0 && (
            <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-3.5 my-2 flex flex-wrap items-center justify-center gap-2.5">
              {step.visualItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 animate-pop"
                >
                  <span className="text-2xl md:text-3xl">{item.emoji}</span>
                  {item.label && (
                    <span className="text-[11px] font-black text-indigo-700 mt-1">
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Example Formula Box (if present) */}
          {step.exampleFormula && (
            <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-900 rounded-2xl py-3 px-4 my-2 text-center font-black text-base md:text-lg shadow-inner tracking-wide">
              {step.exampleFormula}
            </div>
          )}

          {/* Quick link button to open 0-100 Chart if topic is related to numbers */}
          {isNumberTopic && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('chart100');
              }}
              className="btn-fun w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 my-2"
            >
              <span>💯</span>
              <span>{language === 'bm' ? 'Buka Carta Penuh Nombor 0 – 100' : 'Open Full 0 – 100 Number Chart'}</span>
              <span>➔</span>
            </button>
          )}

          {/* Tip Box */}
          {step.tip && (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3 mt-2 flex items-start gap-2.5 text-amber-900">
              <span className="text-xl shrink-0">💡</span>
              <div className="text-xs font-bold leading-relaxed">
                <span className="font-black text-amber-950">
                  {language === 'bm' ? 'Petua Pintar: ' : 'Smart Tip: '}
                </span>
                {step.tip[language]}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CARTA INTERAKTIF NOMBOR 0-100 */}
      {activeTab === 'chart100' && (
        <div className="w-full my-auto animate-pop">
          <NumberGrid100 language={language} initialSelected={1} />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="w-full flex gap-3 mt-4">
        {activeTab === 'notes' && currentStepIndex > 0 && (
          <button
            type="button"
            onClick={handlePrevStep}
            className="btn-fun w-1/3 bg-white hover:bg-slate-50 text-slate-700 font-black py-3.5 rounded-2xl text-sm border-2 border-slate-200 shadow"
          >
            {language === 'bm' ? '⬅ Sebelum' : '⬅ Previous'}
          </button>
        )}

        <button
          type="button"
          onClick={activeTab === 'chart100' ? () => onStartPractice() : handleNextStep}
          className={`btn-fun text-white font-black py-3.5 rounded-2xl text-base shadow-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'notes' && currentStepIndex > 0 ? 'w-2/3' : 'w-full'
          } ${
            isLastStep || activeTab === 'chart100'
              ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-lg ring-4 ring-emerald-300/60 animate-pulse-subtle'
              : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
          }`}
        >
          {isLastStep || activeTab === 'chart100' ? (
            <>
              <span>🎮 {language === 'bm' ? 'Jom Mula Latihan!' : "Let's Practice Now!"}</span>
              <span>➔</span>
            </>
          ) : (
            <>
              <span>{language === 'bm' ? 'Seterusnya' : 'Next'}</span>
              <span>➔</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
