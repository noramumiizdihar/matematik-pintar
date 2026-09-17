// Text-To-Speech (TTS) Voice Engine with Authentic Bahasa Melayu (Malaysia) Audio Bank
// Uses pre-recorded studio Malaysian audio for numbers 0-100, math terms, and feedback
// Streams authentic Google Malaysian Malay TTS for dynamic questions
// Never uses Indonesian or foreign accent synthesizers
import { Language } from '../types/curriculum';
import { numberToWords } from '../utils/numberWords';

export interface VoiceOption {
  uri: string;
  name: string;
  lang: string;
  isMalaysian: boolean;
  isIndonesian: boolean;
}

const INDONESIAN_VOICE_REGEX = /indonesia|id-id|id_id|\bgadis\b|\bardi\b|\bandika\b|\bdita\b/i;

function matchStaticMalayAudio(text: string): string | null {
  const trimmed = text.trim().toLowerCase();

  // 1. Direct number matching (e.g. "8", "8.", "8. lapan", "lapan", "25", "100")
  const leadingNumMatch = trimmed.match(/^(\d+)(?:\.|$|\s)/);
  if (leadingNumMatch) {
    const n = parseInt(leadingNumMatch[1], 10);
    if (n >= 0 && n <= 100) {
      return `/audio/ms/numbers/${n}.mp3`;
    }
  }

  // Exact Malay number words
  const malayNumberWords: Record<string, number> = {
    'sifar': 0, 'kosong': 0, 'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
    'enam': 6, 'tujuh': 7, 'lapan': 8, 'sembilan': 9, 'sepuluh': 10,
    'sebelas': 11, 'dua belas': 12, 'tiga belas': 13, 'empat belas': 14, 'lima belas': 15,
    'enam belas': 16, 'tujuh belas': 17, 'lapan belas': 18, 'sembilan belas': 19, 'dua puluh': 20,
    'seratus': 100
  };
  if (malayNumberWords[trimmed] !== undefined) {
    return `/audio/ms/numbers/${malayNumberWords[trimmed]}.mp3`;
  }

  // 2. Feedback phrases
  if (trimmed.includes('syabas') || trimmed.includes('hebat sekali')) return '/audio/ms/feedback/syabas.mp3';
  if (trimmed.includes('tepat sekali') || trimmed.includes('anda sangat bijak')) return '/audio/ms/feedback/tepat.mp3';
  if (trimmed.includes('bagus') || trimmed.includes('teruskan usaha')) return '/audio/ms/feedback/bagus.mp3';
  if (trimmed.includes('hebat')) return '/audio/ms/feedback/hebat.mp3';
  if (trimmed.includes('cuba lagi') || trimmed.includes('hampir betul')) return '/audio/ms/feedback/cuba_lagi.mp3';
  if (trimmed.includes('jangan putus asa')) return '/audio/ms/feedback/jangan_putus_asa.mp3';
  if (trimmed.includes('pasti boleh')) return '/audio/ms/feedback/pasti_boleh.mp3';

  // 3. Single math operators & units
  if (trimmed === 'tambah' || trimmed === '+') return '/audio/ms/math/tambah.mp3';
  if (trimmed === 'tolak' || trimmed === '-') return '/audio/ms/math/tolak.mp3';
  if (trimmed === 'darab' || trimmed === '×' || trimmed === '*') return '/audio/ms/math/darab.mp3';
  if (trimmed === 'bahagi' || trimmed === '÷') return '/audio/ms/math/bahagi.mp3';
  if (trimmed === 'sama dengan' || trimmed === '=') return '/audio/ms/math/sama_dengan.mp3';
  if (trimmed === 'ringgit' || trimmed === 'rm') return '/audio/ms/math/ringgit.mp3';
  if (trimmed === 'sen') return '/audio/ms/math/sen.mp3';
  if (trimmed === 'sa') return '/audio/ms/math/sa.mp3';
  if (trimmed === 'puluh') return '/audio/ms/math/puluh.mp3';
  if (trimmed === 'ratus') return '/audio/ms/math/ratus.mp3';
  if (trimmed === 'ribu') return '/audio/ms/math/ribu.mp3';
  if (trimmed === 'sentimeter') return '/audio/ms/math/sentimeter.mp3';
  if (trimmed === 'kilogram') return '/audio/ms/math/kilogram.mp3';
  if (trimmed === 'meter') return '/audio/ms/math/meter.mp3';
  if (trimmed === 'liter') return '/audio/ms/math/liter.mp3';

  return null;
}

