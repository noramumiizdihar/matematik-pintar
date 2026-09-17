// Procedural Curriculum Question Generator for all 9 levels (3,000+ variations)
import { LevelId, Question, QuestionType, VisualObjectItem, Difficulty } from '../types/curriculum';
import { CURRICULUM_LEVELS, getTopicById } from './kpmCurriculum';
import { storage } from '../services/storage';

const CUTE_EMOJIS = ['🍎', '⭐', '🎈', '🦆', '🐱', '🥕', '🐟', '🚗', '🍬', '🍌', '🍓', '🧁', '🚀', '⚽'];
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

// Distractor generator avoiding duplicates and ensuring proximity to the correct answer
function generateDistractors(answer: number, count = 3, min = 0, max = 100): number[] {
  const distractors = new Set<number>();
  distractors.add(answer);

  const deltas = [-1, 1, -2, 2, -10, 10, -5, 5, -3, 3];
  // Shuffle deltas
  const shuffledDeltas = [...deltas].sort(() => Math.random() - 0.5);

  for (const d of shuffledDeltas) {
    const candidate = answer + d;
    if (candidate >= min && candidate <= max && !distractors.has(candidate)) {
      distractors.add(candidate);
      if (distractors.size >= count + 1) break;
    }
  }

  // If still not enough, generate random within range
  while (distractors.size < count + 1) {
    const fallback = Math.max(min, Math.min(max, Math.round(answer + (Math.random() * 8 - 4))));
    distractors.add(fallback);
  }

  // Return shuffled array
  return Array.from(distractors).sort(() => Math.random() - 0.5);
}

export class QuestionGenerator {
  // Generate question for a specific level and topic
  public static generate(levelId: LevelId, topicId?: string, difficulty: Difficulty = 'easy'): Question {
    const level = CURRICULUM_LEVELS.find(l => l.id === levelId);
    if (!level || !level.topics.length) {
      throw new Error(`Level ${levelId} not found`);
    }

    const topic = topicId ? level.topics.find(t => t.id === topicId) || level.topics[0] : level.topics[Math.floor(Math.random() * level.topics.length)];

    let attempt = 0;
    let q: Question;

    // Retry up to 8 times if question signature was recently seen (anti-repetition)
    do {
      attempt++;
      q = this.generateByTopic(levelId, topic.id, difficulty);
      const signature = `${levelId}_${topic.id}_${q.answer}_${q.prompt.en.substring(0, 20)}`;
      if (!storage.isQuestionRecent(signature) || attempt > 5) {
        storage.registerRecentQuestion(signature);
        break;
      }
    } while (attempt < 8);

    return q;
  }

  private static generateByTopic(levelId: LevelId, topicId: string, difficulty: Difficulty): Question {
    switch (topicId) {
      // --- Level 0: Beginner ---
      case 'beg_numbers_0_10':
        return this.genBegNumbers0_10(difficulty);
      case 'beg_count_objects':
        return this.genBegCountObjects(difficulty);
      case 'beg_more_less':
        return this.genBegMoreLess();
      case 'beg_sizes':
        return this.genBegSizes();
      case 'beg_shapes_colors':
        return this.genBegShapesColors();
      case 'beg_positions':
        return this.genBegPositions();
      case 'beg_patterns':
        return this.genBegPatterns();

      // --- Preschool ---
      case 'pre_numbers_0_20':
        return this.genPreNumbers0_20(difficulty);
      case 'pre_sequences':
        return this.genPreSequences();
      case 'pre_addition_10':
        return this.genPreAddition10();
      case 'pre_subtraction_10':
        return this.genPreSubtraction10();
      case 'pre_shapes_sort':
        return this.genPreShapesSort();
      case 'pre_time_money':
        return this.genPreTimeMoney();

      // --- Foundation ---
      case 'fnd_numbers_100':
        return this.genFndNumbers100(difficulty);
      case 'fnd_place_value':
        return this.genFndPlaceValue();
      case 'fnd_addition_numline':
        return this.genFndAdditionNumline();
      case 'fnd_subtraction_numline':
        return this.genFndSubtractionNumline();
      case 'fnd_groups_share':
        return this.genFndGroupsShare();
      case 'fnd_fractions_basic':
        return this.genFndFractionsBasic();
      case 'fnd_shop_money':
        return this.genFndShopMoney();

      // --- Year 1 ---
      case 'y1_numbers_100':
        return this.genY1Numbers100(difficulty);
      case 'y1_addition_subtraction':
        return this.genY1AddSub(difficulty);
      case 'y1_fractions':
        return this.genY1Fractions();
      case 'y1_money':
        return this.genY1Money();
      case 'y1_time':
        return this.genY1Time();
      case 'y1_measurement':
        return this.genY1Measurement();
      case 'y1_shapes':
        return this.genY1Shapes();

      // --- Year 2 ---
      case 'y2_numbers_1000':
        return this.genY2Numbers1000(difficulty);
      case 'y2_addition_subtraction':
        return this.genY2AddSub(difficulty);
      case 'y2_multiplication_division':
      case 'y2_operations':
        return this.genY2Operations(difficulty);
      case 'y2_fractions_decimals':
        return this.genY2FractionsDecimals();
      case 'y2_money_100':
        return this.genY2Money100();
      case 'y2_time_measurement':
        return this.genY2TimeMeasurement();

      // --- Year 3 ---
      case 'y3_numbers_10000':
        return this.genY3Numbers10000(difficulty);
      case 'y3_operations':
        return this.genY3Operations(difficulty);
      case 'y3_fractions_percent':
        return this.genY3FractionsPercent();
      case 'y3_money_10000':
        return this.genY3Money10000();
      case 'y3_time_calendar':
        return this.genY3TimeCalendar();
      case 'y3_geometry_data':
        return this.genY3GeometryData();

      // --- Year 4 ---
      case 'y4_numbers_100000':
        return this.genY4Numbers100000(difficulty);
      case 'y4_fractions_decimals':
        return this.genY4FractionsDecimals();
      case 'y4_money_100000':
        return this.genY4Money100000();
      case 'y4_time_decades':
        return this.genY4TimeDecades();
      case 'y4_geometry_area':
        return this.genY4GeometryArea();
      case 'y4_coordinates_data':
        return this.genY4CoordinatesData();

      // --- Year 5 ---
      case 'y5_numbers_1000000':
        return this.genY5Numbers1000000(difficulty);
      case 'y5_fractions_advanced':
        return this.genY5FractionsAdvanced();
      case 'y5_money_investments':
        return this.genY5MoneyInvestments();
      case 'y5_time_zones':
        return this.genY5TimeZones();
      case 'y5_geometry_volume':
        return this.genY5GeometryVolume();
      case 'y5_stats_mode_median_mean':
        return this.genY5Stats();

      // --- Year 6 ---
      case 'y6_numbers_10000000':
        return this.genY6Numbers10000000(difficulty);
      case 'y6_fractions_decimals_percent':
        return this.genY6FractionsDecimalsPercent();
      case 'y6_money_financial':
        return this.genY6MoneyFinancial();
      case 'y6_time_speed':
        return this.genY6TimeSpeed();
      case 'y6_geometry_composite':
        return this.genY6GeometryComposite();
      case 'y6_probability_data':
        return this.genY6ProbabilityData();

      default:
        return this.genBegCountObjects(difficulty);
    }
  }

  // =========================================================================
  // BEGINNER GENERATORS (Level 0) - Zero reading required, voice heavy
  // =========================================================================

