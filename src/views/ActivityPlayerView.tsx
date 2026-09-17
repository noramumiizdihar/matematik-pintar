import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Question, LevelId, Language, UserSettings } from '../types/curriculum';
import { QuestionGenerator } from '../curriculum/questionGenerator';
import { storage } from '../services/storage';
import { soundFx } from '../services/soundEffects';
import { voiceService } from '../services/voice';
import { t } from '../i18n/translations';
import { getLevelById, getTopicById } from '../curriculum/kpmCurriculum';

// Game widgets
import { TapToCount } from '../components/game/TapToCount';
import { VisualCombine } from '../components/game/VisualCombine';
import { NumberLineJump } from '../components/game/NumberLineJump';
import { ShopkeeperMoney } from '../components/game/ShopkeeperMoney';
import { ClockTrain } from '../components/game/ClockTrain';
import { ComparisonPair } from '../components/game/ComparisonPair';
import { KeypadAndChoices } from '../components/game/KeypadAndChoices';

interface ActivityPlayerViewProps {
  levelId: LevelId;
  topicId: string;
  language: Language;
  settings: UserSettings;
  onFinishTopic: () => void;
  onExit: () => void;
  onOpenLesson?: () => void;
}

export const ActivityPlayerView: React.FC<ActivityPlayerViewProps> = ({
  levelId,
  topicId,
  language,
  settings,
  onFinishTopic,
  onExit,
  onOpenLesson
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [status, setStatus] = useState<'answering' | 'correct' | 'retry'>('answering');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const TOTAL_QUESTIONS_PER_SESSION = 5;

  const level = getLevelById(levelId);
  const topic = getTopicById(levelId, topicId);

  // Subscribe to voice synthesis state
  useEffect(() => {
    const unsubscribe = voiceService.subscribeSpeakingState(setIsSpeaking);
    return () => unsubscribe();
  }, []);

  // Load question
  const loadNewQuestion = (qIndex: number) => {
    const diff = qIndex >= 3 ? 'medium' : 'easy';
    const newQ = QuestionGenerator.generate(levelId, topicId, diff);
    setQuestion(newQ);
    setStatus('answering');
    setFeedbackMessage('');
    setShowHint(false);
    startTimeRef.current = Date.now();

    // Auto voice reading for beginner and preschool
    const shouldAutoVoice =
      settings.autoVoiceLevel === 'all' ||
      (settings.autoVoiceLevel === 'beginner_preschool' && (levelId === 'beginner' || levelId === 'preschool'));

    if (shouldAutoVoice && settings.voiceEnabled) {
      setTimeout(() => {
        playVoiceForQuestion(newQ);
      }, 300);
    }
  };

  useEffect(() => {
    loadNewQuestion(currentQuestionIndex);
    return () => {
      voiceService.stop();
    };
  }, [currentQuestionIndex, levelId, topicId]);

  // Voice player helper
  const playVoiceForQuestion = (q: Question) => {
    const textToRead = q.voicePrompt ? q.voicePrompt[language] : q.prompt[language];
    voiceService.speak(textToRead, language);
  };

  // User submitted answer handler
  const handleAnswer = async (userAnswer: number | string) => {
    if (!question || status !== 'answering') return;

    const isCorrect = String(userAnswer).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (isCorrect) {
      soundFx.playCorrect();
      setStatus('correct');

      // Random gentle encouragement
      const encouragements = [
        t('encouragement_correct_1', language),
        t('encouragement_correct_2', language),
        t('encouragement_correct_3', language),
        t('encouragement_correct_4', language)
      ];
      const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
      setFeedbackMessage(msg);

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 }
      });

      // Voice encouragement
      if (settings.voiceEnabled) {
        voiceService.speak(msg.replace(/[^\w\s]/gi, ''), language);
      }

      // Record in storage
      await storage.recordAttempt(levelId, topicId, question.id, true, timeSpent, showHint);
    } else {
      soundFx.playGentleRetry();
      setStatus('retry');
      setShowHint(true);

      const retryMessages = [
        t('encouragement_retry_1', language),
        t('encouragement_retry_2', language),
        t('encouragement_retry_3', language)
      ];
      const msg = retryMessages[Math.floor(Math.random() * retryMessages.length)];
      setFeedbackMessage(msg);

      if (settings.voiceEnabled) {
        voiceService.speak(msg.replace(/[^\w\s]/gi, ''), language);
      }

      await storage.recordAttempt(levelId, topicId, question.id, false, timeSpent, true);
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS_PER_SESSION) {
      soundFx.playFanfare();
      onFinishTopic();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleRetryCurrent = () => {
    soundFx.playClick();
    setStatus('answering');
    setFeedbackMessage('');
  };

  if (!question) return null;

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-60px)] px-3 py-4 max-w-lg mx-auto select-none justify-between">
      {/* Top status bar */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onExit();
          }}
          className="btn-fun bg-white/90 hover:bg-white text-slate-700 px-3 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1 shadow"
        >
          <span>✕</span>
          <span>{t('exit', language)}</span>
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_QUESTIONS_PER_SESSION }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentQuestionIndex
                  ? 'w-6 bg-amber-400'
                  : idx < currentQuestionIndex
                  ? 'w-2.5 bg-emerald-400'
                  : 'w-2.5 bg-slate-600/50'
              }`}
            />
          ))}
        </div>

        {/* Action buttons: Lesson & Voice */}
        <div className="flex items-center gap-1.5">
          {onOpenLesson && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenLesson();
              }}
              className="btn-fun bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1 shadow-sm"
              title={language === 'bm' ? 'Ulang Belajar Konsep' : 'Review Concept'}
            >
              <span>📖</span>
              <span className="hidden sm:inline">{language === 'bm' ? 'Belajar' : 'Lesson'}</span>
            </button>
          )}

          {/* Voice replay button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              playVoiceForQuestion(question);
            }}
            className={`btn-fun px-2.5 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1 shadow transition-all ${
              isSpeaking
                ? 'bg-amber-400 text-indigo-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-indigo-700 hover:bg-indigo-600 text-white'
            }`}
            title={t('listen', language)}
          >
            <span>🔊</span>
            <span className="hidden sm:inline">{t('listen', language)}</span>
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="w-full bg-white/95 backdrop-blur rounded-3xl p-5 shadow-xl border-3 border-indigo-200 mb-2 flex flex-col items-center">
        {/* Topic Badge */}
        <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-black px-3 py-1 rounded-full text-xs mb-3 border border-indigo-100">
          <span>{topic?.icon || '📚'}</span>
          <span>{topic?.name[language] || level?.name[language]}</span>
        </div>

        {/* Question Prompt */}
        <h2 className="text-xl md:text-2xl font-black text-slate-800 text-center leading-snug">
          {question.prompt[language]}
        </h2>

        {/* Dynamic Game / Question Component */}
        <div className="w-full flex justify-center mt-3">
          {question.type === 'tap_to_count' && (
            <TapToCount
              question={question}
              language={language}
              onAnswer={handleAnswer}
              disabled={status !== 'answering'}
            />
          )}

          {question.type === 'visual_combine' && (
            <VisualCombine
              question={question}
              language={language}
              onAnswer={handleAnswer}
              disabled={status !== 'answering'}
            />
          )}

          {question.type === 'number_line' && (
            <NumberLineJump
              question={question}
              language={language}
              onAnswer={handleAnswer}
              disabled={status !== 'answering'}
            />
          )}

          {question.type === 'shop_money' && (
            <ShopkeeperMoney
              question={question}
              language={language}
              onAnswer={handleAnswer}
              disabled={status !== 'answering'}
            />
          )}

          {question.type === 'clock_time' && (
            <ClockTrain
              question={question}
              language={language}
              onAnswer={handleAnswer}
              disabled={status !== 'answering'}
            />
          )}

          {question.type === 'comparison' && (
            <ComparisonPair
              question={question}
              language={language}
              onAnswer={handleAnswer}
              disabled={status !== 'answering'}
            />
          )}

          {(question.type === 'multiple_choice' ||
            question.type === 'numeric_keypad' ||
            question.type === 'pattern_complete' ||
            question.type === 'shape_match') && (
            <KeypadAndChoices
              question={question}
              language={language}
              onAnswer={handleAnswer}
              disabled={status !== 'answering'}
            />
          )}
        </div>
      </div>

      {/* Hint Banner (shown if requested or on gentle retry) */}
      {showHint && status !== 'correct' && (
        <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 mb-2 flex items-start gap-2 text-amber-900 animate-pop">
          <span className="text-lg">💡</span>
          <div className="text-xs font-bold leading-relaxed">
            <span className="font-extrabold">{t('hint', language)}: </span>
            {question.hint[language]}
          </div>
        </div>
      )}

      {/* Feedback Dialog / Action Bar */}
      <div className="w-full mt-2">
        {status === 'answering' && !showHint && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowHint(true);
              }}
              className="text-indigo-200 hover:text-white text-xs font-bold underline py-1"
            >
              {t('hint', language)}
            </button>
          </div>
        )}

        {status === 'correct' && (
          <div className="bg-emerald-500 text-white rounded-3xl p-4 shadow-xl border-3 border-emerald-300 flex flex-col items-center animate-pop">
            <div className="text-lg font-black mb-1">{feedbackMessage}</div>
            <p className="text-xs text-emerald-100 font-bold mb-3 text-center">
              {question.explanation[language]}
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="btn-fun w-full bg-white hover:bg-emerald-50 text-emerald-800 font-black py-3.5 rounded-2xl shadow-md text-base flex items-center justify-center gap-2"
            >
              <span>{t('next', language)}</span>
            </button>
          </div>
        )}

        {status === 'retry' && (
          <div className="bg-amber-500 text-white rounded-3xl p-4 shadow-xl border-3 border-amber-300 flex flex-col items-center animate-pop">
            <div className="text-base font-black mb-1">{feedbackMessage}</div>
            <button
              type="button"
              onClick={handleRetryCurrent}
              className="btn-fun w-full bg-white hover:bg-amber-50 text-amber-900 font-black py-3.5 rounded-2xl shadow-md text-base mt-2"
            >
              {t('retry', language)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
