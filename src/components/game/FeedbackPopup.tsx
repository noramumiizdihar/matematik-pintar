import React, { useEffect, useRef } from 'react';
import { Language } from '../../types/curriculum';
import { t } from '../../i18n/translations';

interface FeedbackPopupProps {
  status: 'correct' | 'retry';
  message: string;
  explanation: string;
  hint: string;
  language: Language;
  /** True on the final question of the session, so the button reads "Done" */
  isLastQuestion?: boolean;
  onPrimary: () => void;
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
  status,
  message,
  explanation,
  hint,
  language,
  isLastQuestion = false,
  onPrimary
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isCorrect = status === 'correct';

  // Put focus on the only action so a tap or the Enter key both work right away
  useEffect(() => {
    buttonRef.current?.focus();
  }, [status]);

  // Escape triggers the action rather than dismissing: there is nothing to dismiss to
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onPrimary();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPrimary]);

  // Hold the page still while the popup owns the screen
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const primaryLabel = isCorrect
    ? isLastQuestion
      ? t('finish', language)
      : t('next', language)
    : t('retry', language);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-pop border-3 ${
          isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'
        }`}
      >
        {/* Coloured banner with the big reaction */}
        <div
          className={`px-5 pt-5 pb-4 text-white text-center bg-gradient-to-br ${
            isCorrect ? 'from-emerald-400 to-teal-600' : 'from-amber-400 to-orange-500'
          }`}
        >
          <div className="text-5xl mb-1 animate-bounce-gentle" aria-hidden="true">
            {isCorrect ? '🎉' : '💪'}
          </div>
          <h3 id="feedback-title" className="text-xl font-black leading-tight">
            {message}
          </h3>
        </div>

        {/* Why the answer works, or a nudge towards the next attempt */}
        <div className="px-5 py-4">
          <p
            className={`text-sm font-bold text-center leading-relaxed ${
              isCorrect ? 'text-emerald-900' : 'text-amber-900'
            }`}
          >
            {isCorrect ? explanation : hint}
          </p>

          {!isCorrect && (
            <p className="text-[11px] font-black text-amber-700/80 text-center mt-2 uppercase tracking-wide">
              💡 {t('hint', language)}
            </p>
          )}

          <button
            ref={buttonRef}
            type="button"
            onClick={onPrimary}
            className={`btn-fun w-full mt-4 font-black py-3.5 rounded-2xl text-base shadow-md flex items-center justify-center gap-2 ${
              isCorrect
                ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white'
                : 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-amber-950'
            }`}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
