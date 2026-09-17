// Text-To-Speech (TTS) Voice Engine with Authentic Bahasa Melayu (Malaysia) Audio Bank
// Supports Custom Family Voice Recordings (Stored in IndexedDB)
// Falls back to pre-recorded studio Malaysian audio for numbers 0-100, math terms, and feedback
// Streams authentic Google Malaysian Malay TTS for dynamic questions
import { Language } from '../types/curriculum';
import { numberToWords } from '../utils/numberWords';
import { storage } from './storage';

export interface VoiceOption {
  uri: string;
  name: string;
  lang: string;
  isMalaysian: boolean;
  isIndonesian: boolean;
}

const INDONESIAN_VOICE_REGEX = /indonesia|id-id|id_id|\bgadis\b|\bardi\b|\bandika\b|\bdita\b/i;

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
  private customAudioUrls: Map<string, string> = new Map();
  private onStateChangeListeners: ((isSpeaking: boolean) => void)[] = [];
  private onVoicesChangedListeners: (() => void)[] = [];
  private onCustomAudioChangedListeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }

      window.speechSynthesis.addEventListener?.('voiceschanged', () => this.loadVoices());
    }

    // Load any custom child voice recordings from IndexedDB
    this.initCustomAudio();
  }

  private loadVoices() {
    if (!this.synth) return;
    const vList = this.synth.getVoices();
    if (vList && vList.length > 0) {
      this.voices = vList;
      this.onVoicesChangedListeners.forEach(cb => cb());
    }
  }

  // --- Custom Voice Audio Management ---
  public async initCustomAudio(): Promise<void> {
    try {
      const records = await storage.getAllCustomAudio();
      Object.entries(records).forEach(([key, blob]) => {
        const old = this.customAudioUrls.get(key);
        if (old) URL.revokeObjectURL(old);
        this.customAudioUrls.set(key, URL.createObjectURL(blob));
      });
      this.notifyCustomAudioChanged();
    } catch {
      // Ignored
    }
  }

  public async registerCustomAudio(key: string, blob: Blob): Promise<void> {
    await storage.saveCustomAudio(key, blob);
    const old = this.customAudioUrls.get(key);
    if (old) URL.revokeObjectURL(old);
    this.customAudioUrls.set(key, URL.createObjectURL(blob));
    this.notifyCustomAudioChanged();
  }

  public async unregisterCustomAudio(key: string): Promise<void> {
    await storage.deleteCustomAudio(key);
    const old = this.customAudioUrls.get(key);
    if (old) URL.revokeObjectURL(old);
    this.customAudioUrls.delete(key);
    this.notifyCustomAudioChanged();
  }

  public async resetAllCustomAudio(): Promise<void> {
    await storage.resetAllCustomAudio();
    this.customAudioUrls.forEach(url => URL.revokeObjectURL(url));
    this.customAudioUrls.clear();
    this.notifyCustomAudioChanged();
  }

  public hasCustomAudio(key: string): boolean {
    return this.customAudioUrls.has(key);
  }

  public getCustomAudioUrl(key: string): string | undefined {
    return this.customAudioUrls.get(key);
  }

  public getAllCustomAudioKeys(): string[] {
    return Array.from(this.customAudioUrls.keys());
  }

  public onCustomAudioChanged(cb: () => void) {
    this.onCustomAudioChangedListeners.push(cb);
    return () => {
      this.onCustomAudioChangedListeners = this.onCustomAudioChangedListeners.filter(l => l !== cb);
    };
  }

  private notifyCustomAudioChanged() {
    this.onCustomAudioChangedListeners.forEach(cb => cb());
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

  /**
   * Plays an audio URL.
   * If isCustom is true, plays at natural 1.0x speed with preserved pitch.
   * If isCustom is false, applies gentle child-tone pitch shift.
   */
  public playAudio(url: string, isCustom: boolean = false, onEnd?: () => void): boolean {
    try {
      this.stop();

      const audio = new Audio(url);
      this.currentAudio = audio;

      if (isCustom) {
        // Child's own recorded voice: play completely naturally
        audio.playbackRate = 1.0;
        (audio as any).preservesPitch = true;
      } else {
        // Studio sample: shift pitch to cheerful kid tone
        (audio as any).preservesPitch = false;
        const rate = this.voicePersona === 'child' ? 1.15 : this.voicePersona === 'gentle' ? 1.08 : 1.0;
        audio.playbackRate = rate;
      }

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

  /**
   * Match text against custom recorded audio and studio audio bank
   */
  private matchAudioItem(text: string): { url: string; isCustom: boolean } | null {
    const trimmed = text.trim().toLowerCase();

    // 1. Direct number matching (e.g. "8", "8.", "8. lapan", "lapan", "25", "100")
    const leadingNumMatch = trimmed.match(/^(\d+)(?:\.|$|\s)/);
    let numVal: number | null = null;
    if (leadingNumMatch) {
      numVal = parseInt(leadingNumMatch[1], 10);
    } else {
      const malayNumberWords: Record<string, number> = {
        'sifar': 0, 'kosong': 0, 'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
        'enam': 6, 'tujuh': 7, 'lapan': 8, 'sembilan': 9, 'sepuluh': 10,
        'sebelas': 11, 'dua belas': 12, 'tiga belas': 13, 'empat belas': 14, 'lima belas': 15,
        'enam belas': 16, 'tujuh belas': 17, 'lapan belas': 18, 'sembilan belas': 19, 'dua puluh': 20,
        'seratus': 100
      };
      if (malayNumberWords[trimmed] !== undefined) {
        numVal = malayNumberWords[trimmed];
      }
    }

    if (numVal !== null && numVal >= 0 && numVal <= 100) {
      const customKey = `num_${numVal}`;
      if (this.customAudioUrls.has(customKey)) {
        return { url: this.customAudioUrls.get(customKey)!, isCustom: true };
      }
      return { url: `/audio/ms/numbers/${numVal}.mp3`, isCustom: false };
    }

    // 2. Feedback phrases
    const feedbackMap: [string[], string, string][] = [
      [['syabas', 'hebat sekali'], 'fb_syabas', 'syabas'],
      [['tepat sekali', 'anda sangat bijak', 'tepat'], 'fb_tepat', 'tepat'],
      [['bagus', 'teruskan usaha'], 'fb_bagus', 'bagus'],
      [['hebat', 'jawapan betul'], 'fb_hebat', 'hebat'],
      [['cuba lagi', 'hampir betul'], 'fb_cuba_lagi', 'cuba_lagi'],
      [['jangan putus asa'], 'fb_jangan_putus_asa', 'jangan_putus_asa'],
      [['pasti boleh'], 'fb_pasti_boleh', 'pasti_boleh']
    ];

    for (const [keywords, customKey, fileKey] of feedbackMap) {
      if (keywords.some(kw => trimmed.includes(kw))) {
        if (this.customAudioUrls.has(customKey)) {
          return { url: this.customAudioUrls.get(customKey)!, isCustom: true };
        }
        return { url: `/audio/ms/feedback/${fileKey}.mp3`, isCustom: false };
      }
    }

    // 3. Math operators & units
    const mathMap: [string[], string, string][] = [
      [['tambah', '+'], 'math_tambah', 'tambah'],
      [['tolak', '-'], 'math_tolak', 'tolak'],
      [['darab', '×', '*'], 'math_darab', 'darab'],
      [['bahagi', '÷'], 'math_bahagi', 'bahagi'],
      [['sama dengan', '='], 'math_sama_dengan', 'sama_dengan'],
      [['ringgit', 'rm'], 'math_ringgit', 'ringgit'],
      [['sen'], 'math_sen', 'sen'],
      [['sa'], 'math_sa', 'sa'],
      [['puluh'], 'math_puluh', 'puluh'],
      [['ratus'], 'math_ratus', 'ratus'],
      [['ribu'], 'math_ribu', 'ribu'],
      [['sentimeter'], 'math_sentimeter', 'sentimeter'],
      [['kilogram'], 'math_kilogram', 'kilogram'],
      [['meter'], 'math_meter', 'meter'],
      [['liter'], 'math_liter', 'liter']
    ];

    for (const [keywords, customKey, fileKey] of mathMap) {
      if (keywords.some(kw => trimmed === kw)) {
        if (this.customAudioUrls.has(customKey)) {
          return { url: this.customAudioUrls.get(customKey)!, isCustom: true };
        }
        return { url: `/audio/ms/math/${fileKey}.mp3`, isCustom: false };
      }
    }

    return null;
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
      // 1. Check for custom child voice recording OR studio soundbank audio
      const audioMatch = this.matchAudioItem(text);
      if (audioMatch) {
        this.playAudio(audioMatch.url, audioMatch.isCustom, onEnd);
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
