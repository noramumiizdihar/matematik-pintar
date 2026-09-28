import React, { useState, useEffect } from 'react';
import { LevelId, Language, UserStats, UserSettings, TopicProgress } from './types/curriculum';
import { storage } from './services/storage';
import { soundFx } from './services/soundEffects';
import { voiceService } from './services/voice';

import { Header } from './components/layout/Header';
import { MalaysianVoiceBanner } from './components/voice/MalaysianVoiceBanner';
import { HomeView } from './views/HomeView';
import { TopicSelectView } from './views/TopicSelectView';
import { LessonView } from './views/LessonView';
import { ActivityPlayerView } from './views/ActivityPlayerView';
import { ParentDashboardView } from './views/ParentDashboardView';
import { CuteNumberBoardView } from './views/CuteNumberBoardView';

type ViewMode = 'home' | 'topic_select' | 'lesson' | 'activity_player' | 'parent_dashboard' | 'number_board';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedLevel, setSelectedLevel] = useState<LevelId>('beginner');
  const [selectedTopic, setSelectedTopic] = useState<string>('beg_count_objects');

  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());
  const [stats, setStats] = useState<UserStats>(storage.getStats());
  const [allProgress, setAllProgress] = useState<Record<string, TopicProgress>>({});

  // Sync settings and audio engines
  useEffect(() => {
    soundFx.setMuted(!settings.soundFxEnabled);
    voiceService.setVoiceEnabled(settings.voiceEnabled);
    voiceService.setSpeed(settings.voiceSpeed);
    voiceService.setPitch(settings.voicePitch ?? 1.35);
    voiceService.setSelectedVoiceURI(settings.selectedVoiceURI);
    voiceService.setPersona(settings.voicePersona || 'child');
  }, [settings]);

  // Load progress records
  const refreshProgressAndStats = async () => {
    const p = await storage.getAllTopicProgress();
    setAllProgress(p);
    setStats(storage.getStats());
  };

  useEffect(() => {
    refreshProgressAndStats();
  }, [currentView]);

  // Land at the top of every new screen instead of keeping the previous scroll offset
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentView, selectedLevel, selectedTopic]);

  // Language toggle handler
  const handleToggleLanguage = () => {
    const nextLang: Language = settings.language === 'bm' ? 'en' : 'bm';
    const updated = storage.saveSettings({ language: nextLang });
    setSettings(updated);
  };

  // Sound FX toggle
  const handleToggleSound = () => {
    const updated = storage.saveSettings({ soundFxEnabled: !settings.soundFxEnabled });
    setSettings(updated);
  };

  // Update arbitrary settings
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = storage.saveSettings(newSettings);
    setSettings(updated);
  };

  // Level selection from Home
  const handleSelectLevel = (levelId: LevelId) => {
    setSelectedLevel(levelId);
    setCurrentView('topic_select');
  };

  // Topic selection from TopicSelectView
  const handleSelectTopic = (topicId: string, mode: 'lesson' | 'practice') => {
    setSelectedTopic(topicId);
    if (mode === 'lesson') {
      setCurrentView('lesson');
    } else {
      setCurrentView('activity_player');
    }
  };

  // Quick Play (Today's Practice)
  const handleQuickPlay = () => {
    setSelectedLevel('beginner');
    setSelectedTopic('beg_count_objects');
    setCurrentView('lesson');
  };

  return (
    <div className="app-sky min-h-screen flex flex-col items-center justify-start text-slate-100 selection:bg-amber-400 selection:text-indigo-950">
      {/* Mobile-first centered frame container (safe area aware) */}
      <div className="app-stage w-full max-w-lg min-h-screen flex flex-col relative shadow-2xl shadow-black/40 overflow-x-hidden ring-1 ring-white/5">
        {/* Persistent App Header */}
        <Header
          language={settings.language}
          stats={stats}
          settings={settings}
          onLanguageToggle={handleToggleLanguage}
          onToggleSound={handleToggleSound}
          onOpenParent={() => setCurrentView('parent_dashboard')}
          onGoHome={() => setCurrentView('home')}
          isHome={currentView === 'home'}
        />

        {/* Pure Malay Voice Notification for Chrome Desktop users */}
        <MalaysianVoiceBanner language={settings.language} />

        {/* Dynamic Views */}
        <main className="flex-1 w-full flex flex-col">
          {currentView === 'home' && (
            <HomeView
              language={settings.language}
              stats={stats}
              allProgress={allProgress}
              onSelectLevel={handleSelectLevel}
              onQuickPlay={handleQuickPlay}
              onOpenNumberBoard={() => setCurrentView('number_board')}
            />
          )}

          {currentView === 'number_board' && (
            <CuteNumberBoardView
              language={settings.language}
              onBack={() => setCurrentView('home')}
            />
          )}

          {currentView === 'topic_select' && (
            <TopicSelectView
              levelId={selectedLevel}
              language={settings.language}
              allProgress={allProgress}
              onSelectTopic={handleSelectTopic}
              onBack={() => setCurrentView('home')}
            />
          )}

          {currentView === 'lesson' && (
            <LessonView
              levelId={selectedLevel}
              topicId={selectedTopic}
              language={settings.language}
              settings={settings}
              onStartPractice={() => setCurrentView('activity_player')}
              onBack={() => setCurrentView('topic_select')}
            />
          )}

          {currentView === 'activity_player' && (
            <ActivityPlayerView
              levelId={selectedLevel}
              topicId={selectedTopic}
              language={settings.language}
              settings={settings}
              onFinishTopic={() => {
                refreshProgressAndStats();
                setCurrentView('topic_select');
              }}
              onExit={() => {
                refreshProgressAndStats();
                setCurrentView('topic_select');
              }}
              onOpenLesson={() => setCurrentView('lesson')}
            />
          )}

          {currentView === 'parent_dashboard' && (
            <ParentDashboardView
              language={settings.language}
              stats={stats}
              settings={settings}
              allProgress={allProgress}
              onUpdateSettings={handleUpdateSettings}
              onRefreshStats={refreshProgressAndStats}
              onClose={() => setCurrentView('home')}
            />
          )}
        </main>
      </div>
    </div>
  );
};
