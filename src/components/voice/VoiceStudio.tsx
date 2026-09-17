import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../../types/curriculum';
import { voiceService } from '../../services/voice';
import { soundFx } from '../../services/soundEffects';

interface VoiceStudioProps {
  language: Language;
}

interface AudioItem {
  id: string;
  key: string;
  labelBm: string;
  labelEn: string;
  promptBm: string;
  promptEn: string;
}

const NUMBER_ITEMS_0_10: AudioItem[] = [
  { id: '0', key: 'num_0', labelBm: '0 – Sifar', labelEn: '0 – Zero', promptBm: 'Sebut "Sifar"', promptEn: 'Say "Zero"' },
  { id: '1', key: 'num_1', labelBm: '1 – Satu', labelEn: '1 – One', promptBm: 'Sebut "Satu"', promptEn: 'Say "One"' },
  { id: '2', key: 'num_2', labelBm: '2 – Dua', labelEn: '2 – Two', promptBm: 'Sebut "Dua"', promptEn: 'Say "Two"' },
  { id: '3', key: 'num_3', labelBm: '3 – Tiga', labelEn: '3 – Three', promptBm: 'Sebut "Tiga"', promptEn: 'Say "Three"' },
  { id: '4', key: 'num_4', labelBm: '4 – Empat', labelEn: '4 – Four', promptBm: 'Sebut "Empat"', promptEn: 'Say "Four"' },
  { id: '5', key: 'num_5', labelBm: '5 – Lima', labelEn: '5 – Five', promptBm: 'Sebut "Lima"', promptEn: 'Say "Five"' },
  { id: '6', key: 'num_6', labelBm: '6 – Enam', labelEn: '6 – Six', promptBm: 'Sebut "Enam"', promptEn: 'Say "Six"' },
  { id: '7', key: 'num_7', labelBm: '7 – Tujuh', labelEn: '7 – Seven', promptBm: 'Sebut "Tujuh"', promptEn: 'Say "Seven"' },
  { id: '8', key: 'num_8', labelBm: '8 – Lapan', labelEn: '8 – Eight', promptBm: 'Sebut "Lapan"', promptEn: 'Say "Eight"' },
  { id: '9', key: 'num_9', labelBm: '9 – Sembilan', labelEn: '9 – Nine', promptBm: 'Sebut "Sembilan"', promptEn: 'Say "Nine"' },
  { id: '10', key: 'num_10', labelBm: '10 – Sepuluh', labelEn: '10 – Ten', promptBm: 'Sebut "Sepuluh"', promptEn: 'Say "Ten"' },
];

const NUMBER_ITEMS_11_20: AudioItem[] = [
  { id: '11', key: 'num_11', labelBm: '11 – Sebelas', labelEn: '11 – Eleven', promptBm: 'Sebut "Sebelas"', promptEn: 'Say "Eleven"' },
  { id: '12', key: 'num_12', labelBm: '12 – Dua belas', labelEn: '12 – Twelve', promptBm: 'Sebut "Dua belas"', promptEn: 'Say "Twelve"' },
  { id: '13', key: 'num_13', labelBm: '13 – Tiga belas', labelEn: '13 – Thirteen', promptBm: 'Sebut "Tiga belas"', promptEn: 'Say "Thirteen"' },
  { id: '14', key: 'num_14', labelBm: '14 – Empat belas', labelEn: '14 – Fourteen', promptBm: 'Sebut "Empat belas"', promptEn: 'Say "Fourteen"' },
  { id: '15', key: 'num_15', labelBm: '15 – Lima belas', labelEn: '15 – Fifteen', promptBm: 'Sebut "Lima belas"', promptEn: 'Say "Fifteen"' },
  { id: '16', key: 'num_16', labelBm: '16 – Enam belas', labelEn: '16 – Sixteen', promptBm: 'Sebut "Enam belas"', promptEn: 'Say "Sixteen"' },
  { id: '17', key: 'num_17', labelBm: '17 – Tujuh belas', labelEn: '17 – Seventeen', promptBm: 'Sebut "Tujuh belas"', promptEn: 'Say "Seventeen"' },
  { id: '18', key: 'num_18', labelBm: '18 – Lapan belas', labelEn: '18 – Eighteen', promptBm: 'Sebut "Lapan belas"', promptEn: 'Say "Eighteen"' },
  { id: '19', key: 'num_19', labelBm: '19 – Sembilan belas', labelEn: '19 – Nineteen', promptBm: 'Sebut "Sembilan belas"', promptEn: 'Say "Nineteen"' },
  { id: '20', key: 'num_20', labelBm: '20 – Dua puluh', labelEn: '20 – Twenty', promptBm: 'Sebut "Dua puluh"', promptEn: 'Say "Twenty"' },
];

