// Text-To-Speech (TTS) Voice Engine with Authentic Bahasa Melayu (Malaysia) Audio Bank
// Supports Custom Family Voice Recordings (Stored in IndexedDB)
// Falls back to pre-recorded studio Malaysian audio for numbers 0-100, math terms, and feedback
// Streams authentic Google Malaysian Malay TTS for dynamic questions
import { Language } from '../types/curriculum';
import { numberToWords } from '../utils/numberWords';
import { storage } from './storage';
import { pitchShiftBuffer } from './pitchShift';

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
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private decodedCache: Map<string, AudioBuffer> = new Map();
  private shiftedCache: Map<string, AudioBuffer> = new Map();
  private playToken: number = 0;
  private queuedSpeech: { text: string; lang: Language } | null = null;
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
    // Any in-flight async playback checks this token and aborts itself
    this.playToken++;
    this.queuedSpeech = null;

    if (this.currentSource) {
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
      } catch {
        // ignore
      }
      this.currentSource = null;
    }

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

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      try {
        this.audioCtx = new Ctor();
      } catch {
        return null;
      }
    }
    return this.audioCtx;
  }

  /**
   * How far above the original recording the voice should sit.
   * The studio bank and the streamed TTS are both adult voices, so the kid personas
   * lift them; 1.35 is roughly +5 semitones, which reads as a young child.
   */
  public getShiftRatio(): number {
    if (this.voicePersona === 'adult') return 1;
    return Math.max(1, Math.min(1.5, this.voicePitch));
  }

  private rememberBuffer(cache: Map<string, AudioBuffer>, key: string, buffer: AudioBuffer) {
    // Dynamic sentences produce a new URL every time, so the caches need a ceiling
    if (cache.size >= 60) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(key, buffer);
  }

  private async loadShiftedBuffer(ctx: AudioContext, url: string, ratio: number): Promise<AudioBuffer> {
    const key = `${url}|${ratio.toFixed(2)}`;
    const ready = this.shiftedCache.get(key);
    if (ready) return ready;

    let decoded = this.decodedCache.get(url);
    if (!decoded) {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`audio fetch failed: ${response.status}`);
      const bytes = await response.arrayBuffer();
      decoded = await ctx.decodeAudioData(bytes);
      this.rememberBuffer(this.decodedCache, url, decoded);
    }

    const shifted = pitchShiftBuffer(ctx, decoded, ratio);
    this.rememberBuffer(this.shiftedCache, key, shifted);
    return shifted;
  }

  private playElement(url: string, rate: number, token: number, onEnd?: () => void, onFail?: () => void): boolean {
    try {
      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.playbackRate = rate;
      // Only the last-resort path trades tempo for pitch; Web Audio keeps them separate
      (audio as any).preservesPitch = rate === 1;

      let finished = false;
      const finish = (failed: boolean) => {
        if (finished || token !== this.playToken) return;
        finished = true;
        this.notifyState(false);
        this.currentAudio = null;
        if (failed && onFail) onFail();
        else if (onEnd) onEnd();
      };

      audio.onended = () => finish(false);
      audio.onerror = () => finish(true);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => finish(true));
      }
      return true;
    } catch {
      if (token === this.playToken) {
        this.notifyState(false);
        this.currentAudio = null;
        if (onFail) onFail();
        else if (onEnd) onEnd();
      }
      return false;
    }
  }

  private async playShifted(url: string, ratio: number, token: number, onEnd?: () => void, onFail?: () => void) {
    try {
      const ctx = this.getContext();
      if (!ctx) throw new Error('no audio context');

      const buffer = await this.loadShiftedBuffer(ctx, url, ratio);
      if (token !== this.playToken) return;

      if (ctx.state === 'suspended') {
        await ctx.resume();
        if (token !== this.playToken) return;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 1; // pitch already handled offline, so speech keeps its pace
      source.connect(ctx.destination);
      this.currentSource = source;

      source.onended = () => {
        if (token !== this.playToken) return;
        this.currentSource = null;
        this.notifyState(false);
        if (onEnd) onEnd();
      };

      source.start();
    } catch {
      if (token !== this.playToken) return;
      // Web Audio unavailable (or the file could not be decoded): fall back to the
      // plain element, capped so the speech never becomes too fast to follow.
      this.playElement(url, Math.min(1.2, ratio), token, onEnd, onFail);
    }
  }

  /**
   * Plays an audio URL.
   * A child's own recording is played untouched. Studio/TTS audio is pitch-shifted
   * into a kid register without altering its tempo.
   */
  public playAudio(url: string, isCustom: boolean = false, onEnd?: () => void, onFail?: () => void): boolean {
    this.stop();
    const token = ++this.playToken;
    const ratio = isCustom ? 1 : this.getShiftRatio();

    this.notifyState(true);

    if (ratio <= 1.01) {
      return this.playElement(url, 1, token, onEnd, onFail);
    }

    void this.playShifted(url, ratio, token, onEnd, onFail);
    return true;
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

    // English — a lighter, female-sounding voice carries the kid personas better
    const isEnglish = (v: SpeechSynthesisVoice) =>
      v.lang.toLowerCase().startsWith('en') && !this.isIndonesianVoice(v);

    if (this.voicePersona !== 'adult') {
      const lightNames = /zira|samantha|karen|moira|tessa|fiona|aria|jenny|sonia|natasha|female|girl|kid|child/i;
      const light = this.voices.find(v => isEnglish(v) && lightNames.test(v.name));
      if (light) return light;
    }

    const enVoice = this.voices.find(isEnglish);
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

  /**
   * Warms the cache for a phrase that is about to be needed, so the first play
   * has no fetch/decode delay. Best effort: failures are silently ignored.
   */
  public async prefetch(text: string, lang: Language): Promise<void> {
    if (lang !== 'bm' || !text) return;
    const match = this.matchAudioItem(text);
    if (!match || match.isCustom) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      await this.loadShiftedBuffer(ctx, match.url, this.getShiftRatio());
    } catch {
      // The word will simply load on demand instead
    }
  }

  /**
   * Speaks without cutting off whatever is already talking.
   * Counting out loud is the case that needs this: a child taps faster than the
   * words play, and plain speak() would chop every number into "sa-, du-, ti-".
   * Only the newest pending word is kept, so the voice never trails more than
   * one word behind the taps.
   */
  public speakInSequence(text: string, lang: Language) {
    if (!this.isVoiceEnabled || !text) return;

    if (this.isSpeaking()) {
      this.queuedSpeech = { text, lang };
      return;
    }

    this.speakChained(text, lang);
  }

  private speakChained(text: string, lang: Language) {
    this.speak(text, lang, () => {
      // Captured before speak() runs again, since speak() clears the queue
      const next = this.queuedSpeech;
      this.queuedSpeech = null;
      if (next) this.speakChained(next.text, next.lang);
    });
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
        this.playAudio(audioMatch.url, audioMatch.isCustom, onEnd, () => {
          // Bank file missing or not cached yet — say it with the synthesizer instead
          this.fallbackSpeechSynthesis(this.preprocessPhonetics(text, 'bm'), 'bm', onEnd);
        });
        return;
      }

      // 2. Stream authentic Malaysian Malay speech via local /api/tts proxy
      const cleanText = this.preprocessPhonetics(text, 'bm');
      const dynamicUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=ms`;

      this.playAudio(dynamicUrl, false, onEnd, () => {
        // No TTS endpoint reachable (offline, or a static build with no proxy)
        this.fallbackSpeechSynthesis(cleanText, 'bm', onEnd);
      });
      return;
    }

    // English
    const cleanText = this.preprocessPhonetics(text, 'en');
    this.fallbackSpeechSynthesis(cleanText, 'en', onEnd);
  }
}

export const voiceService = new VoiceEngine();