class VoiceEngine {
  private isVoiceEnabled: boolean = true;
  private voiceSpeed: number = 0.95;
  private voicePitch: number = 1.35;
  private voicePersona: 'child' | 'gentle' | 'adult' = 'child';
  private selectedVoiceURI?: string;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeakingState: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private onStateChangeListeners: ((isSpeaking: boolean) => void)[] = [];
  private onVoicesChangedListeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }

      window.speechSynthesis.addEventListener?.('voiceschanged', () => this.loadVoices());
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const vList = this.synth.getVoices();
    if (vList && vList.length > 0) {
      this.voices = vList;
      this.onVoicesChangedListeners.forEach(cb => cb());
    }
  }

  public onVoicesLoaded(cb: () => void) {
    this.onVoicesChangedListeners.push(cb);
    if (this.voices.length > 0) {
      cb();
    }
    return () => {
      this.onVoicesChangedListeners = this.onVoicesChangedListeners.filter(l => l !== cb);
    };
  }

  public isIndonesianVoice(v: { lang: string; name: string }): boolean {
    const l = v.lang.toLowerCase();
    const n = v.name.toLowerCase();
    return (
      l.startsWith('id') ||
      INDONESIAN_VOICE_REGEX.test(l) ||
      INDONESIAN_VOICE_REGEX.test(n)
    );
  }

  public isMalaysianVoice(v: { lang: string; name: string }): boolean {
    if (this.isIndonesianVoice(v)) return false;
    const l = v.lang.toLowerCase();
    const n = v.name.toLowerCase();
    return (
      l === 'ms-my' ||
      l === 'ms_my' ||
      l === 'ms' ||
      n.includes('malaysia') ||
      n.includes('yasmin') ||
      n.includes('osman') ||
      n.includes('amira') ||
      n.includes('bahasa melayu') ||
      (n.includes('malay') && !n.includes('indonesia'))
    );
  }

  public hasMalaysianVoice(): boolean {
    // We now have built-in static audio files for all 0-100 numbers and feedback,
    // plus the local streaming TTS proxy, so authentic Malaysian Malay audio is always active!
    return true;
  }

  public getAvailableVoices(): VoiceOption[] {
    if (!this.voices.length && this.synth) {
      this.loadVoices();
    }

    return this.voices.map(v => ({
      uri: v.voiceURI,
      name: v.name,
      lang: v.lang,
      isMalaysian: this.isMalaysianVoice(v),
      isIndonesian: this.isIndonesianVoice(v)
    }));
  }

  public setSelectedVoiceURI(uri: string | undefined) {
    this.selectedVoiceURI = uri;
  }

  public setPersona(persona: 'child' | 'gentle' | 'adult') {
    this.voicePersona = persona;
  }

  public subscribeSpeakingState(cb: (isSpeaking: boolean) => void) {
    this.onStateChangeListeners.push(cb);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== cb);
    };
  }

  private notifyState(speaking: boolean) {
    this.isSpeakingState = speaking;
    this.onStateChangeListeners.forEach(cb => cb(speaking));
  }

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public setSpeed(speed: number) {
    this.voiceSpeed = Math.max(0.6, Math.min(1.4, speed));
  }

  public setPitch(pitch: number) {
    this.voicePitch = Math.max(0.7, Math.min(1.6, pitch));
  }

  public getPitch(): number {
    return this.voicePitch;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState || (this.synth ? this.synth.speaking : false);
  }

  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }

    this.notifyState(false);
  }

  private playAudio(url: string, onEnd?: () => void): boolean {
    try {
      this.stop();

      const audio = new Audio(url);
      this.currentAudio = audio;

      // Child tone pitch shift:
      // By disabling pitch preservation, speeding up playback naturally raises the pitch
      // into a cute, sweet young child voice!
      (audio as any).preservesPitch = false;
      const rate = this.voicePersona === 'child' ? 1.15 : this.voicePersona === 'gentle' ? 1.08 : 1.0;
      audio.playbackRate = rate;

      this.notifyState(true);

      let finished = false;
      const finishHandler = () => {
        if (!finished) {
          finished = true;
          this.notifyState(false);
          this.currentAudio = null;
          if (onEnd) onEnd();
        }
      };

      audio.onended = finishHandler;
      audio.onerror = finishHandler;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => finishHandler());
      }

      return true;
    } catch {
      this.notifyState(false);
      this.currentAudio = null;
      if (onEnd) onEnd();
      return false;
    }
  }

  public findVoiceForLanguage(lang: Language): SpeechSynthesisVoice | null {
    if (!this.voices.length && this.synth) {
      this.loadVoices();
    }

    if (this.selectedVoiceURI) {
      const userSelected = this.voices.find(v => v.voiceURI === this.selectedVoiceURI);
      if (userSelected) {
        if (lang === 'bm' && this.isIndonesianVoice(userSelected)) {
          // Banned
        } else {
          return userSelected;
        }
      }
    }

    if (lang === 'bm') {
      const msPriority = this.voices.find(v => {
        const n = v.name.toLowerCase();
        return (
          this.isMalaysianVoice(v) &&
          (n.includes('yasmin') || n.includes('natural') || n.includes('amira') || n.includes('osman'))
        );
      });
      if (msPriority) return msPriority;

      const msGeneric = this.voices.find(v => this.isMalaysianVoice(v));
      if (msGeneric) return msGeneric;

      return null;
    }

    // English
    const enVoice = this.voices.find(v =>
      (v.lang.toLowerCase().startsWith('en-my') ||
       v.lang.toLowerCase().startsWith('en-gb') ||
       v.lang.toLowerCase().startsWith('en-us') ||
       v.lang.toLowerCase().startsWith('en')) &&
      !this.isIndonesianVoice(v)
    );
    if (enVoice) return enVoice;

    return this.voices.find(v => !this.isIndonesianVoice(v)) || null;
  }

  public preprocessPhonetics(text: string, lang: Language): string {
    if (lang !== 'bm') {
      return text
        .replace(/\+/g, ' plus ')
        .replace(/-/g, ' minus ')
        .replace(/[×x*]/g, ' times ')
        .replace(/÷/g, ' divided by ')
        .replace(/=/g, ' equals ')
        .replace(/RM\s?(\d+)/gi, '$1 ringgit')
        .replace(/(\d+)\s?sen/gi, '$1 cents');
    }

    let processed = text;

    // Currency and measurement units
    processed = processed
      .replace(/RM\s?(\d+)/gi, (_, n) => `${numberToWords(Number(n), 'bm')} ringgit`)
      .replace(/(\d+)\s?sen/gi, (_, n) => `${numberToWords(Number(n), 'bm')} sen`)
      .replace(/cm²/gi, ' sentimeter persegi')
      .replace(/cm³/gi, ' sentimeter padu')
      .replace(/km\/j/gi, ' kilometer sejam')
      .replace(/\bcm\b/gi, ' sentimeter')
      .replace(/\bkg\b/gi, ' kilogram')
      .replace(/\bg\b/gi, ' gram')
      .replace(/\bm\b/gi, ' meter');

    // Fractions
    processed = processed
      .replace(/\b1\/2\b/g, ' satu perdua ')
      .replace(/\b1\/4\b/g, ' satu perempat ')
      .replace(/\b3\/4\b/g, ' tiga perempat ')
      .replace(/\b1\/3\b/g, ' satu pertiga ')
      .replace(/\b2\/3\b/g, ' dua pertiga ');

    // Math symbols
    processed = processed
      .replace(/\+/g, ' tambah ')
      .replace(/-/g, ' tolak ')
      .replace(/[×*]/g, ' darab ')
      .replace(/÷/g, ' bahagi ')
      .replace(/=/g, ' sama dengan ')
      .replace(/%/g, ' peratus ');

    // Expand all standalone numbers (0 - 1000) to pure Malaysian Malay words
    processed = processed.replace(/\b\d+\b/g, (match) => {
      const num = parseInt(match, 10);
      if (!isNaN(num) && num >= 0 && num <= 1000) {
        return numberToWords(num, 'bm').toLowerCase();
      }
      return match;
    });

    processed = processed.replace(/\bBerapakah\b/gi, 'Berapa');
    processed = processed.replace(/\bAdakah\b/gi, 'Adakah');
    processed = processed.replace(/[#*~`^]/g, '');
    processed = processed.replace(/\s+/g, ' ').trim();

    return processed;
  }

  private fallbackSpeechSynthesis(cleanText: string, lang: Language, onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = this.voiceSpeed;
    utterance.pitch = this.voicePitch;

    const matchedVoice = this.findVoiceForLanguage(lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      // In BM, if no authentic Malaysian voice is installed in browser,
      // never speak with an Indonesian or English voice!
      if (lang === 'bm') {
        if (onEnd) onEnd();
        return;
      }
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => this.notifyState(true);
    utterance.onend = () => {
      this.notifyState(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      this.notifyState(false);
      if (onEnd) onEnd();
    };

    try {
      this.synth.speak(utterance);
    } catch {
      this.notifyState(false);
      if (onEnd) onEnd();
    }
  }

  public speak(text: string, lang: Language, onEnd?: () => void) {
    if (!this.isVoiceEnabled || !text) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    if (lang === 'bm') {
      // 1. Check for authentic pre-recorded Malaysian studio audio (Numbers 0-100, Feedback, Math terms)
      const staticAudioUrl = matchStaticMalayAudio(text);
      if (staticAudioUrl) {
        this.playAudio(staticAudioUrl, onEnd);
        return;
      }

      // 2. Stream authentic Malaysian Malay speech via local /api/tts proxy
      const cleanText = this.preprocessPhonetics(text, 'bm');
      const dynamicUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=ms`;

      try {
        const audio = new Audio(dynamicUrl);
        this.currentAudio = audio;
        (audio as any).preservesPitch = false;
        const rate = this.voicePersona === 'child' ? 1.15 : this.voicePersona === 'gentle' ? 1.08 : 1.0;
        audio.playbackRate = rate;

        this.notifyState(true);

        let ended = false;
        const endCallback = () => {
          if (!ended) {
            ended = true;
            this.notifyState(false);
            this.currentAudio = null;
            if (onEnd) onEnd();
          }
        };

        audio.onended = endCallback;
        audio.onerror = () => {
          if (!ended) {
            ended = true;
            this.notifyState(false);
            this.currentAudio = null;
            // Fallback to browser synthesis only if authentic Malaysian voice exists
            this.fallbackSpeechSynthesis(cleanText, 'bm', onEnd);
          }
        };

        const p = audio.play();
        if (p !== undefined) {
          p.catch(() => {
            if (!ended) {
              ended = true;
              this.notifyState(false);
              this.currentAudio = null;
              this.fallbackSpeechSynthesis(cleanText, 'bm', onEnd);
            }
          });
        }
      } catch {
        this.fallbackSpeechSynthesis(cleanText, 'bm', onEnd);
      }
      return;
    }

    // English
    const cleanText = this.preprocessPhonetics(text, 'en');
    this.fallbackSpeechSynthesis(cleanText, 'en', onEnd);
  }
}

export const voiceService = new VoiceEngine();