const FEEDBACK_ITEMS: AudioItem[] = [
  { id: 'syabas', key: 'fb_syabas', labelBm: 'Syabas! ⭐', labelEn: 'Well done! ⭐', promptBm: 'Sebut "Syabas! Hebat sekali!"', promptEn: 'Say "Well done! Awesome!"' },
  { id: 'tepat', key: 'fb_tepat', labelBm: 'Tepat Sekali! 🎉', labelEn: 'Spot On! 🎉', promptBm: 'Sebut "Tepat sekali, bijaknya!"', promptEn: 'Say "Spot on, great job!"' },
  { id: 'bagus', key: 'fb_bagus', labelBm: 'Bagus! 🌟', labelEn: 'Great! 🌟', promptBm: 'Sebut "Bagus! Teruskan usaha!"', promptEn: 'Say "Great! Keep it up!"' },
  { id: 'hebat', key: 'fb_hebat', labelBm: 'Hebat! 🚀', labelEn: 'Awesome! 🚀', promptBm: 'Sebut "Hebat, betul lagi!"', promptEn: 'Say "Awesome, correct again!"' },
  { id: 'cuba_lagi', key: 'fb_cuba_lagi', labelBm: 'Cuba Lagi! 🌱', labelEn: 'Try Again! 🌱', promptBm: 'Sebut "Hampir betul, jom cuba lagi!"', promptEn: 'Say "Almost there, try again!"' },
];

const MATH_ITEMS: AudioItem[] = [
  { id: 'tambah', key: 'math_tambah', labelBm: 'Tambah (+)', labelEn: 'Plus (+)', promptBm: 'Sebut "Tambah"', promptEn: 'Say "Plus"' },
  { id: 'tolak', key: 'math_tolak', labelBm: 'Tolak (−)', labelEn: 'Minus (−)', promptBm: 'Sebut "Tolak"', promptEn: 'Say "Minus"' },
  { id: 'sama_dengan', key: 'math_sama_dengan', labelBm: 'Sama Dengan (=)', labelEn: 'Equals (=)', promptBm: 'Sebut "Sama dengan"', promptEn: 'Say "Equals"' },
  { id: 'ringgit', key: 'math_ringgit', labelBm: 'Ringgit (RM)', labelEn: 'Ringgit (RM)', promptBm: 'Sebut "Ringgit"', promptEn: 'Say "Ringgit"' },
  { id: 'sen', key: 'math_sen', labelBm: 'Sen', labelEn: 'Sen', promptBm: 'Sebut "Sen"', promptEn: 'Say "Cents"' },
];

