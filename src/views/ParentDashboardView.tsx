import React, { useState, useEffect } from 'react';
import { Language, UserStats, UserSettings, TopicProgress, QuestionAttemptLog } from '../types/curriculum';
import { CURRICULUM_LEVELS } from '../curriculum/kpmCurriculum';
import { storage } from '../services/storage';
import { soundFx } from '../services/soundEffects';
import { voiceService, VoiceOption } from '../services/voice';
import { VoiceStudio } from '../components/voice/VoiceStudio';
import { t, getMasteryLabel } from '../i18n/translations';

interface ParentDashboardViewProps {
  language: Language;
  stats: UserStats;
  settings: UserSettings;
  allProgress: Record<string, TopicProgress>;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onRefreshStats: () => void;
  onClose: () => void;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  language,
  stats,
  settings,
  allProgress,
  onUpdateSettings,
  onRefreshStats,
  onClose
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [gateQuestion, setGateQuestion] = useState<{ a: number; b: number; answer: number }>({ a: 7, b: 8, answer: 56 });
  const [userGateInput, setUserGateInput] = useState<string>('');
  const [gateError, setGateError] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'history' | 'voice_studio' | 'settings'>('overview');
  const [attemptLogs, setAttemptLogs] = useState<QuestionAttemptLog[]>([]);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);

  // Generate random math challenge for the gate
  useEffect(() => {
    const a = Math.floor(Math.random() * 6) + 4; // 4 to 9
    const b = Math.floor(Math.random() * 6) + 4; // 4 to 9
    setGateQuestion({ a, b, answer: a * b });
  }, []);

  // Fetch recent attempt logs and voices once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      storage.getRecentAttemptLogs(50).then(logs => setAttemptLogs(logs));
      setAvailableVoices(voiceService.getAvailableVoices());
    }
  }, [isAuthenticated]);

  const handleTestVoice = () => {
    soundFx.playClick();
    const testSentence = language === 'bm'
      ? 'Hai kawan! Jom kita belajar matematik sama-sama! Satu, dua, tiga, empat, lima, enam, tujuh, lapan! Hebatnya kamu!'
      : 'Hello friend! Let us learn math together! One, two, three, four, five, six, seven, eight, nine, ten! Awesome job!';
    voiceService.speak(testSentence, language);
  };

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(userGateInput) === gateQuestion.answer || userGateInput === '8888') {
      soundFx.playCorrect();
      setIsAuthenticated(true);
      setGateError(false);
    } else {
      soundFx.playGentleRetry();
      setGateError(true);
    }
  };

  const handleResetProgress = async () => {
    if (window.confirm(t('resetConfirm', language))) {
      await storage.resetAllProgress();
      onRefreshStats();
      onClose();
    }
  };

  // If not yet passed through the parent gate, show math challenge
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-80px)] px-4 py-8 max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-indigo-200 w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl mx-auto mb-4 font-black">
            🔒
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">
            {t('parentGateTitle', language)}
          </h2>
          <p className="text-xs text-slate-500 font-bold mb-6">
            {t('parentGateSubtitle', language)}
          </p>

          <form onSubmit={handleGateSubmit} className="flex flex-col items-center">
            <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-200 text-2xl font-black text-indigo-900 mb-4">
              {gateQuestion.a} × {gateQuestion.b} = ?
            </div>

            <input
              type="number"
              value={userGateInput}
              onChange={(e) => setUserGateInput(e.target.value)}
              placeholder="Jawapan / Answer"
              className="w-full text-center font-black text-2xl py-3 px-4 border-2 border-slate-300 rounded-2xl focus:border-indigo-500 focus:outline-none mb-3"
              autoFocus
            />

            {gateError && (
              <p className="text-rose-500 text-xs font-black mb-3">
                {t('parentGateError', language)}
              </p>
            )}

            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-fun w-1/3 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl text-sm"
              >
                {t('cancel', language)}
              </button>
              <button
                type="submit"
                className="btn-fun w-2/3 bg-indigo-600 text-white font-black py-3 rounded-2xl text-sm shadow-md"
              >
                {t('parentGateSubmit', language)}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0;

  // Identify strong and weak topics
  const progressList = Object.values(allProgress);
  const masteredTopics = progressList.filter(p => p.mastery === 'mastered' || p.mastery === 'confident');
  const weakTopics = progressList.filter(p => p.attempted >= 3 && (p.correct / p.attempted) < 0.6);

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 max-w-lg mx-auto pb-24 text-slate-800">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👨‍👩‍👧</span>
          <h1 className="text-xl font-black text-white">{t('parentZone', language)}</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn-fun bg-white/90 hover:bg-white text-slate-700 px-3 py-1.5 rounded-2xl font-black text-xs shadow"
        >
          ✕ {t('exit', language)}
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-5 gap-1 w-full bg-indigo-950/60 p-1 rounded-2xl mb-5 text-[11px] font-black">
        {[
          { id: 'overview', label: language === 'bm' ? 'Ringkasan' : 'Summary' },
          { id: 'curriculum', label: language === 'bm' ? 'Kurikulum' : 'Syllabus' },
          { id: 'voice_studio', label: language === 'bm' ? '🎙️ Suara' : '🎙️ Voice' },
          { id: 'history', label: language === 'bm' ? 'Sejarah' : 'History' },
          { id: 'settings', label: language === 'bm' ? 'Tetapan' : 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-1 rounded-xl transition-all text-center truncate ${
              activeTab === tab.id ? 'bg-amber-400 text-indigo-950 shadow' : 'text-indigo-200 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="w-full flex flex-col gap-4">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-white rounded-3xl p-4 shadow border border-indigo-100">
              <span className="text-xs font-bold text-slate-500 uppercase">{t('totalAnswered', language)}</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">{stats.totalAnswered}</div>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow border border-indigo-100">
              <span className="text-xs font-bold text-slate-500 uppercase">{t('accuracyRate', language)}</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{accuracy}%</div>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow border border-indigo-100">
              <span className="text-xs font-bold text-slate-500 uppercase">{t('streak', language)}</span>
              <div className="text-2xl font-black text-amber-500 mt-1">🔥 {stats.currentStreak} {language === 'bm' ? 'Hari' : 'Days'}</div>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow border border-indigo-100">
              <span className="text-xs font-bold text-slate-500 uppercase">{t('stars', language)}</span>
              <div className="text-2xl font-black text-amber-500 mt-1">⭐ {stats.stars}</div>
            </div>
          </div>

          {/* Strong vs Weak Section */}
          <div className="bg-white rounded-3xl p-5 shadow border border-indigo-100">
            <h3 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-1.5">
              <span>🌟</span>
              <span>{t('strongTopics', language)}</span>
            </h3>
            {masteredTopics.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold italic">{language === 'bm' ? 'Masih dalam proses pengumpulan data' : 'Still gathering learning data'}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {masteredTopics.map(t => (
                  <span key={t.topicId} className="bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
                    ✓ {t.topicId}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-5 shadow border border-indigo-100">
            <h3 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-1.5">
              <span>🎯</span>
              <span>{t('weakTopics', language)}</span>
            </h3>
            {weakTopics.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold italic">{language === 'bm' ? 'Tiada topik bermasalah dikesan! Bagus!' : 'No weak topics identified yet! Great job!'}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {weakTopics.map(t => (
                  <div key={t.topicId} className="flex items-center justify-between bg-amber-50 p-2.5 rounded-2xl border border-amber-200">
                    <span className="text-xs font-bold text-amber-900">{t.topicId}</span>
                    <span className="text-xs font-black text-amber-700">{Math.round((t.correct / t.attempted) * 100)}% tepat</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CURRICULUM */}
      {activeTab === 'curriculum' && (
        <div className="w-full flex flex-col gap-3">
          <div className="bg-indigo-900/60 text-white p-3 rounded-2xl text-xs font-bold border border-indigo-500/40 mb-1">
            🇲🇾 {t('curriculumStandards', language)}
          </div>

          {CURRICULUM_LEVELS.map(lvl => (
            <div key={lvl.id} className="bg-white rounded-3xl p-4 shadow border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <span>{lvl.icon}</span>
                  <span>{lvl.name[language]}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {lvl.ageRange}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 mt-2">
                {lvl.topics.map(top => {
                  const prog = allProgress[`${lvl.id}_${top.id}`];
                  const mastery = prog ? prog.mastery : 'not_started';
                  return (
                    <div key={top.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-xl bg-slate-50">
                      <span className="font-bold text-slate-700 truncate max-w-[200px]">{top.name[language]}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {getMasteryLabel(mastery, language)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === 'history' && (
        <div className="w-full flex flex-col gap-2">
          {attemptLogs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-400 font-bold text-sm shadow">
              {t('noActivityYet', language)}
            </div>
          ) : (
            attemptLogs.map(log => (
              <div key={log.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-black text-slate-800">{log.topicId}</div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.level}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {log.usedHint && <span className="text-amber-500" title="Used hint">💡</span>}
                  <span className={`font-black px-2 py-0.5 rounded-full ${log.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {log.isCorrect ? '✓ Tepat' : '✕ Salah'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: VOICE STUDIO (RAKAMAN SUARA ANAK) */}
      {activeTab === 'voice_studio' && (
        <VoiceStudio language={language} />
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="w-full bg-white rounded-3xl p-5 shadow border border-indigo-100 flex flex-col gap-5">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-sm text-slate-800">{t('soundFxDesc', language)}</div>
              <div className="text-xs text-slate-400 font-bold">{language === 'bm' ? 'Bunyi chimes & pop mesra kanak-kanak' : 'Joyful procedural chimes & pop sounds'}</div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ soundFxEnabled: !settings.soundFxEnabled })}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                settings.soundFxEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.soundFxEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Voice Auto-Read Toggle */}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <div className="font-black text-sm text-slate-800">{t('autoVoiceDesc', language)}</div>
              <div className="text-xs text-slate-400 font-bold">{language === 'bm' ? 'Tahap Awal & Prasekolah' : 'Beginner & Preschool levels'}</div>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  autoVoiceLevel: settings.autoVoiceLevel === 'beginner_preschool' ? 'none' : 'beginner_preschool'
                })
              }
              className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                settings.autoVoiceLevel !== 'none' ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.autoVoiceLevel !== 'none' ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Voice Speed Slider */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-black text-sm text-slate-800">{t('voiceSpeedDesc', language)}</span>
              <span className="text-xs font-bold text-indigo-600">{settings.voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.2"
              step="0.05"
              value={settings.voiceSpeed}
              onChange={(e) => {
                const spd = Number(e.target.value);
                voiceService.setSpeed(spd);
                onUpdateSettings({ voiceSpeed: spd });
              }}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Kid Voice / Pitch Persona Selector */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-black text-sm text-slate-800">
                  {language === 'bm' ? 'Gaya & Nada Suara (Nada Budak)' : 'Voice Style & Pitch (Kid Tone)'}
                </span>
                <p className="text-[11px] text-slate-500 font-bold">
                  {language === 'bm' ? 'Pilih watak suara comel mesra kanak-kanak' : 'Choose cheerful kid or teacher voice tone'}
                </p>
              </div>
              <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                {(settings.voicePitch ?? 1.35).toFixed(2)}x
              </span>
            </div>

            {/* Persona Preset Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { id: 'child', labelBm: '🧒 Suara Budak (Comel)', labelEn: '🧒 Kid Voice', pitch: 1.35 },
                { id: 'gentle', labelBm: '🧸 Budak Lembut', labelEn: '🧸 Soft Kid', pitch: 1.20 },
                { id: 'adult', labelBm: '👩‍🏫 Guru / Dewasa', labelEn: '👩‍🏫 Teacher', pitch: 1.00 }
              ].map((p) => {
                const isSelected = Math.abs((settings.voicePitch ?? 1.35) - p.pitch) < 0.05;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      voiceService.setPitch(p.pitch);
                      onUpdateSettings({ voicePitch: p.pitch, voicePersona: p.id as any });
                      // Quick sample test
                      const sampleWord = language === 'bm'
                        ? 'Satu, dua, tiga, empat, lima, enam, tujuh, lapan! Hebatnya kamu!'
                        : 'One, two, three, four, five, six, seven, eight! Awesome!';
                      voiceService.speak(sampleWord, language);
                    }}
                    className={`btn-fun py-2 px-1.5 rounded-2xl text-[11px] font-black border transition-all text-center ${
                      isSelected
                        ? 'bg-amber-400 text-indigo-950 border-amber-500 ring-2 ring-amber-300 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {language === 'bm' ? p.labelBm : p.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Pitch Slider for fine control */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">Garau</span>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={settings.voicePitch ?? 1.35}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  voiceService.setPitch(p);
                  onUpdateSettings({ voicePitch: p });
                }}
                className="w-full accent-amber-500"
              />
              <span className="text-xs font-bold text-slate-400">Comel</span>
            </div>
          </div>

          {/* Voice Selector & Malaysian Voice Optimizer */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-1">
              <div>
                <span className="font-black text-sm text-slate-800">
                  {language === 'bm' ? 'Pilihan Suara (TTS)' : 'Voice Selection (TTS)'}
                </span>
                <p className="text-[11px] text-slate-500 font-bold">
                  {language === 'bm'
                    ? 'Pilihan suara asli Bahasa Melayu Malaysia'
                    : 'Choose authentic Malaysian Malay voice'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestVoice}
                className="btn-fun bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
              >
                <span>🔊</span>
                <span>{language === 'bm' ? 'Uji Suara' : 'Test Voice'}</span>
              </button>
            </div>

            <select
              value={settings.selectedVoiceURI || ''}
              onChange={(e) => {
                const val = e.target.value || undefined;
                voiceService.setSelectedVoiceURI(val);
                onUpdateSettings({ selectedVoiceURI: val });
              }}
              className="w-full mt-2 p-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="">
                {language === 'bm'
                  ? '🌟 Automatik (Utamakan Pure Melayu Malaysia / Yasmin)'
                  : '🌟 Auto (Prioritize Malaysian Voice / Yasmin)'}
              </option>
              {availableVoices
                .filter((v) => language !== 'bm' || !v.isIndonesian)
                .map((v) => (
                  <option key={v.uri} value={v.uri}>
                    {v.isMalaysian ? '🇲🇾 ' : '🌐 '}
                    {v.name} ({v.lang})
                  </option>
                ))}
            </select>

            {/* Malaysian Voice Status & Edge Launcher */}
            {voiceService.hasMalaysianVoice() ? (
              <div className="mt-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-[11px] font-bold text-emerald-950 flex items-start gap-2">
                <span className="text-base">🇲🇾</span>
                <div>
                  <div className="font-black text-emerald-900">
                    {language === 'bm' ? 'Enjin Suara Pure Melayu Aktif!' : 'Pure Malay Voice Engine Active!'}
                  </div>
                  <div className="text-emerald-700 text-[10px] mt-0.5">
                    {language === 'bm'
                      ? 'Sebutan asli Standard Bahasa Melayu Malaysia (Yasmin / Amira) digunakan sepenuhnya dengan tona riang budak.'
                      : 'Authentic Standard Malaysian Malay pronunciation is actively used with child pitch tuning.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 bg-amber-50 p-3 rounded-2xl border border-amber-300 text-[11px] font-bold text-amber-950 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-base">⚠️</span>
                  <div>
                    <div className="font-black text-amber-950">
                      {language === 'bm' ? 'Google Chrome Windows Tiada Enjin Suara Melayu' : 'Google Chrome on Windows Lacks Malay Voice'}
                    </div>
                    <div className="text-amber-800 text-[10px] mt-0.5 leading-relaxed">
                      {language === 'bm'
                        ? 'Google Chrome di Windows tidak membekalkan pek Bahasa Melayu. Untuk menikmati suara Yasmin (Pure Melayu Malaysia) bertona budak yang sangat merdu & jelas, sila buka aplikasi ini menggunakan Microsoft Edge!'
                        : 'Google Chrome on Windows does not provide a Malay speech engine. Open in Microsoft Edge to enjoy the natural Yasmin Pure Malay voice!'}
                    </div>
                  </div>
                </div>
                <a
                  href={`microsoft-edge:${typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173/'}`}
                  className="btn-fun bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <span>🚀</span>
                  <span>{language === 'bm' ? 'Buka Terus di Microsoft Edge Sekarang' : 'Open in Microsoft Edge Now'}</span>
                </a>
              </div>
            )}

            {/* Helpful tip for Windows / Android / iOS users */}
            <div className="mt-3 bg-indigo-50/80 p-3 rounded-2xl border border-indigo-100 text-[11px] font-bold text-indigo-900 leading-relaxed">
              <div className="font-black text-indigo-950 flex items-center gap-1 mb-0.5">
                <span>💡</span>
                <span>{language === 'bm' ? 'Panduan Suara Asli Malaysia Mengikut Peranti:' : 'Device Voice Guide:'}</span>
              </div>
              <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600">
                <li><strong className="text-slate-800">Windows PC:</strong> Gunakan <strong>Microsoft Edge</strong> (suara <em>Microsoft Yasmin Online (Natural) - Malay</em> terbina percuma).</li>
                <li><strong className="text-slate-800">Android Telefon/Tablet:</strong> Settings → Accessibility → Text-to-speech → Google Speech Engine → Bahasa Melayu (Malaysia).</li>
                <li><strong className="text-slate-800">iPhone / iPad:</strong> Settings → Accessibility → Spoken Content → Voices → Malay (Amira).</li>
              </ul>
            </div>
          </div>

          {/* Reset All Progress Option */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={handleResetProgress}
              className="btn-fun w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-black py-3 rounded-2xl text-xs transition-colors"
            >
              ⚠️ {t('resetProgressTitle', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