  private static genBegNumbers0_10(difficulty: Difficulty): Question {
    const max = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 7 : 5;
    const n = Math.floor(Math.random() * max) + 1;
    const emoji = CUTE_EMOJIS[Math.floor(Math.random() * CUTE_EMOJIS.length)];

    const options = generateDistractors(n, 3, 1, 10);

    return {
      id: `beg_num_${Date.now()}_${n}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'beginner',
        learningArea: 'Nombor dan Operasi',
        topicId: 'beg_numbers_0_10',
        topicName: { bm: 'Kenal Nombor 0–10', en: 'Numbers 0–10' },
        standardContent: 'Awal 1.1',
        standardLearning: 'Awal 1.1.1',
        difficulty
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Pilih nombor ${n}`,
        en: `Choose number ${n}`
      },
      voicePrompt: {
        bm: `Ketik nombor ${n}`,
        en: `Tap number ${n}`
      },
      hint: {
        bm: `Cari angka ${n}`,
        en: `Look for the numeral ${n}`
      },
      explanation: {
        bm: `Ini ialah angka ${n}!`,
        en: `This is number ${n}!`
      },
      answer: n,
      options,
      visualData: {
        items: Array.from({ length: n }).map((_, i) => ({
          id: `item_${i}`,
          emoji,
          tapped: false
        }))
      }
    };
  }

  private static genBegCountObjects(difficulty: Difficulty): Question {
    const max = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 7 : 5;
    const count = Math.floor(Math.random() * (max - 1)) + 2;
    const emoji = CUTE_EMOJIS[Math.floor(Math.random() * CUTE_EMOJIS.length)];

    const items: VisualObjectItem[] = Array.from({ length: count }).map((_, i) => ({
      id: `count_item_${i}`,
      emoji,
      tapped: false
    }));

    const options = generateDistractors(count, 3, 1, 10);

    return {
      id: `beg_count_${Date.now()}_${count}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'beginner',
        learningArea: 'Nombor dan Operasi',
        topicId: 'beg_count_objects',
        topicName: { bm: 'Kira Objek Ceria', en: 'Counting Fun Objects' },
        standardContent: 'Awal 1.2',
        standardLearning: 'Awal 1.2.1',
        difficulty
      },
      type: 'tap_to_count',
      prompt: {
        bm: 'Berapa banyak objek yang ada? Ketik untuk mengira!',
        en: 'How many objects are there? Tap to count!'
      },
      voicePrompt: {
        bm: 'Berapakah bilangan objek ini? Mari ketik dan kira bersama!',
        en: 'How many objects are here? Let us tap and count together!'
      },
      hint: {
        bm: `Ketik satu persatu. Ada ${count} kesemuanya.`,
        en: `Tap each item. There are ${count} altogether.`
      },
      explanation: {
        bm: `Semuanya ada ${count} ${emoji}!`,
        en: `There are ${count} ${emoji} in total!`
      },
      answer: count,
      options,
      visualData: {
        items,
        targetCount: count
      }
    };
  }

  private static genBegMoreLess(): Question {
    const isMore = Math.random() > 0.5;
    let countA = Math.floor(Math.random() * 4) + 2;
    let countB = Math.floor(Math.random() * 4) + 2;
    if (countA === countB) countB += 2;

    const emojiA = '🍎';
    const emojiB = '🍌';

    const groupAItems = Array.from({ length: countA }).map((_, i) => ({ id: `a_${i}`, emoji: emojiA }));
    const groupBItems = Array.from({ length: countB }).map((_, i) => ({ id: `b_${i}`, emoji: emojiB }));

    const correctGroup = isMore
      ? countA > countB ? 'A' : 'B'
      : countA < countB ? 'A' : 'B';

    return {
      id: `beg_moreless_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'beginner',
        learningArea: 'Nombor dan Operasi',
        topicId: 'beg_more_less',
        topicName: { bm: 'Banyak atau Sedikit', en: 'More or Less' },
        standardContent: 'Awal 1.3',
        standardLearning: 'Awal 1.3.1',
        difficulty: 'easy'
      },
      type: 'comparison',
      prompt: {
        bm: isMore ? 'Kumpulan manakah yang LEBIH BANYAK?' : 'Kumpulan manakah yang LEBIH SEDIKIT?',
        en: isMore ? 'Which group has MORE?' : 'Which group has LESS?'
      },
      voicePrompt: {
        bm: isMore ? 'Ketik kumpulan yang mempunyai LEBIH BANYAK objek!' : 'Ketik kumpulan yang mempunyai LEBIH SEDIKIT objek!',
        en: isMore ? 'Tap the group that has MORE objects!' : 'Tap the group that has LESS objects!'
      },
      hint: {
        bm: `Kumpulan A ada ${countA}, Kumpulan B ada ${countB}.`,
        en: `Group A has ${countA}, Group B has ${countB}.`
      },
      explanation: {
        bm: `${countA > countB ? 'Kumpulan A' : 'Kumpulan B'} ada lebih banyak!`,
        en: `${countA > countB ? 'Group A' : 'Group B'} has more!`
      },
      answer: correctGroup,
      options: ['A', 'B'],
      visualData: {
        groupA: groupAItems,
        groupB: groupBItems,
        comparisonPair: {
          left: { emoji: emojiA, label: { bm: `Kumpulan A (${countA})`, en: `Group A (${countA})` }, value: 'A' },
          right: { emoji: emojiB, label: { bm: `Kumpulan B (${countB})`, en: `Group B (${countB})` }, value: 'B' },
          criteria: isMore ? 'more' : 'less'
        }
      }
    };
  }

  private static genBegSizes(): Question {
    const pairs = [
      {
        question: 'bigger',
        left: { emoji: '🐘', label: { bm: 'Gajah', en: 'Elephant' }, value: 'left' },
        right: { emoji: '🐜', label: { bm: 'Semut', en: 'Ant' }, value: 'right' },
        answer: 'left',
        promptBm: 'Haiwan manakah yang LEBIH BESAR?',
        promptEn: 'Which animal is BIGGER?'
      },
      {
        question: 'smaller',
        left: { emoji: '🍉', label: { bm: 'Tembikai', en: 'Watermelon' }, value: 'left' },
        right: { emoji: '🍓', label: { bm: 'Strawberi', en: 'Strawberry' }, value: 'right' },
        answer: 'right',
        promptBm: 'Buah manakah yang LEBIH KECIL?',
        promptEn: 'Which fruit is SMALLER?'
      },
      {
        question: 'taller',
        left: { emoji: '🦒', label: { bm: 'Zirafah', en: 'Giraffe' }, value: 'left' },
        right: { emoji: '🐢', label: { bm: 'Kura-kura', en: 'Turtle' }, value: 'right' },
        answer: 'left',
        promptBm: 'Siapakah yang LEBIH TINGGI?',
        promptEn: 'Who is TALLER?'
      }
    ];

    const pick = pairs[Math.floor(Math.random() * pairs.length)];

    return {
      id: `beg_sizes_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'beginner',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'beg_sizes',
        topicName: { bm: 'Besar & Kecil / Panjang & Pendek', en: 'Big & Small / Long & Short' },
        difficulty: 'easy'
      },
      type: 'comparison',
      prompt: { bm: pick.promptBm, en: pick.promptEn },
      voicePrompt: { bm: pick.promptBm, en: pick.promptEn },
      hint: { bm: 'Lihat perbezaan saiz kedua-dua objek.', en: 'Look closely at the sizes of both items.' },
      explanation: { bm: 'Bagus! Anda dapat mengecam perbezaan saiz.', en: 'Great! You identified the size difference.' },
      answer: pick.answer,
      options: ['left', 'right'],
      visualData: {
        comparisonPair: {
          left: pick.left,
          right: pick.right,
          criteria: pick.question as 'bigger' | 'smaller' | 'taller'
        }
      }
    };
  }

  private static genBegShapesColors(): Question {
    const shapes = [
      { nameBm: 'Bulatan', nameEn: 'Circle', emoji: '🔴', type: 'circle' },
      { nameBm: 'Segi Empat Sama', nameEn: 'Square', emoji: '🟦', type: 'square' },
      { nameBm: 'Segi Tiga', nameEn: 'Triangle', emoji: '🔺', type: 'triangle' },
      { nameBm: 'Bintang', nameEn: 'Star', emoji: '⭐', type: 'star' }
    ];

    const pick = shapes[Math.floor(Math.random() * shapes.length)];
    const options = shapes.map(s => s.nameEn).sort(() => Math.random() - 0.5);

    return {
      id: `beg_shapes_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'beginner',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'beg_shapes_colors',
        topicName: { bm: 'Bentuk & Warna Asas', en: 'Basic Shapes & Colors' },
        difficulty: 'easy'
      },
      type: 'shape_match',
      prompt: {
        bm: `Pilih bentuk: ${pick.nameBm}`,
        en: `Choose shape: ${pick.nameEn}`
      },
      voicePrompt: {
        bm: `Ketik bentuk ${pick.nameBm}!`,
        en: `Tap the ${pick.nameEn}!`
      },
      hint: {
        bm: `Bentuk ${pick.nameBm} kelihatan seperti ini: ${pick.emoji}`,
        en: `A ${pick.nameEn} looks like this: ${pick.emoji}`
      },
      explanation: {
        bm: `Tepat sekali! Ini ialah ${pick.nameBm}.`,
        en: `Spot on! This is a ${pick.nameEn}.`
      },
      answer: pick.nameEn,
      options,
      visualData: {
        shapeType: pick.type as any,
        items: [{ id: 'shape_1', emoji: pick.emoji }]
      }
    };
  }

  private static genBegPositions(): Question {
    const isUp = Math.random() > 0.5;
    return {
      id: `beg_pos_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'beginner',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'beg_positions',
        topicName: { bm: 'Kedudukan: Atas, Bawah, Kiri, Kanan', en: 'Positions: Up, Down, Left, Right' },
        difficulty: 'easy'
      },
      type: 'comparison',
      prompt: {
        bm: isUp ? 'Ketik anak panah yang menunjuk ke ATAS ⬆️' : 'Ketik anak panah yang menunjuk ke BAWAH ⬇️',
        en: isUp ? 'Tap the arrow pointing UP ⬆️' : 'Tap the arrow pointing DOWN ⬇️'
      },
      voicePrompt: {
        bm: isUp ? 'Ketik panah ke atas!' : 'Ketik panah ke bawah!',
        en: isUp ? 'Tap the arrow pointing up!' : 'Tap the arrow pointing down!'
      },
      hint: {
        bm: isUp ? 'Atas menuju ke langit' : 'Bawah menuju ke lantai',
        en: isUp ? 'Up points to the sky' : 'Down points to the ground'
      },
      explanation: {
        bm: isUp ? 'Anak panah ⬆️ menghala ke atas!' : 'Anak panah ⬇️ menghala ke bawah!',
        en: isUp ? 'Arrow ⬆️ points up!' : 'Arrow ⬇️ points down!'
      },
      answer: isUp ? 'up' : 'down',
      options: ['up', 'down'],
      visualData: {
        comparisonPair: {
          left: { emoji: '⬆️', label: { bm: 'Atas', en: 'Up' }, value: 'up' },
          right: { emoji: '⬇️', label: { bm: 'Bawah', en: 'Down' }, value: 'down' },
          criteria: isUp ? 'up' : 'down'
        }
      }
    };
  }

  private static genBegPatterns(): Question {
    const emojis = ['🔴', '🔵'];
    const sequence = ['🔴', '🔵', '🔴', '🔵', '🔴', '?'];
    const answer = '🔵';

    return {
      id: `beg_pat_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'beginner',
        learningArea: 'Perkaitan dan Aljabar',
        topicId: 'beg_patterns',
        topicName: { bm: 'Corak & Susunan', en: 'Patterns & Sequences' },
        difficulty: 'easy'
      },
      type: 'pattern_complete',
      prompt: {
        bm: 'Apakah warna atau objek yang seterusnya?',
        en: 'What is the next item in the pattern?'
      },
      voicePrompt: {
        bm: 'Apakah corak seterusnya? Merah, biru, merah, biru, merah...',
        en: 'What comes next in the pattern? Red, blue, red, blue, red...'
      },
      hint: {
        bm: 'Corak ini bertukar ganti antara merah dan biru.',
        en: 'The pattern alternates between red and blue.'
      },
      explanation: {
        bm: 'Hebat! Selepas merah ialah biru.',
        en: 'Great! After red comes blue.'
      },
      answer,
      options: ['🔴', '🔵', '🟢'],
      visualData: {
        patternSequence: sequence,
        patternOptions: ['🔴', '🔵', '🟢']
      }
    };
  }

  // =========================================================================
  // PRESCHOOL GENERATORS
  // =========================================================================

  private static genPreNumbers0_20(difficulty: Difficulty): Question {
    const min = difficulty === 'hard' ? 10 : 1;
    const max = difficulty === 'easy' ? 10 : 20;
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    const options = generateDistractors(n, 3, 0, 20);

    return {
      id: `pre_num_${Date.now()}_${n}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'preschool',
        learningArea: 'Nombor dan Operasi',
        topicId: 'pre_numbers_0_20',
        topicName: { bm: 'Nombor 0 hingga 20', en: 'Numbers 0 to 20' },
        standardContent: 'MA 2.1',
        standardLearning: 'MA 2.1.8',
        difficulty
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Berapakah nombor ini: ${n}?`,
        en: `What is this number: ${n}?`
      },
      voicePrompt: {
        bm: `Pilih angka ${n}`,
        en: `Choose number ${n}`
      },
      hint: { bm: `Cari nombor ${n} dalam pilihan jawapan.`, en: `Find number ${n} in the choices.` },
      explanation: { bm: `Ya, ini ialah nombor ${n}!`, en: `Yes, that is number ${n}!` },
      answer: n,
      options
    };
  }

  private static genPreSequences(): Question {
    const start = Math.floor(Math.random() * 8) + 1;
    const isBefore = Math.random() > 0.5;

    const promptBm = isBefore
      ? `Apakah nombor SEBELUM ${start + 1}?`
      : `Apakah nombor SELEPAS ${start}?`;
    const promptEn = isBefore
      ? `What number comes BEFORE ${start + 1}?`
      : `What number comes AFTER ${start}?`;

    const answer = isBefore ? start : start + 1;
    const options = generateDistractors(answer, 3, 0, 15);

    return {
      id: `pre_seq_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'preschool',
        learningArea: 'Nombor dan Operasi',
        topicId: 'pre_sequences',
        topicName: { bm: 'Sebelum & Selepas', en: 'Before & After' },
        standardContent: 'MA 2.2',
        standardLearning: 'MA 2.2.2',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: { bm: promptBm, en: promptEn },
      voicePrompt: { bm: promptBm, en: promptEn },
      hint: { bm: `Kira urutan: ${start}, ${start + 1}...`, en: `Count in order: ${start}, ${start + 1}...` },
      explanation: { bm: `Tepat! Jawapannya ialah ${answer}.`, en: `Correct! The answer is ${answer}.` },
      answer,
      options
    };
  }

  private static genPreAddition10(): Question {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * (9 - a)) + 1;
    const sum = a + b;
    const emoji = '🍎';

    const groupA = Array.from({ length: a }).map((_, i) => ({ id: `a_${i}`, emoji }));
    const groupB = Array.from({ length: b }).map((_, i) => ({ id: `b_${i}`, emoji }));
    const options = generateDistractors(sum, 3, 1, 10);

    return {
      id: `pre_add_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'preschool',
        learningArea: 'Nombor dan Operasi',
        topicId: 'pre_addition_10',
        topicName: { bm: 'Tambah Visual dalam 10', en: 'Visual Addition within 10' },
        standardContent: 'MA 3.1',
        standardLearning: 'MA 3.1.4',
        difficulty: 'easy'
      },
      type: 'visual_combine',
      prompt: {
        bm: `Ada ${a} epal. Datang lagi ${b} epal. Berapakah semuanya?`,
        en: `There are ${a} apples. ${b} more arrive. How many altogether?`
      },
      voicePrompt: {
        bm: `${a} tambah ${b} sama dengan berapa?`,
        en: `What is ${a} plus ${b}?`
      },
      hint: {
        bm: `Gabungkan ${a} dan ${b}. Kira semuanya sekali.`,
        en: `Combine ${a} and ${b}. Count all of them together.`
      },
      explanation: {
        bm: `${a} + ${b} = ${sum} epal kesemuanya!`,
        en: `${a} + ${b} = ${sum} apples altogether!`
      },
      answer: sum,
      options,
      visualData: {
        groupA,
        groupB,
        operation: '+'
      }
    };
  }

  private static genPreSubtraction10(): Question {
    const total = Math.floor(Math.random() * 6) + 3; // 3 to 8
    const remove = Math.floor(Math.random() * (total - 1)) + 1;
    const remaining = total - remove;
    const emoji = '🥕';

    const items = Array.from({ length: total }).map((_, i) => ({ id: `c_${i}`, emoji }));
    const options = generateDistractors(remaining, 3, 0, 10);

    return {
      id: `pre_sub_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'preschool',
        learningArea: 'Nombor dan Operasi',
        topicId: 'pre_subtraction_10',
        topicName: { bm: 'Tolak Visual dalam 10', en: 'Visual Subtraction within 10' },
        standardContent: 'MA 3.2',
        standardLearning: 'MA 3.2.3',
        difficulty: 'easy'
      },
      type: 'visual_combine',
      prompt: {
        bm: `Arnab ada ${total} lobak. Arnab makan ${remove} lobak. Berapa baki lobak?`,
        en: `Bunny has ${total} carrots. Bunny eats ${remove}. How many carrots remain?`
      },
      voicePrompt: {
        bm: `${total} tolak ${remove}. Berapakah bakinya?`,
        en: `What is ${total} minus ${remove}?`
      },
      hint: {
        bm: `Keluarkan ${remove} daripada ${total} lobak.`,
        en: `Take away ${remove} from ${total} carrots.`
      },
      explanation: {
        bm: `${total} - ${remove} = ${remaining} lobak tinggal!`,
        en: `${total} - ${remove} = ${remaining} carrots left!`
      },
      answer: remaining,
      options,
      visualData: {
        items,
        operation: '-'
      }
    };
  }

  private static genPreShapesSort(): Question {
    return this.genBegShapesColors();
  }

  private static genPreTimeMoney(): Question {
    const coins = [
      { val: 10, label: '10 sen', emoji: '🪙 10 sen' },
      { val: 20, label: '20 sen', emoji: '🪙 20 sen' },
      { val: 50, label: '50 sen', emoji: '🪙 50 sen' }
    ];
    const pick = coins[Math.floor(Math.random() * coins.length)];
    const options = coins.map(c => c.label);

    return {
      id: `pre_coin_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSPK_2017',
        level: 'preschool',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'pre_time_money',
        topicName: { bm: 'Masa & Wang Syiling Asas', en: 'Time & Basic Coins' },
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Pilih nilai syiling Malaysia ini: ${pick.label}`,
        en: `Identify this Malaysian coin value: ${pick.label}`
      },
      voicePrompt: {
        bm: `Ketik duit syiling bernilai ${pick.label}!`,
        en: `Tap the coin worth ${pick.label}!`
      },
      hint: { bm: `Lihat nombor yang tertulis di atas syiling: ${pick.val}`, en: `Look at the number on the coin: ${pick.val}` },
      explanation: { bm: `Betul! Nilainya ialah ${pick.label}.`, en: `Correct! Its value is ${pick.label}.` },
      answer: pick.label,
      options
    };
  }

  // =========================================================================
  // FOUNDATION GENERATORS
  // =========================================================================

  private static genFndNumbers100(difficulty: Difficulty): Question {
    const n = Math.floor(Math.random() * 80) + 15;
    const options = generateDistractors(n, 3, 10, 100);

    return {
      id: `fnd_num_${Date.now()}`,
      metadata: {
        curriculumVersion: 'ASAS_V1',
        level: 'foundation',
        learningArea: 'Nombor dan Operasi',
        topicId: 'fnd_numbers_100',
        topicName: { bm: 'Nombor Hingga 100', en: 'Numbers up to 100' },
        difficulty
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Apakah nombor: ${n}?`,
        en: `What is the number: ${n}?`
      },
      hint: { bm: `Nombor ini mempunyai ${Math.floor(n / 10)} puluh dan ${n % 10} sa.`, en: `This number has ${Math.floor(n / 10)} tens and ${n % 10} ones.` },
      explanation: { bm: `Nombor tersebut ialah ${n}.`, en: `The number is ${n}.` },
      answer: n,
      options
    };
  }

  private static genFndPlaceValue(): Question {
    const tens = Math.floor(Math.random() * 7) + 2;
    const ones = Math.floor(Math.random() * 9) + 1;
    const num = tens * 10 + ones;

    const askTens = Math.random() > 0.5;
    const answer = askTens ? tens : ones;
    const options = generateDistractors(answer, 3, 0, 9);

    return {
      id: `fnd_pv_${Date.now()}`,
      metadata: {
        curriculumVersion: 'ASAS_V1',
        level: 'foundation',
        learningArea: 'Nombor dan Operasi',
        topicId: 'fnd_place_value',
        topicName: { bm: 'Nilai Tempat: Sa & Puluh', en: 'Place Value: Tens & Ones' },
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Dalam nombor ${num}, apakah nilai digit bagi nilai tempat ${askTens ? 'PULUH' : 'SA'}?`,
        en: `In the number ${num}, what is the digit in the ${askTens ? 'TENS' : 'ONES'} place?`
      },
      voicePrompt: {
        bm: `Nombor ${num}. Apakah digit ${askTens ? 'puluh' : 'sa'}?`,
        en: `Number ${num}. What is the ${askTens ? 'tens' : 'ones'} digit?`
      },
      hint: {
        bm: `${tens} adalah puluh dan ${ones} adalah sa.`,
        en: `${tens} is in tens and ${ones} is in ones.`
      },
      explanation: {
        bm: `Digit di tempat ${askTens ? 'puluh' : 'sa'} ialah ${answer}.`,
        en: `The digit in the ${askTens ? 'tens' : 'ones'} place is ${answer}.`
      },
      answer,
      options
    };
  }

  private static genFndAdditionNumline(): Question {
    const start = Math.floor(Math.random() * 10) + 2;
    const jump = Math.floor(Math.random() * 6) + 1;
    const end = start + jump;

    const options = generateDistractors(end, 3, start, start + 12);

    return {
      id: `fnd_nl_add_${Date.now()}`,
      metadata: {
        curriculumVersion: 'ASAS_V1',
        level: 'foundation',
        learningArea: 'Nombor dan Operasi',
        topicId: 'fnd_addition_numline',
        topicName: { bm: 'Tambah dengan Garis Nombor', en: 'Addition on Number Line' },
        difficulty: 'easy'
      },
      type: 'number_line',
      prompt: {
        bm: `Mula di ${start}, lompat ${jump} langkah ke hadapan (+${jump}). Di manakah anda mendarat?`,
        en: `Start at ${start}, hop ${jump} steps forward (+${jump}). Where do you land?`
      },
      voicePrompt: {
        bm: `${start} tambah ${jump} pada garis nombor. Berapakah jawapannya?`,
        en: `${start} plus ${jump} on the number line. Where do you land?`
      },
      hint: {
        bm: `Kira ke hadapan: ${start} + ${jump} = ?`,
        en: `Count forward: ${start} + ${jump} = ?`
      },
      explanation: {
        bm: `${start} + ${jump} = ${end}! Katak mendarat di ${end}.`,
        en: `${start} + ${jump} = ${end}! Frog lands at ${end}.`
      },
      answer: end,
      options,
      visualData: {
        numberLine: {
          min: Math.max(0, start - 2),
          max: end + 3,
          step: 1,
          start,
          jump,
          expectedEnd: end
        }
      }
    };
  }

  private static genFndSubtractionNumline(): Question {
    const start = Math.floor(Math.random() * 8) + 7;
    const jump = Math.floor(Math.random() * 5) + 1;
    const end = start - jump;

    const options = generateDistractors(end, 3, 0, start);

    return {
      id: `fnd_nl_sub_${Date.now()}`,
      metadata: {
        curriculumVersion: 'ASAS_V1',
        level: 'foundation',
        learningArea: 'Nombor dan Operasi',
        topicId: 'fnd_subtraction_numline',
        topicName: { bm: 'Tolak dengan Garis Nombor', en: 'Subtraction on Number Line' },
        difficulty: 'easy'
      },
      type: 'number_line',
      prompt: {
        bm: `Mula di ${start}, lompat ${jump} langkah ke belakang (-${jump}). Di manakah anda mendarat?`,
        en: `Start at ${start}, hop ${jump} steps backward (-${jump}). Where do you land?`
      },
      voicePrompt: {
        bm: `${start} tolak ${jump} pada garis nombor. Di manakah anda mendarat?`,
        en: `${start} minus ${jump} on the number line. Where do you land?`
      },
      hint: {
        bm: `Undur ${jump} langkah ke belakang daripada ${start}.`,
        en: `Step back ${jump} steps from ${start}.`
      },
      explanation: {
        bm: `${start} - ${jump} = ${end}!`,
        en: `${start} - ${jump} = ${end}!`
      },
      answer: end,
      options,
      visualData: {
        numberLine: {
          min: Math.max(0, end - 2),
          max: start + 2,
          step: 1,
          start,
          jump: -jump,
          expectedEnd: end
        }
      }
    };
  }

  private static genFndGroupsShare(): Question {
    const groups = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
    const perGroup = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
    const total = groups * perGroup;

    const options = generateDistractors(total, 3, 2, 20);

    return {
      id: `fnd_group_${Date.now()}`,
      metadata: {
        curriculumVersion: 'ASAS_V1',
        level: 'foundation',
        learningArea: 'Nombor dan Operasi',
        topicId: 'fnd_groups_share',
        topicName: { bm: 'Kumpulan & Kongsi Sama Rata', en: 'Equal Groups & Sharing' },
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Ada ${groups} pinggan. Setiap pinggan ada ${perGroup} biji biskut 🍪. Berapakah jumlah biskut?`,
        en: `There are ${groups} plates. Each plate has ${perGroup} cookies 🍪. How many cookies altogether?`
      },
      hint: {
        bm: `Tambah berulang: ${Array(groups).fill(perGroup).join(' + ')} = ?`,
        en: `Repeated addition: ${Array(groups).fill(perGroup).join(' + ')} = ?`
      },
      explanation: {
        bm: `${groups} kumpulan ${perGroup} ialah ${total}! (${groups} × ${perGroup} = ${total})`,
        en: `${groups} groups of ${perGroup} is ${total}! (${groups} × ${perGroup} = ${total})`
      },
      answer: total,
      options
    };
  }

  private static genFndFractionsBasic(): Question {
    const isHalf = Math.random() > 0.5;
    const answer = isHalf ? '1/2' : '1/4';
    const nameBm = isHalf ? 'Separuh (Satu perdua)' : 'Suku (Satu perempat)';
    const nameEn = isHalf ? 'Half (One over two)' : 'Quarter (One over four)';

    return {
      id: `fnd_frac_${Date.now()}`,
      metadata: {
        curriculumVersion: 'ASAS_V1',
        level: 'foundation',
        learningArea: 'Nombor dan Operasi',
        topicId: 'fnd_fractions_basic',
        topicName: { bm: 'Pecahan: Separuh & Suku', en: 'Fractions: Half & Quarter' },
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Apakah simbol pecahan bagi "${nameBm}"?`,
        en: `What is the fraction symbol for "${nameEn}"?`
      },
      voicePrompt: {
        bm: `Pilih simbol pecahan bagi ${nameBm}`,
        en: `Choose the fraction for ${nameEn}`
      },
      hint: { bm: isHalf ? '1 daripada 2 bahagian sama besar' : '1 daripada 4 bahagian sama besar', en: isHalf ? '1 out of 2 equal parts' : '1 out of 4 equal parts' },
      explanation: { bm: `${nameBm} ditulis sebagai ${answer}.`, en: `${nameEn} is written as ${answer}.` },
      answer,
      options: ['1/2', '1/4', '3/4', '1/3']
    };
  }

  private static genFndShopMoney(): Question {
    const items = [
      { nameBm: 'Buku Nota', nameEn: 'Notebook', emoji: '📓', price: 3 },
      { nameBm: 'Pensel Warna', nameEn: 'Color Pencils', emoji: '✏️', price: 4 },
      { nameBm: 'Pemadam Comel', nameEn: 'Cute Eraser', emoji: '🧼', price: 1 },
      { nameBm: 'Pengasah Pensel', nameEn: 'Sharpener', emoji: '✂️', price: 2 },
      { nameBm: 'Pembaris', nameEn: 'Ruler', emoji: '📏', price: 2 }
    ];

    const pick = items[Math.floor(Math.random() * items.length)];
    const options = [1, 2, 3, 4, 5];

    return {
      id: `fnd_shop_${Date.now()}`,
      metadata: {
        curriculumVersion: 'ASAS_V1',
        level: 'foundation',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'fnd_shop_money',
        topicName: { bm: 'Kedai Runcit Ringgit & Sen', en: 'Grocery Shop: Money Basics' },
        difficulty: 'easy'
      },
      type: 'shop_money',
      prompt: {
        bm: `Di kedai runcit, ${pick.nameBm} ${pick.emoji} berharga RM${pick.price}. Berapakah keping wang kertas RM1 yang perlu dibayar?`,
        en: `At the shop, ${pick.nameEn} ${pick.emoji} costs RM${pick.price}. How many RM1 notes do you need to pay?`
      },
      voicePrompt: {
        bm: `${pick.nameBm} berharga RM${pick.price}. Berapakah wang RM1 yang diperlukan?`,
        en: `${pick.nameEn} costs RM${pick.price}. How many RM1 notes are needed?`
      },
      hint: { bm: `Setiap RM1 bernilai satu ringgit. Perlu RM${pick.price}.`, en: `Each RM1 note is one ringgit. You need RM${pick.price}.` },
      explanation: { bm: `Tepat sekali! Anda perlukan ${pick.price} keping wang kertas RM1.`, en: `Spot on! You need ${pick.price} notes of RM1.` },
      answer: pick.price,
      options: generateDistractors(pick.price, 3, 1, 8),
      visualData: {
        budget: pick.price,
        moneyItems: [
          { itemEmoji: pick.emoji, itemName: { bm: pick.nameBm, en: pick.nameEn }, price: pick.price }
        ]
      }
    };
  }

  // =========================================================================
  // YEAR 1 GENERATORS (KSSR Semakan 2017)
  // =========================================================================

  private static genY1Numbers100(difficulty: Difficulty): Question {
    const a = Math.floor(Math.random() * 40) + 10;
    const b = a + Math.floor(Math.random() * 15) + 1;
    const isLarger = Math.random() > 0.5;

    const answer = isLarger ? Math.max(a, b) : Math.min(a, b);

    return {
      id: `y1_num_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_1',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y1_numbers_100',
        topicName: { bm: '1.0 Nombor Bulat Hingga 100', en: '1.0 Whole Numbers to 100' },
        standardContent: '1.1 - 1.8',
        standardLearning: '1.2.1',
        difficulty
      },
      type: 'multiple_choice',
      prompt: {
        bm: isLarger ? `Antara ${a} dan ${b}, nombor manakah yang LEBIH BESAR?` : `Antara ${a} dan ${b}, nombor manakah yang LEBIH KECIL?`,
        en: isLarger ? `Between ${a} and ${b}, which number is GREATER?` : `Between ${a} and ${b}, which number is SMALLER?`
      },
      hint: { bm: `Bandingkan nilai tempat puluh dahulu.`, en: `Compare the tens place value first.` },
      explanation: { bm: `${answer} ialah nombor yang ${isLarger ? 'lebih besar' : 'lebih kecil'}.`, en: `${answer} is the ${isLarger ? 'greater' : 'smaller'} number.` },
      answer,
      options: [a, b]
    };
  }

  private static genY1AddSub(difficulty: Difficulty): Question {
    const isAdd = Math.random() > 0.5;
    const max = difficulty === 'hard' ? 99 : difficulty === 'medium' ? 50 : 20;

    let a = Math.floor(Math.random() * (max - 10)) + 5;
    let b = Math.floor(Math.random() * 10) + 1;

    let answer: number;
    if (isAdd) {
      answer = a + b;
    } else {
      if (a < b) [a, b] = [b, a];
      answer = a - b;
    }

    const options = generateDistractors(answer, 3, 0, 100);

    return {
      id: `y1_ops_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_1',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y1_addition_subtraction',
        topicName: { bm: '2.0 Tambah dan Tolak', en: '2.0 Addition & Subtraction' },
        standardContent: '2.1 - 2.5',
        standardLearning: '2.2.1',
        difficulty
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `${a} ${isAdd ? '+' : '-'} ${b} = ?`,
        en: `${a} ${isAdd ? '+' : '-'} ${b} = ?`
      },
      voicePrompt: {
        bm: `${a} ${isAdd ? 'tambah' : 'tolak'} ${b} sama dengan berapa?`,
        en: `What is ${a} ${isAdd ? 'plus' : 'minus'} ${b}?`
      },
      hint: { bm: `Kira unit sa dahulu, kemudian puluh.`, en: `Calculate the ones place first, then tens.` },
      explanation: { bm: `${a} ${isAdd ? '+' : '-'} ${b} = ${answer}`, en: `${a} ${isAdd ? '+' : '-'} ${b} = ${answer}` },
      answer,
      options
    };
  }

  private static genY1Fractions(): Question {
    return this.genFndFractionsBasic();
  }

  private static genY1Money(): Question {
    const item1 = Math.floor(Math.random() * 4) + 1; // RM1 - RM4
    const item2 = Math.floor(Math.random() * 4) + 1; // RM1 - RM4
    const total = item1 + item2;
    const options = generateDistractors(total, 3, 2, 10);

    return {
      id: `y1_money_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_1',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y1_money',
        topicName: { bm: '4.0 Wang Hingga RM10', en: '4.0 Money up to RM10' },
        standardContent: '4.1 - 4.2',
        standardLearning: '4.1.2',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Ali membeli buku berharga RM${item1} dan pembaris berharga RM${item2}. Berapakah jumlah wang yang perlu dibayar?`,
        en: `Ali buys a book for RM${item1} and a ruler for RM${item2}. How much does he pay altogether?`
      },
      hint: { bm: `Tambah harga kedua-dua barang: RM${item1} + RM${item2}`, en: `Add both item prices: RM${item1} + RM${item2}` },
      explanation: { bm: `RM${item1} + RM${item2} = RM${total}`, en: `RM${item1} + RM${item2} = RM${total}` },
      answer: total,
      options
    };
  }

  private static genY1Time(): Question {
    const hours = Math.floor(Math.random() * 11) + 1; // 1 to 12
    const options = generateDistractors(hours, 3, 1, 12);

    return {
      id: `y1_time_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_1',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y1_time',
        topicName: { bm: '5.0 Masa dan Waktu', en: '5.0 Time' },
        standardContent: '5.1 - 5.2',
        standardLearning: '5.2.1',
        difficulty: 'easy'
      },
      type: 'clock_time',
      prompt: {
        bm: `Jarum pendek menunjuk tepat ke angka ${hours}, jarum panjang di angka 12. Pukul berapakah sekarang?`,
        en: `Short hand points to ${hours}, long hand points to 12. What time is it?`
      },
      voicePrompt: {
        bm: `Pukul berapakah jam ini?`,
        en: `What time does this clock show?`
      },
      hint: { bm: `Jarum pendek menunjukkan jam: pukul ${hours}.`, en: `The short hand shows the hour: ${hours} o'clock.` },
      explanation: { bm: `Jam menunjukkan tepat pukul ${hours}.`, en: `The clock shows ${hours} o'clock.` },
      answer: hours,
      options,
      visualData: {
        clockTime: { hour: hours, minute: 0 }
      }
    };
  }

  private static genY1Measurement(): Question {
    return this.genBegSizes();
  }

  private static genY1Shapes(): Question {
    const shapes3D = [
      { nameBm: 'Kubus (Cube)', nameEn: 'Cube', sides: 6, emoji: '🧊' },
      { nameBm: 'Silinder (Cylinder)', nameEn: 'Cylinder', sides: 2, emoji: '🥫' },
      { nameBm: 'Kon (Cone)', nameEn: 'Cone', sides: 1, emoji: '🍦' },
      { nameBm: 'Piramid (Pyramid)', nameEn: 'Pyramid', sides: 5, emoji: '⛺' }
    ];

    const pick = shapes3D[Math.floor(Math.random() * shapes3D.length)];
    const options = shapes3D.map(s => s.nameEn);

    return {
      id: `y1_shapes_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_1',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y1_shapes',
        topicName: { bm: '7.0 Ruang: Bentuk 2D & 3D', en: '7.0 Space: 2D & 3D Shapes' },
        standardContent: '7.1 - 7.2',
        standardLearning: '7.1.1',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Apakah nama bentuk 3D ini: ${pick.emoji}?`,
        en: `What is the name of this 3D shape: ${pick.emoji}?`
      },
      hint: { bm: `Bentuk ini menyerupai ${pick.nameBm}.`, en: `This shape resembles a ${pick.nameEn}.` },
      explanation: { bm: `Bentuk 3D ini ialah ${pick.nameBm}.`, en: `This 3D shape is a ${pick.nameEn}.` },
      answer: pick.nameEn,
      options
    };
  }

  // =========================================================================
  // YEAR 2 GENERATORS (KSSR Semakan 2017)
  // =========================================================================

  private static genY2Numbers1000(difficulty: Difficulty): Question {
    const n = Math.floor(Math.random() * 850) + 120;
    const hundreds = Math.floor(n / 100);
    const tens = Math.floor((n % 100) / 10);
    const ones = n % 10;

    const askType = Math.floor(Math.random() * 3); // 0=hundreds, 1=tens, 2=ones
    const labels = [
      { bm: 'ratus', en: 'hundreds', val: hundreds },
      { bm: 'puluh', en: 'tens', val: tens },
      { bm: 'sa', en: 'ones', val: ones }
    ];
    const target = labels[askType];

    return {
      id: `y2_num_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_2',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y2_numbers_1000',
        topicName: { bm: '1.0 Nombor Bulat Hingga 1000', en: '1.0 Whole Numbers to 1000' },
        standardContent: '1.1 - 1.7',
        standardLearning: '1.2.1',
        difficulty
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Dalam nombor ${n}, apakah digit bagi nilai tempat ${target.bm.toUpperCase()}?`,
        en: `In the number ${n}, what is the digit in the ${target.en.toUpperCase()} place?`
      },
      hint: { bm: `Cerakinkan nombor: ${hundreds} ratus + ${tens} puluh + ${ones} sa.`, en: `Decompose: ${hundreds} hundreds + ${tens} tens + ${ones} ones.` },
      explanation: { bm: `Digit pada nilai tempat ${target.bm} ialah ${target.val}.`, en: `The digit in the ${target.en} place is ${target.val}.` },
      answer: target.val,
      options: generateDistractors(target.val, 3, 0, 9)
    };
  }

  private static genY2AddSub(difficulty: Difficulty): Question {
    const isAdd = Math.random() > 0.5;
    const a = Math.floor(Math.random() * 500) + 150;
    const b = Math.floor(Math.random() * 300) + 50;

    let ans: number;
    let promptBm: string;
    let promptEn: string;

    if (isAdd) {
      ans = a + b;
      promptBm = `${a} + ${b} = ?`;
      promptEn = `${a} + ${b} = ?`;
    } else {
      const bigger = Math.max(a, b);
      const smaller = Math.min(a, b);
      ans = bigger - smaller;
      promptBm = `${bigger} - ${smaller} = ?`;
      promptEn = `${bigger} - ${smaller} = ?`;
    }

    return {
      id: `y2_ops_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_2',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y2_addition_subtraction',
        topicName: { bm: '2.1 & 2.2 Tambah dan Tolak hingga 1000', en: '2.1 & 2.2 Addition & Subtraction to 1000' },
        standardContent: '2.1 - 2.2',
        standardLearning: '2.1.1',
        difficulty
      },
      type: 'numeric_keypad',
      prompt: { bm: promptBm, en: promptEn },
      voicePrompt: {
        bm: isAdd ? `${a} tambah ${b} sama dengan berapa?` : `${Math.max(a, b)} tolak ${Math.min(a, b)} sama dengan berapa?`,
        en: isAdd ? `What is ${a} plus ${b}?` : `What is ${Math.max(a, b)} minus ${Math.min(a, b)}?`
      },
      hint: { bm: 'Kira sa dahulu, kemudian puluh dan ratus dengan mengumpul semula jika perlu.', en: 'Calculate ones first, then tens and hundreds with regrouping if needed.' },
      explanation: { bm: `Jawapan tepat ialah ${ans}.`, en: `The correct answer is ${ans}.` },
      answer: ans,
      options: generateDistractors(ans, 3, 50, 999)
    };
  }

  private static genY2Operations(difficulty: Difficulty): Question {
    // Sifir 2, 3, 4, 5, 10
    const tables = [2, 3, 4, 5, 10];
    const table = tables[Math.floor(Math.random() * tables.length)];
    const factor = Math.floor(Math.random() * 9) + 1; // 1 to 9
    const isMultiplication = Math.random() > 0.4;

    if (isMultiplication) {
      const product = table * factor;
      const options = generateDistractors(product, 3, 2, 100);

      return {
        id: `y2_mul_${Date.now()}`,
        metadata: {
          curriculumVersion: 'KSSR_SEMAKAN_2017',
          level: 'year_2',
          learningArea: 'Nombor dan Operasi',
          topicId: 'y2_operations',
          topicName: { bm: '2.3 & 2.4 Darab & Bahagi (Sifir 2, 3, 4, 5, 10)', en: '2.3 & 2.4 Times Tables & Division' },
          standardContent: '2.3 - 2.4',
          standardLearning: '2.3.1',
          difficulty
        },
        type: 'numeric_keypad',
        prompt: {
          bm: `${factor} × ${table} = ?`,
          en: `${factor} × ${table} = ?`
        },
        voicePrompt: {
          bm: `${factor} darab ${table} sama dengan berapa?`,
          en: `What is ${factor} times ${table}?`
        },
        hint: { bm: `Kira dalam sifir ${table}.`, en: `Count in multiples of ${table}.` },
        explanation: { bm: `${factor} × ${table} = ${product}`, en: `${factor} × ${table} = ${product}` },
        answer: product,
        options
      };
    } else {
      const product = table * factor;
      const options = generateDistractors(factor, 3, 1, 10);

      return {
        id: `y2_div_${Date.now()}`,
        metadata: {
          curriculumVersion: 'KSSR_SEMAKAN_2017',
          level: 'year_2',
          learningArea: 'Nombor dan Operasi',
          topicId: 'y2_operations',
          topicName: { bm: '2.3 & 2.4 Darab & Bahagi (Sifir 2, 3, 4, 5, 10)', en: '2.3 & 2.4 Times Tables & Division' },
          standardContent: '2.3 - 2.4',
          standardLearning: '2.4.1',
          difficulty
        },
        type: 'numeric_keypad',
        prompt: {
          bm: `${product} ÷ ${table} = ?`,
          en: `${product} ÷ ${table} = ?`
        },
        voicePrompt: {
          bm: `${product} bahagi ${table} sama dengan berapa?`,
          en: `What is ${product} divided by ${table}?`
        },
        hint: { bm: `Apakah nombor yang apabila didarab dengan ${table} menghasilkan ${product}?`, en: `What number multiplied by ${table} gives ${product}?` },
        explanation: { bm: `${product} ÷ ${table} = ${factor}`, en: `${product} ÷ ${table} = ${factor}` },
        answer: factor,
        options
      };
    }
  }

  private static genY2FractionsDecimals(): Question {
    const tenths = Math.floor(Math.random() * 8) + 1; // 1 to 8
    const fractionStr = `${tenths}/10`;
    const decimalStr = `0.${tenths}`;

    const isFracToDec = Math.random() > 0.5;

    return {
      id: `y2_fdec_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_2',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y2_fractions_decimals',
        topicName: { bm: '3.0 Pecahan Wajar & Perpuluhan', en: '3.0 Proper Fractions & Decimals' },
        standardContent: '3.1 - 3.4',
        standardLearning: '3.2.2',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: isFracToDec
          ? `Tukarkan pecahan ${fractionStr} kepada nombor perpuluhan:`
          : `Tukarkan nombor perpuluhan ${decimalStr} kepada pecahan:`,
        en: isFracToDec
          ? `Convert the fraction ${fractionStr} to a decimal:`
          : `Convert the decimal ${decimalStr} to a fraction:`
      },
      hint: { bm: `Setiap 1/10 bersamaan dengan 0.1.`, en: `Each 1/10 equals 0.1.` },
      explanation: { bm: `${fractionStr} adalah bersamaan dengan ${decimalStr}.`, en: `${fractionStr} is equal to ${decimalStr}.` },
      answer: isFracToDec ? decimalStr : fractionStr,
      options: isFracToDec
        ? [decimalStr, `0.${tenths + 1}`, `0.0${tenths}`, `1.${tenths}`]
        : [fractionStr, `${tenths}/100`, `${tenths + 1}/10`, `1/${tenths}`]
    };
  }

  private static genY2Money100(): Question {
    const cost = Math.floor(Math.random() * 40) + 15;
    const paid = cost <= 50 ? 50 : 100;
    const balance = paid - cost;

    return {
      id: `y2_money_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_2',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y2_money_100',
        topicName: { bm: '4.0 Wang Hingga RM100', en: '4.0 Money up to RM100' },
        standardContent: '4.1 - 4.7',
        standardLearning: '4.2.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Siti membeli kasut berharga RM${cost}. Dia membayar dengan wang kertas RM${paid}. Berapakah baki wangnya?`,
        en: `Siti buys shoes costing RM${cost}. She pays with a RM${paid} note. What is her change?`
      },
      hint: { bm: `Tolak harga kasut daripada wang yang dibayar: RM${paid} - RM${cost}`, en: `Subtract item cost from money given: RM${paid} - RM${cost}` },
      explanation: { bm: `RM${paid} - RM${cost} = RM${balance}`, en: `RM${paid} - RM${cost} = RM${balance}` },
      answer: balance,
      options: generateDistractors(balance, 3, 5, 80)
    };
  }

  private static genY2TimeMeasurement(): Question {
    const minutes = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const pickMin = minutes[Math.floor(Math.random() * minutes.length)];
    const clockNum = pickMin / 5;

    return {
      id: `y2_tm_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_2',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y2_time_measurement',
        topicName: { bm: '5.0 Masa & 6.0 Ukuran (m, cm, kg, g, l, ml)', en: '5.0 Time & 6.0 Measurement' },
        standardContent: '5.1, 6.1',
        standardLearning: '5.1.2',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Apabila jarum panjang jam menunjuk ke angka ${clockNum}, ia menunjukkan berapa minit?`,
        en: `When the long hand points to number ${clockNum}, how many minutes does it represent?`
      },
      hint: { bm: `Gunakan sifir 5: ${clockNum} × 5 minit`, en: `Use multiples of 5: ${clockNum} × 5 minutes` },
      explanation: { bm: `Angka ${clockNum} mewakili ${pickMin} minit (${clockNum} × 5 = ${pickMin}).`, en: `Number ${clockNum} represents ${pickMin} minutes (${clockNum} × 5 = ${pickMin}).` },
      answer: pickMin,
      options: generateDistractors(pickMin, 3, 5, 55)
    };
  }

  // =========================================================================
  // YEAR 3 GENERATORS (KSSR Semakan 2017)
  // =========================================================================

  private static genY3Numbers10000(difficulty: Difficulty): Question {
    const thousands = Math.floor(Math.random() * 8) + 1;
    const hundreds = Math.floor(Math.random() * 9);
    const tens = Math.floor(Math.random() * 9);
    const ones = Math.floor(Math.random() * 9);
    const n = thousands * 1000 + hundreds * 100 + tens * 10 + ones;

    // Rounding to nearest thousand or hundred
    const toNearestHundred = Math.round(n / 100) * 100;
    const options = generateDistractors(toNearestHundred, 3, 1000, 9900);

    return {
      id: `y3_num_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_3',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y3_numbers_10000',
        topicName: { bm: '1.0 Nombor Bulat Hingga 10 000', en: '1.0 Numbers up to 10,000' },
        standardContent: '1.1 - 1.8',
        standardLearning: '1.6.1',
        difficulty
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Bundarkan ${n} kepada ratus terdekat:`,
        en: `Round ${n} to the nearest hundred:`
      },
      hint: { bm: `Lihat digit puluh (${tens}). Jika 5 ke atas, tambah 1 pada ratus.`, en: `Look at the tens digit (${tens}). If 5 or more, add 1 to hundreds.` },
      explanation: { bm: `${n} dibundarkan kepada ratus terdekat ialah ${toNearestHundred}.`, en: `${n} rounded to the nearest hundred is ${toNearestHundred}.` },
      answer: toNearestHundred,
      options
    };
  }

  private static genY3Operations(difficulty: Difficulty): Question {
    // Sifir 6, 7, 8, 9
    const tables = [6, 7, 8, 9];
    const table = tables[Math.floor(Math.random() * tables.length)];
    const factor = Math.floor(Math.random() * 9) + 2;
    const product = table * factor;

    return {
      id: `y3_ops_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_3',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y3_operations',
        topicName: { bm: '2.0 Operasi Asas (Tambah, Tolak, Darab, Bahagi)', en: '2.0 Basic Operations' },
        standardContent: '2.1 - 2.5',
        standardLearning: '2.3.1',
        difficulty
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `${factor} × ${table} = ?`,
        en: `${factor} × ${table} = ?`
      },
      voicePrompt: {
        bm: `${factor} darab ${table} sama dengan berapa?`,
        en: `What is ${factor} times ${table}?`
      },
      hint: { bm: `Gunakan sifir ${table}.`, en: `Recall times table for ${table}.` },
      explanation: { bm: `${factor} × ${table} = ${product}`, en: `${factor} × ${table} = ${product}` },
      answer: product,
      options: generateDistractors(product, 3, 12, 90)
    };
  }

  private static genY3FractionsPercent(): Question {
    const percentages = [10, 20, 25, 50, 75];
    const pct = percentages[Math.floor(Math.random() * percentages.length)];
    const fracMap: Record<number, string> = { 10: '1/10', 20: '1/5', 25: '1/4', 50: '1/2', 75: '3/4' };
    const answer = fracMap[pct];

    return {
      id: `y3_pct_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_3',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y3_fractions_percent',
        topicName: { bm: '3.0 Pecahan, Perpuluhan & Peratus', en: '3.0 Fractions, Decimals & Percent' },
        standardContent: '3.1 - 3.4',
        standardLearning: '3.4.1',
        difficulty: 'medium'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Nyatakan ${pct}% dalam bentuk pecahan bentuk termudah:`,
        en: `Express ${pct}% as a fraction in simplest form:`
      },
      hint: { bm: `${pct}% = ${pct}/100, kemudian permudahkan.`, en: `${pct}% = ${pct}/100, then simplify.` },
      explanation: { bm: `${pct}% dalam bentuk termudah ialah ${answer}.`, en: `${pct}% in simplest form is ${answer}.` },
      answer,
      options: [answer, '1/3', '2/5', '1/8'].sort(() => Math.random() - 0.5)
    };
  }

  private static genY3Money10000(): Question {
    const savings = Math.floor(Math.random() * 400) + 100;
    const months = Math.floor(Math.random() * 4) + 2; // 2 to 5
    const total = savings * months;

    return {
      id: `y3_money_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_3',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y3_money_10000',
        topicName: { bm: '4.0 Wang Hingga RM10 000', en: '4.0 Money up to RM10,000' },
        standardContent: '4.1 - 4.8',
        standardLearning: '4.3.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Amin menyimpan RM${savings} setiap bulan. Berapakah jumlah simpanannya selama ${months} bulan?`,
        en: `Amin saves RM${savings} every month. How much does he save in ${months} months?`
      },
      hint: { bm: `Darabkan simpanan sebulan dengan bilangan bulan: RM${savings} × ${months}`, en: `Multiply monthly savings by number of months: RM${savings} × ${months}` },
      explanation: { bm: `RM${savings} × ${months} = RM${total}`, en: `RM${savings} × ${months} = RM${total}` },
      answer: total,
      options: generateDistractors(total, 3, 200, 3000)
    };
  }

  private static genY3TimeCalendar(): Question {
    const daysInMonths = [
      { nameBm: 'Januari', nameEn: 'January', days: 31 },
      { nameBm: 'April', nameEn: 'April', days: 30 },
      { nameBm: 'Februari (tahun biasa)', nameEn: 'February (common year)', days: 28 },
      { nameBm: 'Julai', nameEn: 'July', days: 31 },
      { nameBm: 'September', nameEn: 'September', days: 30 }
    ];

    const pick = daysInMonths[Math.floor(Math.random() * daysInMonths.length)];

    return {
      id: `y3_cal_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_3',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y3_time_calendar',
        topicName: { bm: '5.0 Masa, Waktu & Kalendar', en: '5.0 Time & Calendar' },
        standardContent: '5.1 - 5.8',
        standardLearning: '5.4.1',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Berapakah bilangan hari dalam bulan ${pick.nameBm}?`,
        en: `How many days are there in the month of ${pick.nameEn}?`
      },
      hint: { bm: `Ingat lagu hari bulan: 30 hari September, April, Jun dan November...`, en: `Remember: 30 days have September, April, June, and November...` },
      explanation: { bm: `Bulan ${pick.nameBm} mempunyai ${pick.days} hari.`, en: `${pick.nameEn} has ${pick.days} days.` },
      answer: pick.days,
      options: [28, 30, 31, 29]
    };
  }

  private static genY3GeometryData(): Question {
    return {
      id: `y3_geom_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_3',
        learningArea: 'Statistik dan Kebolehjadian',
        topicId: 'y3_geometry_data',
        topicName: { bm: '7.0 Geometri & 8.0 Pengurusan Data', en: '7.0 Geometry & 8.0 Data' },
        standardContent: '7.1, 8.1',
        standardLearning: '7.1.1',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: 'Apakah jenis garis yang tidak akan pernah bersilang walaupun dipanjangkan?',
        en: 'What type of lines never intersect no matter how far they extend?'
      },
      hint: { bm: 'Contohnya seperti rel landasan kereta api.', en: 'Like railway tracks running side by side.' },
      explanation: { bm: 'Garis selari adalah garis yang sentiasa mempunyai jarak yang sama dan tidak bersilang.', en: 'Parallel lines remain the same distance apart and never intersect.' },
      answer: 'Garis Selari (Parallel Lines)',
      options: [
        'Garis Selari (Parallel Lines)',
        'Garis Serenjang (Perpendicular Lines)',
        'Garis Melengkung (Curved Lines)',
        'Garis Menegak (Vertical Lines)'
      ]
    };
  }

  // =========================================================================
  // YEAR 4, 5, 6 GENERATORS (KSSR Semakan 2017 DSKP)
  // =========================================================================

  private static genY4Numbers100000(difficulty: Difficulty): Question {
    // Mixed operations with BODMAS rule
    const a = Math.floor(Math.random() * 20) + 10;
    const b = Math.floor(Math.random() * 8) + 2;
    const c = Math.floor(Math.random() * 5) + 2;
    const ans = a + b * c; // multiplication first

    return {
      id: `y4_bodmas_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_4',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y4_numbers_100000',
        topicName: { bm: '1.0 Nombor Bulat & Operasi Bergabung', en: '1.0 Whole Numbers & Mixed Operations' },
        standardContent: '1.1 - 1.9',
        standardLearning: '1.7.1',
        difficulty
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Selesaikan: ${a} + ${b} × ${c} = ?`,
        en: `Solve: ${a} + ${b} × ${c} = ?`
      },
      hint: { bm: `Lakukan operasi darab (${b} × ${c}) terlebih dahulu mengikut hukum tertib operasi.`, en: `Perform the multiplication (${b} × ${c}) first following order of operations.` },
      explanation: { bm: `${b} × ${c} = ${b * c}, kemudian ${a} + ${b * c} = ${ans}`, en: `${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${ans}` },
      answer: ans,
      options: generateDistractors(ans, 3, 20, 100)
    };
  }

  private static genY4FractionsDecimals(): Question {
    const whole = Math.floor(Math.random() * 3) + 1;
    const num = 1;
    const den = 2; // e.g. 1 1/2 = 3/2
    const improperNum = whole * den + num;
    const answer = `${improperNum}/${den}`;

    return {
      id: `y4_fdec_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_4',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y4_fractions_decimals',
        topicName: { bm: '2.0 Pecahan, Perpuluhan & Peratus', en: '2.0 Fractions, Decimals & Percentages' },
        standardContent: '2.1 - 2.3',
        standardLearning: '2.1.2',
        difficulty: 'medium'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Tukarkan nombor bercampur ${whole} ${num}/${den} kepada pecahan tak wajar:`,
        en: `Convert the mixed number ${whole} ${num}/${den} into an improper fraction:`
      },
      hint: { bm: `Darabkan nombor bulat dengan penyebut, kemudian tambah pengangka: (${whole} × ${den}) + ${num}`, en: `Multiply whole number by denominator and add numerator: (${whole} × ${den}) + ${num}` },
      explanation: { bm: `(${whole} × ${den}) + ${num} = ${improperNum}, maka jawapannya ialah ${answer}.`, en: `(${whole} × ${den}) + ${num} = ${improperNum}, so the answer is ${answer}.` },
      answer,
      options: [answer, `${improperNum + 1}/${den}`, `${whole * 2}/${den}`, `${improperNum}/4`]
    };
  }

  private static genY4Money100000(): Question {
    const currencies = [
      { countryBm: 'Jepun', countryEn: 'Japan', curr: 'Yen (JPY)' },
      { countryBm: 'United Kingdom', countryEn: 'United Kingdom', curr: 'Pound Sterling (GBP)' },
      { countryBm: 'Amerika Syarikat', countryEn: 'United States', curr: 'Dollar (USD)' },
      { countryBm: 'Arab Saudi', countryEn: 'Saudi Arabia', curr: 'Riyal (SAR)' }
    ];
    const pick = currencies[Math.floor(Math.random() * currencies.length)];

    return {
      id: `y4_curr_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_4',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y4_money_100000',
        topicName: { bm: '3.0 Wang Hingga RM100 000', en: '3.0 Money up to RM100,000' },
        standardContent: '3.1 - 3.3',
        standardLearning: '3.1.1',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Apakah mata wang bagi negara ${pick.countryBm}?`,
        en: `What is the currency of ${pick.countryEn}?`
      },
      hint: { bm: `Pilih mata wang rasmi negara tersebut.`, en: `Choose the official currency of that country.` },
      explanation: { bm: `Mata wang bagi ${pick.countryBm} ialah ${pick.curr}.`, en: `The currency of ${pick.countryEn} is ${pick.curr}.` },
      answer: pick.curr,
      options: currencies.map(c => c.curr)
    };
  }

  private static genY4TimeDecades(): Question {
    const decades = Math.floor(Math.random() * 6) + 2; // 2 to 7
    const years = decades * 10;

    return {
      id: `y4_dec_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_4',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y4_time_decades',
        topicName: { bm: '4.0 Masa & Waktu: Dekad & Abad', en: '4.0 Time: Decades & Centuries' },
        standardContent: '4.1 - 4.4',
        standardLearning: '4.1.1',
        difficulty: 'easy'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `${decades} dekad bersamaan dengan berapa tahun?`,
        en: `${decades} decades is equal to how many years?`
      },
      hint: { bm: `1 dekad = 10 tahun. Maka darabkan dengan 10.`, en: `1 decade = 10 years. Multiply by 10.` },
      explanation: { bm: `${decades} × 10 = ${years} tahun`, en: `${decades} × 10 = ${years} years` },
      answer: years,
      options: generateDistractors(years, 3, 10, 100)
    };
  }

  private static genY4GeometryArea(): Question {
    const length = Math.floor(Math.random() * 8) + 4;
    const width = Math.floor(Math.random() * 5) + 2;
    const area = length * width;

    return {
      id: `y4_area_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_4',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y4_geometry_area',
        topicName: { bm: '6.0 Ruang: Perimeter & Luas', en: '6.0 Space: Perimeter & Area' },
        standardContent: '6.1 - 6.4',
        standardLearning: '6.3.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Kira luas segi empat tepat dengan panjang ${length} cm dan lebar ${width} cm:`,
        en: `Calculate the area of a rectangle with length ${length} cm and width ${width} cm:`
      },
      hint: { bm: `Rumus Luas = Panjang × Lebar`, en: `Area Formula = Length × Width` },
      explanation: { bm: `Luas = ${length} cm × ${width} cm = ${area} cm²`, en: `Area = ${length} cm × ${width} cm = ${area} cm²` },
      answer: area,
      options: generateDistractors(area, 3, 10, 80)
    };
  }

  private static genY4CoordinatesData(): Question {
    const x = Math.floor(Math.random() * 5) + 1;
    const y = Math.floor(Math.random() * 5) + 1;

    return {
      id: `y4_coord_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_4',
        learningArea: 'Perkaitan dan Aljabar',
        topicId: 'y4_coordinates_data',
        topicName: { bm: '7.0 Koordinat, Nisbah & 8.0 Data Carta Pai', en: '7.0 Coordinates, Ratio & 8.0 Pie Charts' },
        standardContent: '7.1, 8.1',
        standardLearning: '7.1.1',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Titik P terletak ${x} unit mengufuk (paksi-x) dan ${y} unit mencancang (paksi-y) dari asalan (0,0). Apakah koordinat titik P?`,
        en: `Point P is located ${x} units horizontally (x-axis) and ${y} units vertically (y-axis) from origin (0,0). What are the coordinates of P?`
      },
      hint: { bm: `Koordinat ditulis dalam format (x, y).`, en: `Coordinates are written in the format (x, y).` },
      explanation: { bm: `Koordinat P ialah (${x}, ${y}).`, en: `Coordinates of P are (${x}, ${y}).` },
      answer: `(${x}, ${y})`,
      options: [`(${x}, ${y})`, `(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y + 1})`]
    };
  }

  // --- Year 5 ---
  private static genY5Numbers1000000(difficulty: Difficulty): Question {
    // Prime numbers within 50
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const nonPrimes = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 25, 27];

    const prime = primes[Math.floor(Math.random() * primes.length)];
    const distractors = nonPrimes.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [prime, ...distractors].sort(() => Math.random() - 0.5);

    return {
      id: `y5_prime_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_5',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y5_numbers_1000000',
        topicName: { bm: '1.0 Nombor Bulat & Nombor Perdana', en: '1.0 Numbers to 1,000,000 & Primes' },
        standardContent: '1.1 - 1.4',
        standardLearning: '1.2.1',
        difficulty
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Antara nombor berikut, yang manakah merupakan NOMBOR PERDANA?`,
        en: `Which of the following numbers is a PRIME NUMBER?`
      },
      hint: { bm: `Nombor perdana hanya boleh dibahagi dengan 1 dan dirinya sendiri sahaja.`, en: `A prime number can only be divided by 1 and itself.` },
      explanation: { bm: `${prime} ialah nombor perdana kerana faktornya hanyalah 1 dan ${prime}.`, en: `${prime} is a prime number because its only factors are 1 and ${prime}.` },
      answer: prime,
      options
    };
  }

  private static genY5FractionsAdvanced(): Question {
    const fraction = '1/4';
    const total = 40;
    const ans = 10;

    return {
      id: `y5_frac_adv_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_5',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y5_fractions_advanced',
        topicName: { bm: '2.0 Operasi Pecahan, Perpuluhan & Peratus', en: '2.0 Operations with Fractions & Percent' },
        standardContent: '2.1 - 2.4',
        standardLearning: '2.1.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Kira 1/4 daripada ${total} biji durian:`,
        en: `Calculate 1/4 of ${total} durians:`
      },
      hint: { bm: `Darabkan pecahan dengan kuantiti: 1/4 × ${total} = ${total} ÷ 4`, en: `Multiply fraction by quantity: 1/4 × ${total} = ${total} ÷ 4` },
      explanation: { bm: `1/4 × ${total} = ${ans}`, en: `1/4 × ${total} = ${ans}` },
      answer: ans,
      options: generateDistractors(ans, 3, 5, 30)
    };
  }

  private static genY5MoneyInvestments(): Question {
    const principal = 1000;
    const rate = 5; // 5%
    const interest = (principal * rate) / 100;

    return {
      id: `y5_invest_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_5',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y5_money_investments',
        topicName: { bm: '3.0 Wang: Simpanan, Pelaburan & Faedah', en: '3.0 Money: Savings, Investment & Interest' },
        standardContent: '3.1 - 3.4',
        standardLearning: '3.2.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Encik Razak menyimpan RM${principal} di bank dengan faedah mudah ${rate}% setahun. Berapakah faedah yang diterimanya selepas 1 tahun?`,
        en: `Mr Razak saves RM${principal} in a bank with ${rate}% simple interest per year. How much interest does he receive after 1 year?`
      },
      hint: { bm: `Faedah = ${rate}% × RM${principal} = (${rate}/100) × ${principal}`, en: `Interest = ${rate}% × RM${principal} = (${rate}/100) × ${principal}` },
      explanation: { bm: `Faedah = (${rate} / 100) × RM${principal} = RM${interest}`, en: `Interest = (${rate} / 100) × RM${principal} = RM${interest}` },
      answer: interest,
      options: generateDistractors(interest, 3, 10, 100)
    };
  }

  private static genY5TimeZones(): Question {
    const startHour = 14; // 2:00 PM
    const duration = 3; // 3 hours
    const endHour = startHour + duration;

    return {
      id: `y5_tz_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_5',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y5_time_zones',
        topicName: { bm: '4.0 Masa: Tempoh & Zon Waktu', en: '4.0 Time: Duration & Time Zones' },
        standardContent: '4.1',
        standardLearning: '4.1.1',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Penerbangan bertolak dari Kuala Lumpur pada jam 1400 dan mengambil masa ${duration} jam untuk tiba di Kuching. Pukul berapakah kapal terbang itu tiba?`,
        en: `A flight departs Kuala Lumpur at 1400 hours and takes ${duration} hours to reach Kuching. What time does it arrive?`
      },
      hint: { bm: `Tambah tempoh penerbangan ke waktu berlepas: 1400 + 3 jam`, en: `Add duration to departure time: 1400 + 3 hours` },
      explanation: { bm: `1400 + 3 jam = Jam ${endHour}00`, en: `1400 + 3 hours = ${endHour}00 hours` },
      answer: `Jam ${endHour}00`,
      options: [`Jam ${endHour}00`, `Jam ${endHour + 1}00`, `Jam ${endHour - 1}00`, `Jam 1800`]
    };
  }

  private static genY5GeometryVolume(): Question {
    const s = Math.floor(Math.random() * 4) + 2; // 2 to 5 cm
    const volume = s * s * s;

    return {
      id: `y5_vol_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_5',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y5_geometry_volume',
        topicName: { bm: '6.0 Ruang: Poligon Sekata & Isi Padu', en: '6.0 Space: Regular Polygons & Volume' },
        standardContent: '6.1 - 6.4',
        standardLearning: '6.3.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Kira isi padu sebuah kubus dengan panjang sisi ${s} cm:`,
        en: `Calculate the volume of a cube with side length ${s} cm:`
      },
      hint: { bm: `Rumus Isi Padu Kubus = sisi × sisi × sisi`, en: `Volume Formula = side × side × side` },
      explanation: { bm: `Isi padu = ${s} × ${s} × ${s} = ${volume} cm³`, en: `Volume = ${s} × ${s} × ${s} = ${volume} cm³` },
      answer: volume,
      options: generateDistractors(volume, 3, 8, 125)
    };
  }

  private static genY5Stats(): Question {
    // Mean of 3 numbers
    const avg = Math.floor(Math.random() * 10) + 10;
    const n1 = avg - 2;
    const n2 = avg;
    const n3 = avg + 2;

    return {
      id: `y5_mean_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_5',
        learningArea: 'Statistik dan Kebolehjadian',
        topicId: 'y5_stats_mode_median_mean',
        topicName: { bm: '8.0 Pengurusan Data: Mod, Median, Min & Julat', en: '8.0 Data: Mode, Median, Mean & Range' },
        standardContent: '8.1 - 8.3',
        standardLearning: '8.1.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Cari min (purata) bagi set nombor ini: ${n1}, ${n2}, ${n3}`,
        en: `Find the mean (average) of this data set: ${n1}, ${n2}, ${n3}`
      },
      hint: { bm: `Min = Jumlah nilai data ÷ bilangan data: (${n1} + ${n2} + ${n3}) ÷ 3`, en: `Mean = Total sum ÷ count: (${n1} + ${n2} + ${n3}) ÷ 3` },
      explanation: { bm: `(${n1} + ${n2} + ${n3}) ÷ 3 = ${n1 + n2 + n3} ÷ 3 = ${avg}`, en: `(${n1} + ${n2} + ${n3}) ÷ 3 = ${n1 + n2 + n3} ÷ 3 = ${avg}` },
      answer: avg,
      options: generateDistractors(avg, 3, 5, 25)
    };
  }

  // --- Year 6 ---
  private static genY6Numbers10000000(difficulty: Difficulty): Question {
    const million = 1.5;
    const actual = 1500000;

    return {
      id: `y6_mil_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_6',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y6_numbers_10000000',
        topicName: { bm: '1.0 Nombor Bulat & Operasi Hingga 10 Juta', en: '1.0 Whole Numbers up to 10 Million' },
        standardContent: '1.1 - 1.4',
        standardLearning: '1.1.2',
        difficulty
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Tukarkan 1.5 juta kepada nombor bulat:`,
        en: `Convert 1.5 million into a whole number:`
      },
      hint: { bm: `1.5 juta = 1.5 × 1 000 000`, en: `1.5 million = 1.5 × 1,000,000` },
      explanation: { bm: `1.5 × 1 000 000 = 1 500 000`, en: `1.5 × 1,000,000 = 1,500,000` },
      answer: '1 500 000',
      options: ['1 500 000', '150 000', '15 000 000', '1 050 000']
    };
  }

  private static genY6FractionsDecimalsPercent(): Question {
    const discount = 20; // 20%
    const price = 80;
    const savings = (price * discount) / 100;
    const finalPrice = price - savings;

    return {
      id: `y6_disc_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_6',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y6_fractions_decimals_percent',
        topicName: { bm: '2.0 Operasi Bergabung & Masalah Berayat', en: '2.0 Mixed Operations & Word Problems' },
        standardContent: '2.1 - 2.3',
        standardLearning: '2.2.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Sebuah beg berharga RM${price} ditawarkan diskaun ${discount}%. Berapakah harga beg itu selepas diskaun?`,
        en: `A bag priced at RM${price} is offered with a ${discount}% discount. What is the price after discount?`
      },
      hint: { bm: `Kira nilai diskaun (${discount}% × RM${price}), kemudian tolak daripada harga asal.`, en: `Calculate discount (${discount}% × RM${price}), then subtract from original price.` },
      explanation: { bm: `Diskaun = RM${savings}. Harga jualan = RM${price} - RM${savings} = RM${finalPrice}.`, en: `Discount = RM${savings}. Sale price = RM${price} - RM${savings} = RM${finalPrice}.` },
      answer: finalPrice,
      options: generateDistractors(finalPrice, 3, 40, 90)
    };
  }

  private static genY6MoneyFinancial(): Question {
    const cost = 50;
    const sell = 75;
    const profit = sell - cost;

    return {
      id: `y6_profit_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_6',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y6_money_financial',
        topicName: { bm: '3.0 Wang: Untung, Rugi, Diskaun, Cukai & Invois', en: '3.0 Money: Profit, Loss, Discount & Tax' },
        standardContent: '3.1 - 3.3',
        standardLearning: '3.1.2',
        difficulty: 'easy'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Peniaga membeli baju dengan harga kos RM${cost} dan menjualnya pada harga RM${sell}. Berapakah keuntungan peniaga itu?`,
        en: `A merchant buys a shirt at cost price RM${cost} and sells it for RM${sell}. How much profit did the merchant make?`
      },
      hint: { bm: `Untung = Harga Jual - Harga Kos`, en: `Profit = Selling Price - Cost Price` },
      explanation: { bm: `Untung = RM${sell} - RM${cost} = RM${profit}`, en: `Profit = RM${sell} - RM${cost} = RM${profit}` },
      answer: profit,
      options: generateDistractors(profit, 3, 10, 40)
    };
  }

  private static genY6TimeSpeed(): Question {
    const speed = 80; // 80 km/h
    const time = 2; // 2 hours
    const distance = speed * time;

    return {
      id: `y6_speed_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_6',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y6_time_speed',
        topicName: { bm: '4.0 Masa, Waktu & Laju (Kelajuan)', en: '4.0 Time & Speed' },
        standardContent: '4.1 - 4.2',
        standardLearning: '4.2.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Sebuah kereta memandu dengan kelajuan ${speed} km/j selama ${time} jam. Berapakah jumlah jarak yang dilalui?`,
        en: `A car travels at a speed of ${speed} km/h for ${time} hours. What is the total distance traveled?`
      },
      hint: { bm: `Rumus: Jarak = Laju × Masa`, en: `Formula: Distance = Speed × Time` },
      explanation: { bm: `Jarak = ${speed} km/j × ${time} jam = ${distance} km`, en: `Distance = ${speed} km/h × ${time} hours = ${distance} km` },
      answer: distance,
      options: generateDistractors(distance, 3, 100, 240)
    };
  }

  private static genY6GeometryComposite(): Question {
    const areaA = 20;
    const areaB = 15;
    const totalArea = areaA + areaB;

    return {
      id: `y6_comp_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_6',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y6_geometry_composite',
        topicName: { bm: '5.0 Ruang: Bentuk Gabungan & Sudut', en: '5.0 Space: Composite Shapes & Angles' },
        standardContent: '5.1 - 5.3',
        standardLearning: '5.2.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Sebuah bentuk gabungan terdiri daripada segi empat A (luas ${areaA} cm²) dan segi tiga B (luas ${areaB} cm²). Berapakah jumlah luas bentuk gabungan itu?`,
        en: `A composite shape consists of rectangle A (area ${areaA} cm²) and triangle B (area ${areaB} cm²). What is the total area?`
      },
      hint: { bm: `Jumlahkan luas kedua-dua bentuk: ${areaA} + ${areaB}`, en: `Add the areas of both shapes: ${areaA} + ${areaB}` },
      explanation: { bm: `Jumlah Luas = ${areaA} + ${areaB} = ${totalArea} cm²`, en: `Total Area = ${areaA} + ${areaB} = ${totalArea} cm²` },
      answer: totalArea,
      options: generateDistractors(totalArea, 3, 25, 50)
    };
  }

  private static genY6ProbabilityData(): Question {
    const situations = [
      {
        promptBm: 'Matahari terbit di sebelah timur esok pagi.',
        promptEn: 'The sun rises in the east tomorrow morning.',
        ansBm: 'Pasti (Certain)',
        ansEn: 'Certain'
      },
      {
        promptBm: 'Mendapat nombor 7 apabila melambung sebiji dadu bernombor 1 hingga 6.',
        promptEn: 'Rolling a 7 on a standard 6-sided die.',
        ansBm: 'Mustahil (Impossible)',
        ansEn: 'Impossible'
      },
      {
        promptBm: 'Hujan akan turun di Kuala Lumpur pada petang ini.',
        promptEn: 'It will rain in Kuala Lumpur this afternoon.',
        ansBm: 'Mungkin berlaku (Likely / Possible)',
        ansEn: 'Possible'
      }
    ];

    const pick = situations[Math.floor(Math.random() * situations.length)];

    return {
      id: `y6_prob_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_6',
        learningArea: 'Statistik dan Kebolehjadian',
        topicId: 'y6_probability_data',
        topicName: { bm: '7.0 Kebolehjadian & Tafsir Data', en: '7.0 Probability & Data Interpretation' },
        standardContent: '7.1 - 8.1',
        standardLearning: '7.1.1',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Tentukan kebolehjadian bagi peristiwa ini: "${pick.promptBm}"`,
        en: `Determine the likelihood of this event: "${pick.promptEn}"`
      },
      hint: { bm: `Fikirkan sama ada ia pasti berlaku, mungkin berlaku, atau mustahil berlaku.`, en: `Think if it is certain, possible, or impossible.` },
      explanation: { bm: `Kebolehjadian bagi peristiwa ini ialah ${pick.ansBm}.`, en: `The likelihood of this event is ${pick.ansEn}.` },
      answer: pick.ansBm,
      options: [
        'Pasti (Certain)',
        'Mungkin berlaku (Likely / Possible)',
        'Mustahil (Impossible)',
        'Sama kemungkinan (Equally Likely)'
      ]
    };
  }
}
