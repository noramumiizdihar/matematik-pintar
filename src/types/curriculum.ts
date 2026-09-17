export type LevelId =
  | 'beginner'
  | 'preschool'
  | 'foundation'
  | 'year_1'
  | 'year_2'
  | 'year_3'
  | 'year_4'
  | 'year_5'
  | 'year_6';

export type Language = 'bm' | 'en';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type MasteryStatus =
  | 'not_started'
  | 'learning'
  | 'practising'
  | 'confident'
  | 'mastered';

export type QuestionType =
  | 'tap_to_count'
  | 'visual_combine'
  | 'number_line'
  | 'shop_money'
  | 'clock_time'
  | 'shape_match'
  | 'pattern_complete'
  | 'comparison'
  | 'multiple_choice'
  | 'numeric_keypad';

export interface CurriculumMetadata {
  curriculumVersion: string; // e.g. "KSSR_SEMAKAN_2017", "KSPK_2017"
  level: LevelId;
  learningArea: string; // e.g. "Nombor dan Operasi", "Sukatan dan Geometri"
  topicId: string;
  topicName: {
    bm: string;
    en: string;
  };
  standardContent?: string; // Standard Kandungan (SK), e.g. "1.1", "2.1"
  standardLearning?: string; // Standard Pembelajaran (SP), e.g. "1.1.1", "2.1.2"
  difficulty: Difficulty;
}

export interface VisualObjectItem {
  id: string;
  emoji: string;
  label?: string;
  color?: string;
  tapped?: boolean;
}

export interface VisualData {
  items?: VisualObjectItem[];
  groupA?: VisualObjectItem[];
  groupB?: VisualObjectItem[];
  operation?: '+' | '-' | '×' | '÷';
  targetCount?: number;
  shapeType?: 'circle' | 'square' | 'triangle' | 'rectangle' | 'cube' | 'cone' | 'cylinder' | 'pyramid';
  patternSequence?: string[];
  patternOptions?: string[];
  clockTime?: { hour: number; minute: number };
  moneyItems?: {
    itemEmoji: string;
    itemName: { bm: string; en: string };
    price: number; // in Ringgit or sen
  }[];
  budget?: number;
  numberLine?: {
    min: number;
    max: number;
    step: number;
    start: number;
    jump: number;
    expectedEnd: number;
  };
  comparisonPair?: {
    left: { emoji: string; label: { bm: string; en: string }; value: number | string };
    right: { emoji: string; label: { bm: string; en: string }; value: number | string };
    criteria: 'more' | 'less' | 'bigger' | 'smaller' | 'longer' | 'shorter' | 'taller' | 'near' | 'far' | 'left' | 'right' | 'up' | 'down';
  };
  customSvg?: string;
}

export interface Question {
  id: string;
  metadata: CurriculumMetadata;
  type: QuestionType;
  prompt: {
    bm: string;
    en: string;
  };
  voicePrompt?: {
    bm: string;
    en: string;
  };
  hint: {
    bm: string;
    en: string;
  };
  explanation: {
    bm: string;
    en: string;
  };
  answer: number | string;
  options?: (number | string)[];
  visualData?: VisualData;
}

export interface TopicInfo {
  id: string;
  level: LevelId;
  name: {
    bm: string;
    en: string;
  };
  icon: string;
  description: {
    bm: string;
    en: string;
  };
  learningArea: string;
  standardContent?: string;
  standardLearning?: string;
  order: number;
}

export interface LessonStep {
  title: { bm: string; en: string };
  concept: { bm: string; en: string };
  voiceText?: { bm: string; en: string };
  illustrationEmoji: string;
  visualItems?: { emoji: string; label?: string }[];
  exampleFormula?: string;
  tip?: { bm: string; en: string };
}

export interface TopicLesson {
  topicId: string;
  level: LevelId;
  title: { bm: string; en: string };
  summary: { bm: string; en: string };
  icon: string;
  steps: LessonStep[];
}

export interface LevelInfo {
  id: LevelId;
  name: {
    bm: string;
    en: string;
  };
  shortName: string;
  icon: string;
  ageRange: string;
  themeColor: string;
  description: {
    bm: string;
    en: string;
  };
  autoVoiceDefault: boolean;
  topics: TopicInfo[];
}

export interface UserStats {
  stars: number;
  totalAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  highestStreak: number;
  minutesSpent: number;
  lastPlayedDate: string;
}

export interface TopicProgress {
  topicId: string;
  level: LevelId;
  attempted: number;
  correct: number;
  mastery: MasteryStatus;
  starsEarned: number;
  lastAttemptedTimestamp: number;
}

export interface QuestionAttemptLog {
  id: string;
  questionId: string;
  topicId: string;
  level: LevelId;
  timestamp: number;
  isCorrect: boolean;
  attemptsCount: number;
  timeSpentSeconds: number;
  usedHint: boolean;
}

export interface UserSettings {
  language: Language;
  soundFxEnabled: boolean;
  voiceEnabled: boolean;
  autoVoiceLevel: 'all' | 'beginner_preschool' | 'none';
  voiceSpeed: number; // 0.8 - 1.2
  voicePitch?: number; // 0.8 - 1.5 (default 1.25 for cheerful kid tone)
  voicePersona?: 'child' | 'gentle' | 'adult';
  selectedVoiceURI?: string; // custom voice preference
  parentPin: string; // default "8888" or dynamic math gate
}
