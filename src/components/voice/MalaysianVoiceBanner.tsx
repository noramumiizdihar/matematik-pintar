import React, { useState, useEffect } from 'react';
import { Language } from '../../types/curriculum';
import { voiceService } from '../../services/voice';

interface MalaysianVoiceBannerProps {
  language: Language;
}

export const MalaysianVoiceBanner: React.FC<MalaysianVoiceBannerProps> = ({ language }) => {
  const [hasMalayVoice, setHasMalayVoice] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('dismiss_ms_voice_banner') === 'true';
  });
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    setHasMalayVoice(voiceService.hasMalaysianVoice());

    // Subscribe to voice changes (browsers load voices asynchronously)
    const unsubscribe = voiceService.onVoicesLoaded(() => {
      setHasMalayVoice(voiceService.hasMalaysianVoice());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Only show if language is BM, no authentic Malaysian voice is installed in current browser,
  // and the user has not dismissed it
  if (language !== 'bm' || hasMalayVoice || isDismissed) {
    return null;
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173/';
  const edgeProtocolUrl = `microsoft-edge:${currentUrl}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dismiss_ms_voice_banner', 'true');
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-900/90 via-indigo-950/95 to-slate-900 border-b-2 border-amber-400/50 px-3 py-2 text-xs text-amber-100 flex flex-wrap items-center justify-between gap-2 shadow-md animate-fadeIn z-30">
      <div className="flex items-center gap-2 flex-1 min-w-[240px]">
        <span className="text-xl animate-bounce-gentle">🇲🇾</span>
        <div className="leading-snug">
          <p className="font-black text-amber-300 text-[11px] md:text-xs">
            Dapatkan Suara Pure Melayu (Yasmin) Bertona Budak Comel
          </p>
          <p className="text-[10px] md:text-[11px] text-slate-300">
            Google Chrome di Windows tiada suara Melayu. Buka dalam <strong className="text-white">Microsoft Edge</strong> untuk suara asli Malaysia!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <a
          href={edgeProtocolUrl}
          className="btn-fun bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1 shadow transition-transform active:scale-95"
        >
          <span>🚀</span>
          <span>Buka di Edge</span>
        </a>

        <button
          type="button"
          onClick={handleCopyLink}
          className="bg-indigo-800/90 hover:bg-indigo-700 text-indigo-100 font-bold px-2 py-1 rounded-xl text-[11px] border border-indigo-600/50"
          title="Salin Pautan"
        >
          {copied ? '✓ Disalin' : '📋 Salin'}
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white text-sm font-bold px-1.5 py-0.5 rounded-lg hover:bg-white/10"
          title="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
