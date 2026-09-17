// Comprehensive bilingual translation dictionary (Bahasa Melayu & English)
import { Language, MasteryStatus } from '../types/curriculum';

export const translations = {
  bm: {
    appTitle: 'Matematik Pintar',
    tagline: 'Dunia Pembelajaran Matematik Ceria',
    home: 'Utama',
    levels: 'Tahap',
    parentZone: 'Zon Ibu Bapa',
    todayPractice: 'Latihan Hari Ini',
    continueLearning: 'Sambung Belajar',
    tryNext: 'Cuba Seterusnya',
    needsPractice: 'Perlu Latihan',
    stars: 'Bintang',
    streak: 'Hari Berturut-turut',
    minutes: 'Minit Belajar',
    masteryLevel: 'Tahap Penguasaan',
    
    // Status
    mastery_not_started: 'Belum Mula',
    mastery_learning: 'Sedang Mula',
    mastery_practising: 'Sedang Berlatih',
    mastery_confident: 'Yakin',
    mastery_mastered: 'Telah Mahir',

    // Actions & Buttons
    start: 'Mula Belajar',
    check: 'Semak Jawapan',
    next: 'Seterusnya ➔',
    retry: 'Cuba Lagi',
    hint: '💡 Petunjuk',
    listen: '🔊 Dengar',
    back: 'Kembali',
    finish: 'Selesai!',
    exit: 'Keluar',
    replay: 'Ulang Suara',
    tapToCount: 'Ketik setiap objek untuk mengira',
    reset: 'Set Semula',
    save: 'Simpan',
    cancel: 'Batal',

    // Feedback & Gentle Encouragement
    encouragement_correct_1: 'Syabas! Hebat sekali! ⭐',
    encouragement_correct_2: 'Tepat sekali! Anda sangat bijak! 🎉',
    encouragement_correct_3: 'Bagus! Teruskan usaha! 🌟',
    encouragement_correct_4: 'Hebat! Satu lagi jawapan betul! 🚀',
    encouragement_retry_1: 'Hampir betul! Mari cuba lagi. 😊',
    encouragement_retry_2: 'Jangan putus asa, mari lihat petunjuk. 💪',
    encouragement_retry_3: 'Cuba sekali lagi, anda pasti boleh! 🌱',

    // Parent Zone
    parentGateTitle: 'Pengesahan Zon Ibu Bapa',
    parentGateSubtitle: 'Sila selesaikan soalan matematik ini untuk memastikan anda ialah ibu bapa / penjaga:',
    parentGateSubmit: 'Sahkan & Masuk',
    parentGateError: 'Jawapan tidak tepat. Sila cuba lagi.',
    parentStats: 'Statistik Pembelajaran',
    totalAnswered: 'Jumlah Soalan Dijawab',
    accuracyRate: 'Ketepatan Keseluruhan',
    strongTopics: 'Topik Paling Kuat',
    weakTopics: 'Topik Perlu Bimbingan',
    recentActivity: 'Sejarah Soalan Terkini',
    noActivityYet: 'Belum ada aktiviti direkodkan.',
    curriculumStandards: 'Kurikulum KPM (KSSR Semakan 2017 & DSKP)',
    settings: 'Tetapan & Kawalan',
    voiceSettings: 'Tetapan Suara & Audio',
    autoVoiceDesc: 'Baca soalan secara automatik',
    voiceSpeedDesc: 'Kelajuan Pertuturan',
    soundFxDesc: 'Kesan Bunyi Menyeronokkan',
    resetProgressTitle: 'Padam & Set Semula Semua Kemajuan',
    resetProgressDesc: 'Tindakan ini akan memadam rekod bintang dan tahap penguasaan.',
    resetConfirm: 'Adakah anda pasti mahu memadam semua rekod kemajuan?',

    // Shopkeeper mini-game
    shopkeeperTitle: 'Kedai Runcit Ceria',
    payExact: 'Pilih wang secukupnya untuk bayar:',
    totalPrice: 'Jumlah Harga:',
    yourMoney: 'Wang Anda Berikan:',
    clearMoney: 'Padam Wang',
    payButton: 'Bayar Sekarang',

    // Clock mini-game
    clockTitle: 'Kereta Api Ekspres',
    clockPrompt: 'Pukul berapakah kereta api akan berlepas?',
    matchTime: 'Padankan masa digital dengan jam:',

    // Number line
    numberLineTitle: 'Lompatan Si Katak',
    numberLinePrompt: 'Lompat di atas garis nombor:',

    // Level selector
    chooseLevel: 'Pilih Tahap Anda',
    chooseTopic: 'Pilih Topik',
  },
  en: {
    appTitle: 'Smart Math',
    tagline: 'Interactive Joyful Math World',
    home: 'Home',
    levels: 'Levels',
    parentZone: 'Parent Area',
    todayPractice: "Today's Practice",
    continueLearning: 'Continue Learning',
    tryNext: 'Try Next',
    needsPractice: 'Needs Practice',
    stars: 'Stars',
    streak: 'Day Streak',
    minutes: 'Minutes Learned',
    masteryLevel: 'Mastery Status',

    // Status
    mastery_not_started: 'Not Started',
    mastery_learning: 'Getting Started',
    mastery_practising: 'Practising',
    mastery_confident: 'Confident',
    mastery_mastered: 'Mastered',

    // Actions & Buttons
    start: 'Start Learning',
    check: 'Check Answer',
    next: 'Next ➔',
    retry: 'Try Again',
    hint: '💡 Hint',
    listen: '🔊 Listen',
    back: 'Back',
    finish: 'Done!',
    exit: 'Exit',
    replay: 'Replay Voice',
    tapToCount: 'Tap each item to count',
    reset: 'Reset',
    save: 'Save',
    cancel: 'Cancel',

    // Feedback & Gentle Encouragement
    encouragement_correct_1: 'Awesome! Great job! ⭐',
    encouragement_correct_2: 'Spot on! You are so smart! 🎉',
    encouragement_correct_3: 'Well done! Keep it up! 🌟',
    encouragement_correct_4: 'Fantastic! Another correct answer! 🚀',
    encouragement_retry_1: "Almost! Let's try again. 😊",
    encouragement_retry_2: "Don't give up, let's look at the hint. 💪",
    encouragement_retry_3: 'Give it another go, you can do it! 🌱',

    // Parent Zone
    parentGateTitle: 'Parent Verification Gate',
    parentGateSubtitle: 'Please solve this math question to verify you are a parent or guardian:',
    parentGateSubmit: 'Verify & Enter',
    parentGateError: 'Incorrect answer. Please try again.',
    parentStats: 'Learning Statistics',
    totalAnswered: 'Total Questions Answered',
    accuracyRate: 'Overall Accuracy',
    strongTopics: 'Strongest Topics',
    weakTopics: 'Topics Needing Practice',
    recentActivity: 'Recent Question Activity',
    noActivityYet: 'No activities recorded yet.',
    curriculumStandards: 'Malaysian KPM Curriculum (KSSR Semakan 2017 & DSKP)',
    settings: 'Settings & Controls',
    voiceSettings: 'Voice & Audio Settings',
    autoVoiceDesc: 'Auto-read questions aloud',
    voiceSpeedDesc: 'Voice Speed Cadence',
    soundFxDesc: 'Playful Sound Effects',
    resetProgressTitle: 'Reset All Learning Progress',
    resetProgressDesc: 'This will reset star counts and topic mastery levels.',
    resetConfirm: 'Are you sure you want to reset all progress data?',

    // Shopkeeper mini-game
    shopkeeperTitle: 'Friendly Grocery Shop',
    payExact: 'Select the right money to pay:',
    totalPrice: 'Total Price:',
    yourMoney: 'Money Given:',
    clearMoney: 'Clear Money',
    payButton: 'Pay Now',

    // Clock mini-game
    clockTitle: 'Express Train',
    clockPrompt: 'What time does the train depart?',
    matchTime: 'Match the digital time with the clock:',

    // Number line
    numberLineTitle: 'Froggy Jump',
    numberLinePrompt: 'Jump along the number line:',

    // Level selector
    chooseLevel: 'Choose Your Level',
    chooseTopic: 'Choose a Topic',
  }
};

export function t(key: keyof typeof translations['bm'], lang: Language): string {
  return translations[lang][key] || translations['en'][key] || key;
}

export function getMasteryLabel(status: MasteryStatus, lang: Language): string {
  const map: Record<MasteryStatus, keyof typeof translations['bm']> = {
    not_started: 'mastery_not_started',
    learning: 'mastery_learning',
    practising: 'mastery_practising',
    confident: 'mastery_confident',
    mastered: 'mastery_mastered'
  };
  return t(map[status], lang);
}
