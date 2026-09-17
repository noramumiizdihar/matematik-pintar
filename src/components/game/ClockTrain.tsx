import React from 'react';
import { Question, Language } from '../../types/curriculum';
import { soundFx } from '../../services/soundEffects';

interface ClockTrainProps {
  question: Question;
  language: Language;
  onAnswer: (val: number | string) => void;
  disabled?: boolean;
}

export const ClockTrain: React.FC<ClockTrainProps> = ({
  question,
  language,
  onAnswer,
  disabled
}) => {
  const { hour = 3, minute = 0 } = question.visualData?.clockTime || {};

  // Calculate angles
  const minuteAngle = minute * 6; // 360 / 60
  const hourAngle = (hour % 12) * 30 + (minute / 60) * 30; // 360 / 12

  return (
    <div className="flex flex-col items-center w-full max-w-md px-2 py-4">
      {/* Train and Analog Clock Card */}
      <div className="bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-indigo-200 w-full mb-6 flex flex-col items-center">
        {/* Train Header Banner */}
        <div className="flex items-center gap-2 mb-4 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-200">
          <span className="text-2xl animate-bounce-gentle">🚂</span>
          <span className="text-xs font-black text-indigo-800 uppercase tracking-wider">
            {language === 'bm' ? 'Kereta Api Ekspres KL' : 'KL Express Train'}
          </span>
        </div>

        {/* SVG Analog Clock Face */}
        <div className="relative w-48 h-48 my-2">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Clock rim */}
            <circle cx="100" cy="100" r="95" fill="#f8fafc" stroke="#6366f1" strokeWidth="8" />
            <circle cx="100" cy="100" r="88" fill="#ffffff" stroke="#e0e7ff" strokeWidth="2" />

            {/* Hour marks & numbers */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
              const angle = (num * 30 - 90) * (Math.PI / 180);
              const x = 100 + 70 * Math.cos(angle);
              const y = 100 + 70 * Math.sin(angle);
              return (
                <text
                  key={num}
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  className="font-black text-xs fill-slate-700 select-none"
                  style={{ fontSize: '15px', fontWeight: 900 }}
                >
                  {num}
                </text>
              );
            })}

            {/* Hour Hand (short, thicker) */}
            <line
              x1="100"
              y1="100"
              x2={100 + 44 * Math.cos(((hourAngle - 90) * Math.PI) / 180)}
              y2={100 + 44 * Math.sin(((hourAngle - 90) * Math.PI) / 180)}
              stroke="#4f46e5"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Minute Hand (longer, red) */}
            <line
              x1="100"
              y1="100"
              x2={100 + 64 * Math.cos(((minuteAngle - 90) * Math.PI) / 180)}
              y2={100 + 64 * Math.sin(((minuteAngle - 90) * Math.PI) / 180)}
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Center Pin */}
            <circle cx="100" cy="100" r="6" fill="#1e1b4b" />
          </svg>
        </div>
      </div>

      {/* Answer selection tiles */}
      <div className="w-full">
        <p className="text-center font-extrabold text-slate-700 mb-3 text-lg">
          {language === 'bm' ? 'Pukul berapakah kereta api berlepas?' : 'What time does the train leave?'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {question.options?.map((opt, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                soundFx.playClick();
                onAnswer(opt);
              }}
              className="btn-fun bg-white text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 border-2 border-indigo-300 font-black text-2xl py-4 rounded-2xl flex items-center justify-center shadow-lg transition-transform"
            >
              {language === 'bm' ? `Pukul ${opt}` : `${opt} o'clock`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
