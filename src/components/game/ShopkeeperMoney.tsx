import React, { useState } from 'react';
import { Question, Language } from '../../types/curriculum';
import { soundFx } from '../../services/soundEffects';
import { t } from '../../i18n/translations';

interface ShopkeeperMoneyProps {
  question: Question;
  language: Language;
  onAnswer: (paidAmount: number) => void;
  disabled?: boolean;
}

export const ShopkeeperMoney: React.FC<ShopkeeperMoneyProps> = ({
  question,
  language,
  onAnswer,
  disabled
}) => {
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const targetPrice = Number(question.answer);
  const item = question.visualData?.moneyItems?.[0];

  const addMoney = (val: number) => {
    if (disabled) return;
    soundFx.playPop(1.2);
    setSelectedNotes(prev => [...prev, val]);
    setCurrentTotal(prev => prev + val);
  };

  const clearMoney = () => {
    if (disabled) return;
    soundFx.playClick();
    setSelectedNotes([]);
    setCurrentTotal(0);
  };

  const handlePay = () => {
    if (disabled) return;
    soundFx.playClick();
    onAnswer(currentTotal);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md px-2 py-4">
      {/* Shopkeeper Item Showcase */}
      <div className="bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl border-4 border-amber-200 w-full mb-6">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl animate-bounce-gentle">{item?.itemEmoji || '🛒'}</span>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                {item?.itemName[language] || (language === 'bm' ? 'Barang Kedai' : 'Shop Item')}
              </h3>
              <p className="text-amber-600 font-black text-2xl">RM{targetPrice}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {t('totalPrice', language)}
            </span>
            <div className="text-xl font-black text-slate-700">RM{targetPrice}</div>
          </div>
        </div>

        {/* Tray of given money */}
        <div className="min-h-[70px] bg-amber-50 rounded-2xl p-3 border-2 border-dashed border-amber-300 flex flex-wrap items-center gap-2">
          {selectedNotes.length === 0 ? (
            <span className="text-xs font-bold text-amber-700/60 mx-auto">
              {language === 'bm' ? 'Ketik wang di bawah untuk bayar' : 'Tap money below to pay'}
            </span>
          ) : (
            selectedNotes.map((val, idx) => (
              <span
                key={idx}
                className="bg-blue-600 text-white font-black text-xs px-3 py-1.5 rounded-lg shadow-sm animate-pop"
              >
                RM{val}
              </span>
            ))
          )}
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between mt-4 font-black">
          <span className="text-slate-600 text-sm">{t('yourMoney', language)}</span>
          <span className={`text-2xl ${currentTotal === targetPrice ? 'text-emerald-600' : 'text-slate-800'}`}>
            RM{currentTotal}
          </span>
        </div>
      </div>

      {/* Money choices tray (Malaysian Ringgit notes) */}
      <div className="w-full mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
          {language === 'bm' ? 'PILIH WANG KERTAS (RINGGIT MALAYSIA)' : 'SELECT BANKNOTES (MALAYSIAN RINGGIT)'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[1, 5, 10].map((val) => (
            <button
              key={val}
              type="button"
              disabled={disabled}
              onClick={() => addMoney(val)}
              className={`btn-fun text-white font-black py-3 rounded-2xl flex flex-col items-center shadow-md active:scale-95 ${
                val === 1
                  ? 'bg-blue-600 hover:bg-blue-700 border-b-4 border-blue-800'
                  : val === 5
                  ? 'bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800'
                  : 'bg-rose-600 hover:bg-rose-700 border-b-4 border-rose-800'
              }`}
            >
              <span className="text-xs opacity-80">BANK NEGARA</span>
              <span className="text-xl">RM{val}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action controls */}
      <div className="flex gap-3 w-full">
        <button
          type="button"
          disabled={disabled || selectedNotes.length === 0}
          onClick={clearMoney}
          className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold py-3.5 rounded-2xl text-sm transition-colors"
        >
          {t('clearMoney', language)}
        </button>
        <button
          type="button"
          disabled={disabled || currentTotal === 0}
          onClick={handlePay}
          className="w-2/3 btn-fun bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-2"
        >
          <span>{t('payButton', language)}</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
};