export const VoiceStudio: React.FC<VoiceStudioProps> = ({ language }) => {
  const [activeCategory, setActiveCategory] = useState<'numbers' | 'feedback' | 'math'>('numbers');
  const [showExtendedNumbers, setShowExtendedNumbers] = useState<boolean>(false);
  const [customKeys, setCustomKeys] = useState<Set<string>>(new Set());
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Sync custom keys from voiceService
  const refreshKeys = () => {
    setCustomKeys(new Set(voiceService.getAllCustomAudioKeys()));
  };

  useEffect(() => {
    refreshKeys();
    const unsub = voiceService.onCustomAudioChanged(() => {
      refreshKeys();
    });
    return () => {
      unsub();
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    setRecordingKey(null);
    setRecordingSeconds(0);
  };

  const handleStartRecording = async (key: string) => {
    // If currently recording this item, stop it
    if (recordingKey === key) {
      handleStopRecording();
      return;
    }

    // Stop any existing recording first
    stopRecordingCleanup();
    setMicError(null);
    soundFx.playClick();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
          await voiceService.registerCustomAudio(key, blob);
          soundFx.playCorrect();
        }
        stopRecordingCleanup();
      };

      mediaRecorder.start();
      setRecordingKey(key);
      setRecordingSeconds(0);

      // Timer & Auto-stop at 5 seconds
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 4) {
            handleStopRecording();
            return 5;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Mic access failed:', err);
      setMicError(
        language === 'bm'
          ? 'Sila benarkan akses mikrofon dalam tetapan pelayar anda untuk merakam suara.'
          : 'Please allow microphone access in your browser settings to record.'
      );
      stopRecordingCleanup();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      stopRecordingCleanup();
    }
  };

  const handlePlayItem = (key: string) => {
    soundFx.playClick();
    const customUrl = voiceService.getCustomAudioUrl(key);
    if (customUrl) {
      voiceService.playAudio(customUrl, true);
    } else {
      // Fallback preview of default voice
      if (key.startsWith('num_')) {
        const num = key.replace('num_', '');
        voiceService.playAudio(`/audio/ms/numbers/${num}.mp3`, false);
      } else if (key.startsWith('fb_')) {
        const fbKey = key.replace('fb_', '');
        voiceService.playAudio(`/audio/ms/feedback/${fbKey}.mp3`, false);
      } else if (key.startsWith('math_')) {
        const mKey = key.replace('math_', '');
        voiceService.playAudio(`/audio/ms/math/${mKey}.mp3`, false);
      }
    }
  };

  const handleDeleteItem = async (key: string) => {
    soundFx.playClick();
    await voiceService.unregisterCustomAudio(key);
  };

  const handleResetAll = async () => {
    const confirmMsg = language === 'bm'
      ? 'Adakah anda pasti mahu memadam semua rakaman suara anak dan kembali ke suara standard?'
      : 'Are you sure you want to delete all custom recordings and reset to default?';
    if (window.confirm(confirmMsg)) {
      soundFx.playClick();
      await voiceService.resetAllCustomAudio();
    }
  };

  // Determine items to display
  let currentItems: AudioItem[] = [];
  if (activeCategory === 'numbers') {
    currentItems = showExtendedNumbers
      ? [...NUMBER_ITEMS_0_10, ...NUMBER_ITEMS_11_20]
      : NUMBER_ITEMS_0_10;
  } else if (activeCategory === 'feedback') {
    currentItems = FEEDBACK_ITEMS;
  } else {
    currentItems = MATH_ITEMS;
  }

  const recordedCount = Array.from(customKeys).length;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-purple-900/80 via-indigo-900/90 to-pink-900/80 p-4 rounded-3xl border-2 border-purple-400/40 shadow-lg text-white">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-indigo-950 flex items-center justify-center text-2xl font-black shrink-0 shadow-md">
            🎙️
          </div>
          <div className="flex-1">
            <h3 className="font-black text-base md:text-lg text-amber-300 leading-tight">
              {language === 'bm' ? 'Studio Rakaman Suara Anak' : 'Child Voice Recording Studio'}
            </h3>
            <p className="text-xs text-purple-200 mt-1 leading-relaxed">
              {language === 'bm'
                ? 'Rakam suara anak atau ahli keluarga anda sendiri untuk menggantikan suara sistem! Anak akan berasa sangat teruja mendengar suaranya sendiri dalam permainan.'
                : 'Record your own child or family members! Your child will be overjoyed hearing their own voice in the math games.'}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="bg-purple-950/80 text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-xl border border-purple-400/30">
                ✨ {recordedCount} {language === 'bm' ? 'suara anak dirakam' : 'custom voices recorded'}
              </span>
              {recordedCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-[10px] text-rose-300 hover:text-rose-100 font-bold underline px-1"
                >
                  {language === 'bm' ? 'Padam Semua' : 'Reset All'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mic Permission Error Alert */}
      {micError && (
        <div className="bg-rose-500/20 border-2 border-rose-400/60 p-3 rounded-2xl text-rose-200 text-xs font-bold flex items-center justify-between">
          <span>⚠️ {micError}</span>
          <button type="button" onClick={() => setMicError(null)} className="font-black text-sm px-2">✕</button>
        </div>
      )}

      {/* Category Pills */}
      <div className="grid grid-cols-3 gap-1.5 bg-indigo-950/70 p-1.5 rounded-2xl text-xs font-black">
        {[
          { id: 'numbers', labelBm: '🔢 Nombor', labelEn: '🔢 Numbers' },
          { id: 'feedback', labelBm: '⭐ Kata Pujian', labelEn: '⭐ Praise' },
          { id: 'math', labelBm: '➕ Simbol', labelEn: '➕ Symbols' },
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveCategory(cat.id as any);
            }}
            className={`py-2 px-1 rounded-xl transition-all text-center ${
              activeCategory === cat.id
                ? 'bg-amber-400 text-indigo-950 shadow-md font-black'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            {language === 'bm' ? cat.labelBm : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Number Range Toggle */}
      {activeCategory === 'numbers' && (
        <div className="flex justify-between items-center px-1">
          <span className="text-xs text-slate-400 font-bold">
            {language === 'bm' ? 'Pilihan Nombor:' : 'Number Range:'}
          </span>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowExtendedNumbers(prev => !prev);
            }}
            className="text-xs font-black text-amber-400 hover:text-amber-300 bg-indigo-900/60 px-3 py-1 rounded-xl border border-indigo-500/40"
          >
            {showExtendedNumbers
              ? (language === 'bm' ? 'Tunjuk 0–10 Sahaja' : 'Show 0–10 Only')
              : (language === 'bm' ? '+ Tambah Nombor 11–20' : '+ Add Numbers 11–20')}
          </button>
        </div>
      )}

      {/* Item Recording Cards List */}
      <div className="flex flex-col gap-2.5">
        {currentItems.map((item) => {
          const isRecorded = customKeys.has(item.key);
          const isCurrentRecording = recordingKey === item.key;

          return (
            <div
              key={item.key}
              className={`p-3.5 rounded-3xl border-2 transition-all flex items-center justify-between gap-3 ${
                isCurrentRecording
                  ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-400/50 shadow-lg animate-pulse'
                  : isRecorded
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow'
                  : 'bg-white/5 border-slate-700/60 hover:border-indigo-400/40'
              }`}
            >
              {/* Info Column */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-white">
                    {language === 'bm' ? item.labelBm : item.labelEn}
                  </span>
                  {isRecorded && (
                    <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/50">
                      ✓ {language === 'bm' ? 'Suara Anak' : 'Custom'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-bold truncate mt-0.5">
                  {isCurrentRecording ? (
                    <span className="text-rose-300 font-black animate-bounce-gentle">
                      🔴 {language === 'bm' ? 'Sedang Merakam...' : 'Recording...'} (0:0{recordingSeconds}s)
                    </span>
                  ) : (
                    <span>💡 {language === 'bm' ? item.promptBm : item.promptEn}</span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Record Button */}
                <button
                  type="button"
                  onClick={() => handleStartRecording(item.key)}
                  className={`btn-fun px-3 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow transition-transform ${
                    isCurrentRecording
                      ? 'bg-rose-600 text-white hover:bg-rose-500 animate-bounce-gentle'
                      : isRecorded
                      ? 'bg-indigo-800/80 text-white hover:bg-indigo-700 border border-indigo-500/40'
                      : 'bg-amber-400 text-indigo-950 hover:bg-amber-300'
                  }`}
                  title={isCurrentRecording ? 'Berhenti Rakam' : 'Mula Rakam'}
                >
                  {isCurrentRecording ? (
                    <>
                      <span>⏹️</span>
                      <span>{language === 'bm' ? 'Henti' : 'Stop'}</span>
                    </>
                  ) : (
                    <>
                      <span>🔴</span>
                      <span>{isRecorded ? (language === 'bm' ? 'Ulang' : 'Re-record') : (language === 'bm' ? 'Rakam' : 'Record')}</span>
                    </>
                  )}
                </button>

                {/* Play Preview Button */}
                <button
                  type="button"
                  onClick={() => handlePlayItem(item.key)}
                  disabled={isCurrentRecording}
                  className="btn-fun bg-slate-800 hover:bg-slate-700 text-slate-100 p-2.5 rounded-2xl text-xs disabled:opacity-30 border border-slate-600/50"
                  title="Dengar Suara"
                >
                  ▶️
                </button>

                {/* Delete / Revert Button */}
                {isRecorded && (
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.key)}
                    disabled={isCurrentRecording}
                    className="text-slate-400 hover:text-rose-400 p-2 rounded-xl text-xs hover:bg-rose-500/10 transition-colors"
                    title={language === 'bm' ? 'Kembali ke suara asal' : 'Revert to default'}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful Parent Guide Footer */}
      <div className="bg-indigo-950/60 p-3.5 rounded-3xl border border-indigo-500/30 text-[11px] font-bold text-indigo-200 leading-relaxed mt-2">
        <div className="font-black text-amber-300 flex items-center gap-1.5 mb-1">
          <span>💡</span>
          <span>{language === 'bm' ? 'Panduan Santai Merakam Bersama Anak:' : 'Tips for Recording with Children:'}</span>
        </div>
        <ul className="list-disc pl-4 space-y-1 text-slate-300">
          <li>Duduk bersama anak dalam suasana tenang dan tidak bising.</li>
          <li>Tekan <strong>🔴 Rakam</strong>, biarkan anak menyebut perkataan dengan riang, kemudian tekan <strong>⏹️ Henti</strong>.</li>
          <li>Tekan butang <strong>▶️</strong> untuk mendengar semula rakaman.</li>
          <li>Aplikasi akan <strong>automatik menyimpan</strong> suara ini dalam peranti anda dan memainkannya setiap kali anak mengira atau menjawab soalan!</li>
        </ul>
      </div>
    </div>
  );
};
