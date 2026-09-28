// Procedural Curriculum Question Generator for all 9 levels (KSPK 2017 / KSSR Semakan 2017)
import { LevelId, Question, VisualObjectItem, Difficulty, CurriculumMetadata, QuestionType } from '../types/curriculum';
import { CURRICULUM_LEVELS } from './kpmCurriculum';
import { storage } from '../services/storage';
import { numberToWords } from '../utils/numberWords';

const CUTE_EMOJIS = ['🍎', '⭐', '🎈', '🦆', '🐱', '🥕', '🐟', '🚗', '🍬', '🍌', '🍓', '🧁', '🚀', '⚽'];

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function coin(): boolean {
  return Math.random() < 0.5;
}

// Unbiased Fisher-Yates shuffle (Array.sort(() => Math.random() - 0.5) is NOT uniform)
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Builds a shuffled answer list: the correct answer plus unique distractors.
// Duplicates are dropped so the same value can never appear twice.
function buildOptions<T extends number | string>(answer: T, candidates: T[], count = 3): T[] {
  const out: T[] = [answer];
  for (const c of shuffle(candidates)) {
    if (out.length >= count + 1) break;
    if (!out.some(v => String(v) === String(c))) out.push(c);
  }
  return shuffle(out);
}

// Numeric distractors near the answer, clamped to [min, max]. Always terminates.
function generateDistractors(answer: number, count = 3, min = 0, max = 100, step = 1): number[] {
  const near: number[] = [];
  for (let d = 1; d <= 6; d++) {
    near.push(answer + d * step, answer - d * step);
  }
  const chosen = shuffle(near.filter(v => v >= min && v <= max && v !== answer)).slice(0, count);

  // Widen the search only if the tight window could not supply enough values
  for (let d = 7; chosen.length < count && d <= 400; d++) {
    for (const v of [answer + d * step, answer - d * step]) {
      if (v >= min && v <= max && v !== answer && !chosen.includes(v) && chosen.length < count) {
        chosen.push(v);
      }
    }
  }

  return shuffle([answer, ...chosen]);
}

// Malaysian-style thousands separator: 1 500 000
function fmt(n: number): string {
  return n.toLocaleString('en-US').replace(/,/g, ' ');
}

function emojiRow(count: number, emoji: string, prefix: string): VisualObjectItem[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}_${i}`,
    emoji,
    tapped: false
  }));
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
    const n = randInt(1, max);
    const emoji = pickOne(CUTE_EMOJIS);

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
      prompt: { bm: `Pilih nombor ${n}`, en: `Choose number ${n}` },
      voicePrompt: { bm: `Pilih nombor ${n}`, en: `Choose number ${n}` },
      hint: { bm: 'Cari angka yang sama seperti dalam soalan.', en: 'Look for the numeral that matches the question.' },
      explanation: { bm: `Ini ialah angka ${n}!`, en: `This is number ${n}!` },
      answer: n,
      options: generateDistractors(n, 3, 0, 10),
      visualData: { items: emojiRow(n, emoji, 'item') }
    };
  }

  private static genBegCountObjects(difficulty: Difficulty): Question {
    const max = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 7 : 5;
    const count = randInt(2, max);
    const emoji = pickOne(CUTE_EMOJIS);
    const items = emojiRow(count, emoji, 'count_item');

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
        bm: 'Berapa banyak objek yang ada? Sentuh untuk mengira!',
        en: 'How many objects are there? Tap to count!'
      },
      voicePrompt: {
        bm: 'Berapakah bilangan objek ini? Mari sentuh dan kira bersama!',
        en: 'How many objects are here? Let us tap and count together!'
      },
      hint: {
        bm: 'Sentuh setiap objek satu demi satu sambil menyebut nombornya.',
        en: 'Tap each object one by one and say the number out loud.'
      },
      explanation: { bm: `Semuanya ada ${count} ${emoji}!`, en: `There are ${count} ${emoji} in total!` },
      answer: count,
      options: generateDistractors(count, 3, 1, 10),
      visualData: { items, targetCount: count }
    };
  }

  private static genBegMoreLess(): Question {
    const askMore = coin();
    const countA = randInt(2, 6);
    let countB = randInt(2, 6);
    while (countB === countA) countB = randInt(2, 6);

    const emojiA = '🍎';
    const emojiB = '🍌';
    const bigger = countA > countB ? 'A' : 'B';
    const smaller = countA > countB ? 'B' : 'A';
    const correctGroup = askMore ? bigger : smaller;
    const winnerBm = correctGroup === 'A' ? 'Kumpulan A' : 'Kumpulan B';
    const winnerEn = correctGroup === 'A' ? 'Group A' : 'Group B';
    const winnerCount = correctGroup === 'A' ? countA : countB;
    const otherCount = correctGroup === 'A' ? countB : countA;

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
        bm: askMore ? 'Kumpulan manakah yang LEBIH BANYAK?' : 'Kumpulan manakah yang LEBIH SEDIKIT?',
        en: askMore ? 'Which group has MORE?' : 'Which group has FEWER?'
      },
      voicePrompt: {
        bm: askMore ? 'Pilih kumpulan yang mempunyai LEBIH BANYAK objek!' : 'Pilih kumpulan yang mempunyai LEBIH SEDIKIT objek!',
        en: askMore ? 'Pick the group that has MORE objects!' : 'Pick the group that has FEWER objects!'
      },
      hint: {
        bm: 'Kira objek dalam setiap kumpulan, kemudian bandingkan bilangannya.',
        en: 'Count the objects in each group, then compare the two numbers.'
      },
      explanation: {
        bm: `${winnerBm} ada ${winnerCount} objek, ${correctGroup === 'A' ? 'Kumpulan B' : 'Kumpulan A'} ada ${otherCount}. Jadi ${winnerBm} ${askMore ? 'lebih banyak' : 'lebih sedikit'}.`,
        en: `${winnerEn} has ${winnerCount}, the other has ${otherCount}. So ${winnerEn} has ${askMore ? 'more' : 'fewer'}.`
      },
      answer: correctGroup,
      options: ['A', 'B'],
      visualData: {
        groupA: emojiRow(countA, emojiA, 'a'),
        groupB: emojiRow(countB, emojiB, 'b'),
        comparisonPair: {
          left: { emoji: emojiA, label: { bm: 'Kumpulan A', en: 'Group A' }, value: 'A' },
          right: { emoji: emojiB, label: { bm: 'Kumpulan B', en: 'Group B' }, value: 'B' },
          criteria: askMore ? 'more' : 'less'
        }
      }
    };
  }

  private static genBegSizes(): Question {
    // In every pair, `big` is objectively the larger / taller one.
    const sets = [
      { big: { emoji: '🐘', bm: 'Gajah', en: 'Elephant' }, small: { emoji: '🐜', bm: 'Semut', en: 'Ant' }, dim: 'size' },
      { big: { emoji: '🍉', bm: 'Tembikai', en: 'Watermelon' }, small: { emoji: '🍓', bm: 'Strawberi', en: 'Strawberry' }, dim: 'size' },
      { big: { emoji: '🚌', bm: 'Bas', en: 'Bus' }, small: { emoji: '🚲', bm: 'Basikal', en: 'Bicycle' }, dim: 'size' },
      { big: { emoji: '🐋', bm: 'Ikan paus', en: 'Whale' }, small: { emoji: '🐠', bm: 'Ikan kecil', en: 'Small fish' }, dim: 'size' },
      { big: { emoji: '🦒', bm: 'Zirafah', en: 'Giraffe' }, small: { emoji: '🐢', bm: 'Kura-kura', en: 'Turtle' }, dim: 'height' },
      { big: { emoji: '🌳', bm: 'Pokok besar', en: 'Big tree' }, small: { emoji: '🌱', bm: 'Anak benih', en: 'Seedling' }, dim: 'height' }
    ] as const;

    const set = pickOne(sets);
    const askBig = coin();
    const bigOnLeft = coin();

    const left = bigOnLeft ? set.big : set.small;
    const right = bigOnLeft ? set.small : set.big;
    const answer = askBig === bigOnLeft ? 'left' : 'right';

    const promptBm = set.dim === 'height'
      ? (askBig ? 'Yang manakah LEBIH TINGGI?' : 'Yang manakah LEBIH RENDAH?')
      : (askBig ? 'Yang manakah LEBIH BESAR?' : 'Yang manakah LEBIH KECIL?');
    const promptEn = set.dim === 'height'
      ? (askBig ? 'Which one is TALLER?' : 'Which one is SHORTER?')
      : (askBig ? 'Which one is BIGGER?' : 'Which one is SMALLER?');

    const criteria = set.dim === 'height'
      ? (askBig ? 'taller' : 'shorter')
      : (askBig ? 'bigger' : 'smaller');

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
      prompt: { bm: promptBm, en: promptEn },
      voicePrompt: { bm: promptBm, en: promptEn },
      hint: {
        bm: 'Bayangkan kedua-duanya berdiri bersebelahan. Yang mana memenuhi ruang lebih besar?',
        en: 'Picture them side by side. Which one takes up more space?'
      },
      explanation: {
        bm: `${set.big.bm} lebih ${set.dim === 'height' ? 'tinggi' : 'besar'} daripada ${set.small.bm}.`,
        en: `A ${set.big.en.toLowerCase()} is ${set.dim === 'height' ? 'taller' : 'bigger'} than a ${set.small.en.toLowerCase()}.`
      },
      answer,
      options: ['left', 'right'],
      visualData: {
        comparisonPair: {
          left: { emoji: left.emoji, label: { bm: left.bm, en: left.en }, value: 'left' },
          right: { emoji: right.emoji, label: { bm: right.bm, en: right.en }, value: 'right' },
          criteria
        }
      }
    };
  }

  private static genBegShapesColors(): Question {
    const shapes = [
      { bm: 'Bulatan', en: 'Circle', emoji: '🔴', type: 'circle', hintBm: 'Bentuk ini bulat dan tiada penjuru.', hintEn: 'This shape is round with no corners.' },
      { bm: 'Segi Empat Sama', en: 'Square', emoji: '🟦', type: 'square', hintBm: 'Bentuk ini ada 4 sisi yang sama panjang.', hintEn: 'This shape has 4 sides of equal length.' },
      { bm: 'Segi Tiga', en: 'Triangle', emoji: '🔺', type: 'triangle', hintBm: 'Bentuk ini ada 3 sisi dan 3 penjuru.', hintEn: 'This shape has 3 sides and 3 corners.' },
      { bm: 'Bintang', en: 'Star', emoji: '⭐', type: 'star', hintBm: 'Bentuk ini ada lima bucu yang tajam.', hintEn: 'This shape has five pointy tips.' }
    ] as const;

    const pick = pickOne(shapes);

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
      // Options are the shapes themselves, so a child who cannot read yet can still answer.
      prompt: { bm: `Pilih bentuk ${pick.bm}`, en: `Choose the ${pick.en}` },
      voicePrompt: { bm: `Pilih bentuk ${pick.bm}!`, en: `Choose the ${pick.en}!` },
      hint: { bm: pick.hintBm, en: pick.hintEn },
      explanation: { bm: `Tepat sekali! ${pick.emoji} ialah ${pick.bm}.`, en: `Spot on! ${pick.emoji} is a ${pick.en.toLowerCase()}.` },
      answer: pick.emoji,
      options: shuffle(shapes.map(s => s.emoji)),
      visualData: { shapeType: pick.type as any }
    };
  }

  private static genBegPositions(): Question {
    const dirs = {
      up: { emoji: '⬆️', bm: 'Atas', en: 'Up', hintBm: 'Atas menuju ke langit.', hintEn: 'Up points to the sky.' },
      down: { emoji: '⬇️', bm: 'Bawah', en: 'Down', hintBm: 'Bawah menuju ke lantai.', hintEn: 'Down points to the floor.' },
      left: { emoji: '⬅️', bm: 'Kiri', en: 'Left', hintBm: 'Kiri ialah arah tangan kiri anda.', hintEn: 'Left is the side of your left hand.' },
      right: { emoji: '➡️', bm: 'Kanan', en: 'Right', hintBm: 'Kanan ialah arah tangan kanan anda.', hintEn: 'Right is the side of your right hand.' }
    } as const;

    type DirKey = keyof typeof dirs;
    const pair: DirKey[] = coin() ? ['up', 'down'] : ['left', 'right'];
    const targetKey = pickOne(pair);
    const [leftKey, rightKey] = coin() ? pair : [pair[1], pair[0]];
    const target = dirs[targetKey];

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
        bm: `Pilih anak panah yang menunjuk ke ${target.bm.toUpperCase()}`,
        en: `Pick the arrow pointing ${target.en.toUpperCase()}`
      },
      voicePrompt: {
        bm: `Pilih panah ke ${target.bm.toLowerCase()}!`,
        en: `Pick the arrow pointing ${target.en.toLowerCase()}!`
      },
      hint: { bm: target.hintBm, en: target.hintEn },
      explanation: {
        bm: `Anak panah ${target.emoji} menghala ke ${target.bm.toLowerCase()}!`,
        en: `Arrow ${target.emoji} points ${target.en.toLowerCase()}!`
      },
      answer: targetKey,
      options: [leftKey, rightKey],
      visualData: {
        comparisonPair: {
          left: { emoji: dirs[leftKey].emoji, label: { bm: dirs[leftKey].bm, en: dirs[leftKey].en }, value: leftKey },
          right: { emoji: dirs[rightKey].emoji, label: { bm: dirs[rightKey].bm, en: dirs[rightKey].en }, value: rightKey },
          criteria: targetKey
        }
      }
    };
  }

  private static genBegPatterns(): Question {
    const palettes = [
      ['🔴', '🔵', '🟢'],
      ['🟡', '🟣', '🟤'],
      ['🐱', '🐶', '🐰'],
      ['⭐', '🌙', '☀️'],
      ['🍎', '🍌', '🍇']
    ];

    const pal = shuffle(pickOne(palettes));
    const kind = pickOne(['AB', 'AAB', 'ABB', 'ABC'] as const);
    const unit =
      kind === 'AB' ? [pal[0], pal[1]] :
      kind === 'AAB' ? [pal[0], pal[0], pal[1]] :
      kind === 'ABB' ? [pal[0], pal[1], pal[1]] :
      [pal[0], pal[1], pal[2]];

    const full = Array.from({ length: 6 }).map((_, i) => unit[i % unit.length]);
    const answer = full[5];
    const sequence = [...full.slice(0, 5), '?'];
    const options = buildOptions(answer, pal.filter(e => e !== answer), 2);

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
      prompt: { bm: 'Apakah objek yang seterusnya?', en: 'What is the next item in the pattern?' },
      voicePrompt: {
        bm: 'Lihat corak ini. Apakah yang datang seterusnya?',
        en: 'Look at the pattern. What comes next?'
      },
      hint: {
        bm: `Corak ini berulang setiap ${unit.length} objek. Lihat semula objek di permulaan.`,
        en: `This pattern repeats every ${unit.length} items. Look back at the start.`
      },
      explanation: {
        bm: `Corak berulang ${unit.join(' ')} — jadi selepas itu ialah ${answer}.`,
        en: `The pattern repeats ${unit.join(' ')} — so ${answer} comes next.`
      },
      answer,
      options,
      visualData: { patternSequence: sequence, patternOptions: options }
    };
  }

  // =========================================================================
  // PRESCHOOL GENERATORS
  // =========================================================================

  private static genPreNumbers0_20(difficulty: Difficulty): Question {
    const min = difficulty === 'hard' ? 11 : 1;
    const max = difficulty === 'easy' ? 10 : 20;
    const n = randInt(min, max);

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
      prompt: { bm: `Pilih nombor ${n}`, en: `Choose number ${n}` },
      voicePrompt: { bm: `Pilih nombor ${n}`, en: `Choose number ${n}` },
      hint: {
        bm: 'Nombor belasan bermula dengan angka 1 di hadapan.',
        en: 'Teen numbers start with the digit 1 in front.'
      },
      explanation: { bm: `Ya, ini ialah nombor ${n}!`, en: `Yes, that is number ${n}!` },
      answer: n,
      options: generateDistractors(n, 3, 0, 20)
    };
  }

  private static genPreSequences(): Question {
    const kind = pickOne(['before', 'after', 'between'] as const);
    const n = randInt(1, 17);

    let answer: number;
    let promptBm: string;
    let promptEn: string;

    if (kind === 'before') {
      answer = n;
      promptBm = `Apakah nombor SEBELUM ${n + 1}?`;
      promptEn = `What number comes BEFORE ${n + 1}?`;
    } else if (kind === 'after') {
      answer = n + 1;
      promptBm = `Apakah nombor SELEPAS ${n}?`;
      promptEn = `What number comes AFTER ${n}?`;
    } else {
      answer = n + 1;
      promptBm = `Apakah nombor di ANTARA ${n} dan ${n + 2}?`;
      promptEn = `What number comes BETWEEN ${n} and ${n + 2}?`;
    }

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
      hint: {
        bm: 'Nombor sebelum ialah satu kurang. Nombor selepas ialah satu lebih.',
        en: 'The number before is one less. The number after is one more.'
      },
      explanation: { bm: `Tepat! Jawapannya ialah ${answer}.`, en: `Correct! The answer is ${answer}.` },
      answer,
      options: generateDistractors(answer, 3, 0, 20)
    };
  }

  private static genPreAddition10(): Question {
    const a = randInt(1, 5);
    const b = randInt(1, 9 - a);
    const sum = a + b;
    const emoji = '🍎';

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
      voicePrompt: { bm: `${a} tambah ${b} sama dengan berapa?`, en: `What is ${a} plus ${b}?` },
      hint: {
        bm: 'Kira semua epal dalam kedua-dua kumpulan tanpa berhenti.',
        en: 'Count every apple in both groups without stopping.'
      },
      explanation: { bm: `${a} + ${b} = ${sum} epal kesemuanya!`, en: `${a} + ${b} = ${sum} apples altogether!` },
      answer: sum,
      options: generateDistractors(sum, 3, 1, 10),
      visualData: {
        groupA: emojiRow(a, emoji, 'a'),
        groupB: emojiRow(b, emoji, 'b'),
        operation: '+'
      }
    };
  }

  private static genPreSubtraction10(): Question {
    const total = randInt(3, 8);
    const remove = randInt(1, total - 1);
    const remaining = total - remove;
    const emoji = '🥕';

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
      voicePrompt: { bm: `${total} tolak ${remove}. Berapakah bakinya?`, en: `What is ${total} minus ${remove}?` },
      hint: {
        bm: 'Kira hanya lobak yang tidak bertanda ✕.',
        en: 'Count only the carrots that are not crossed out.'
      },
      explanation: { bm: `${total} - ${remove} = ${remaining} lobak tinggal!`, en: `${total} - ${remove} = ${remaining} carrots left!` },
      answer: remaining,
      options: generateDistractors(remaining, 3, 0, 10),
      visualData: { items: emojiRow(total, emoji, 'c'), operation: '-' }
    };
  }

  private static genPreShapesSort(): Question {
    return this.genBegShapesColors();
  }

  private static genPreTimeMoney(): Question {
    if (Math.random() < 0.6) return this.genPreTimeMoneyExtra();

    const variant = pickOne(['highest', 'total', 'daypart'] as const);

    const meta = {
      curriculumVersion: 'KSPK_2017',
      level: 'preschool' as LevelId,
      learningArea: 'Sukatan dan Geometri',
      topicId: 'pre_time_money',
      topicName: { bm: 'Masa & Wang Syiling Asas', en: 'Time & Basic Coins' },
      difficulty: 'easy' as Difficulty
    };

    if (variant === 'daypart') {
      const events = [
        { bm: 'Bilakah kita bersarapan?', en: 'When do we eat breakfast?', ans: 'Pagi (Morning)' },
        { bm: 'Bilakah matahari terbenam?', en: 'When does the sun set?', ans: 'Petang (Evening)' },
        { bm: 'Bilakah kita tidur dan melihat bulan?', en: 'When do we sleep and see the moon?', ans: 'Malam (Night)' },
        { bm: 'Bilakah matahari paling terik di atas kepala?', en: 'When is the sun highest overhead?', ans: 'Tengah hari (Noon)' }
      ];
      const pick = pickOne(events);

      return {
        id: `pre_time_${Date.now()}`,
        metadata: meta,
        type: 'multiple_choice',
        prompt: { bm: pick.bm, en: pick.en },
        voicePrompt: { bm: pick.bm, en: pick.en },
        hint: { bm: 'Fikirkan kedudukan matahari pada waktu itu.', en: 'Think about where the sun is at that time.' },
        explanation: { bm: `Jawapannya ialah ${pick.ans}.`, en: `The answer is ${pick.ans}.` },
        answer: pick.ans,
        options: shuffle(['Pagi (Morning)', 'Tengah hari (Noon)', 'Petang (Evening)', 'Malam (Night)'])
      };
    }

    const coins = [5, 10, 20, 50];

    if (variant === 'highest') {
      const four = shuffle(coins);
      const askHighest = coin();
      const target = askHighest ? Math.max(...four) : Math.min(...four);

      return {
        id: `pre_coin_${Date.now()}`,
        metadata: meta,
        type: 'multiple_choice',
        prompt: {
          bm: `Syiling manakah yang bernilai ${askHighest ? 'PALING TINGGI' : 'PALING RENDAH'}?`,
          en: `Which coin is worth the ${askHighest ? 'MOST' : 'LEAST'}?`
        },
        voicePrompt: {
          bm: `Pilih syiling yang bernilai ${askHighest ? 'paling tinggi' : 'paling rendah'}!`,
          en: `Pick the coin worth the ${askHighest ? 'most' : 'least'}!`
        },
        hint: {
          bm: 'Semakin besar nombor sen, semakin tinggi nilainya.',
          en: 'The bigger the number of sen, the higher the value.'
        },
        explanation: {
          bm: `${target} sen ialah nilai ${askHighest ? 'paling tinggi' : 'paling rendah'} antara syiling itu.`,
          en: `${target} sen is the ${askHighest ? 'highest' : 'lowest'} value among those coins.`
        },
        answer: `${target} sen`,
        options: shuffle(four.map(c => `${c} sen`))
      };
    }

    // variant === 'total'
    const coinVal = pickOne(coins);
    const qty = randInt(2, 3);
    const total = coinVal * qty;

    return {
      id: `pre_coin_total_${Date.now()}`,
      metadata: meta,
      type: 'multiple_choice',
      prompt: {
        bm: `Berapakah jumlah nilai ${qty} keping syiling ${coinVal} sen?`,
        en: `What is the total value of ${qty} coins of ${coinVal} sen?`
      },
      voicePrompt: {
        bm: `${qty} keping syiling ${coinVal} sen. Berapakah jumlahnya?`,
        en: `${qty} coins of ${coinVal} sen. What is the total?`
      },
      hint: {
        bm: `Kira melompat: ${Array(qty).fill(`${coinVal}`).join(' + ')} sen.`,
        en: `Skip count: ${Array(qty).fill(`${coinVal}`).join(' + ')} sen.`
      },
      explanation: { bm: `${coinVal} sen × ${qty} = ${total} sen.`, en: `${coinVal} sen × ${qty} = ${total} sen.` },
      answer: `${total} sen`,
      options: buildOptions(
        `${total} sen`,
        [`${total + coinVal} sen`, `${total - coinVal} sen`, `${coinVal + qty} sen`, `${total + 5} sen`]
      )
    };
  }

  // =========================================================================
  // FOUNDATION GENERATORS
  // =========================================================================

  private static genFndNumbers100(difficulty: Difficulty): Question {
    const n = difficulty === 'easy' ? randInt(11, 49) : randInt(21, 99);
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    const swapped = ones * 10 + tens; // classic digit-reversal mistake

    const candidates = [swapped, n + 10, n - 10, n + 1, n - 1, n + 20, n - 20, n + 2, n - 2]
      .filter(v => v >= 10 && v <= 99 && v !== n);

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
        bm: `Nombor manakah ialah "${numberToWords(n, 'bm')}"?`,
        en: `Which numeral is "${numberToWords(n, 'en').toLowerCase()}"?`
      },
      voicePrompt: {
        bm: `Pilih nombor ${numberToWords(n, 'bm').toLowerCase()}.`,
        en: `Choose the numeral ${numberToWords(n, 'en').toLowerCase()}.`
      },
      hint: {
        bm: 'Digit pertama menunjukkan puluh, digit kedua menunjukkan sa.',
        en: 'The first digit shows the tens, the second digit shows the ones.'
      },
      explanation: {
        bm: `${numberToWords(n, 'bm')} ditulis sebagai ${n} (${tens} puluh dan ${ones} sa).`,
        en: `${numberToWords(n, 'en')} is written as ${n} (${tens} tens and ${ones} ones).`
      },
      answer: n,
      options: buildOptions(n, candidates)
    };
  }

  private static genFndPlaceValue(): Question {
    const tens = randInt(2, 9);
    const ones = randInt(1, 9);
    const num = tens * 10 + ones;
    const askTens = coin();
    const askValue = coin(); // digit itself vs the value it represents

    const digit = askTens ? tens : ones;
    const value = askTens ? tens * 10 : ones;
    const answer = askValue ? value : digit;

    const candidates = askValue
      ? [digit, askTens ? ones : tens * 10, value + 10, value - 10, num].filter(v => v > 0 && v !== answer)
      : [askTens ? ones : tens, digit + 1, digit - 1, digit + 2, digit - 2, ...shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])]
          .filter(v => v >= 0 && v <= 9 && v !== answer);

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
        bm: askValue
          ? `Dalam nombor ${num}, apakah NILAI digit di tempat ${askTens ? 'PULUH' : 'SA'}?`
          : `Dalam nombor ${num}, apakah DIGIT di tempat ${askTens ? 'PULUH' : 'SA'}?`,
        en: askValue
          ? `In the number ${num}, what is the VALUE of the digit in the ${askTens ? 'TENS' : 'ONES'} place?`
          : `In the number ${num}, what is the DIGIT in the ${askTens ? 'TENS' : 'ONES'} place?`
      },
      voicePrompt: {
        bm: `Nombor ${num}. Apakah ${askValue ? 'nilai' : 'digit'} ${askTens ? 'puluh' : 'sa'}?`,
        en: `Number ${num}. What is the ${askTens ? 'tens' : 'ones'} ${askValue ? 'value' : 'digit'}?`
      },
      hint: {
        bm: 'Digit paling kanan ialah sa. Digit di sebelah kirinya ialah puluh.',
        en: 'The right-most digit is the ones. The digit to its left is the tens.'
      },
      explanation: {
        bm: askValue
          ? `Digit ${digit} berada di tempat ${askTens ? 'puluh' : 'sa'}, jadi nilainya ialah ${value}.`
          : `Digit di tempat ${askTens ? 'puluh' : 'sa'} ialah ${digit}.`,
        en: askValue
          ? `The digit ${digit} sits in the ${askTens ? 'tens' : 'ones'} place, so its value is ${value}.`
          : `The digit in the ${askTens ? 'tens' : 'ones'} place is ${digit}.`
      },
      answer,
      options: buildOptions(answer, candidates)
    };
  }

  private static genFndAdditionNumline(): Question {
    const start = randInt(2, 11);
    const jump = randInt(1, 6);
    const end = start + jump;
    const lineMin = Math.max(0, start - 2);
    const lineMax = end + 3;

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
        bm: 'Letak jari pada nombor mula, kemudian lompat ke hadapan satu-satu sambil mengira.',
        en: 'Put your finger on the start number, then hop forward one step at a time.'
      },
      explanation: { bm: `${start} + ${jump} = ${end}! Katak mendarat di ${end}.`, en: `${start} + ${jump} = ${end}! The frog lands on ${end}.` },
      answer: end,
      // Options stay inside the drawn number line so every choice is a real landing point
      options: generateDistractors(end, 3, lineMin, lineMax),
      visualData: {
        numberLine: { min: lineMin, max: lineMax, step: 1, start, jump, expectedEnd: end }
      }
    };
  }

  private static genFndSubtractionNumline(): Question {
    const start = randInt(7, 14);
    const jump = randInt(1, 5);
    const end = start - jump;
    const lineMin = Math.max(0, end - 2);
    const lineMax = start + 2;

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
        bm: 'Letak jari pada nombor mula, kemudian undur ke belakang satu-satu sambil mengira.',
        en: 'Put your finger on the start number, then step backward one at a time.'
      },
      explanation: { bm: `${start} - ${jump} = ${end}!`, en: `${start} - ${jump} = ${end}!` },
      answer: end,
      options: generateDistractors(end, 3, lineMin, lineMax),
      visualData: {
        numberLine: { min: lineMin, max: lineMax, step: 1, start, jump: -jump, expectedEnd: end }
      }
    };
  }

  private static genFndGroupsShare(): Question {
    const groups = randInt(2, 4);
    const perGroup = randInt(2, 5);
    const total = groups * perGroup;
    const isGrouping = coin();
    const answer = isGrouping ? total : perGroup;

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
        bm: isGrouping
          ? `Ada ${groups} pinggan. Setiap pinggan ada ${perGroup} biji biskut 🍪. Berapakah jumlah biskut?`
          : `Ada ${total} biji biskut 🍪 dikongsi sama rata ke dalam ${groups} pinggan. Berapa biskut dalam setiap pinggan?`,
        en: isGrouping
          ? `There are ${groups} plates. Each plate has ${perGroup} cookies 🍪. How many cookies altogether?`
          : `${total} cookies 🍪 are shared equally onto ${groups} plates. How many cookies on each plate?`
      },
      voicePrompt: {
        bm: isGrouping
          ? `${groups} kumpulan, setiap satu ${perGroup} biskut. Berapa semuanya?`
          : `Kongsi ${total} biskut sama rata kepada ${groups} pinggan.`,
        en: isGrouping
          ? `${groups} groups of ${perGroup} cookies. How many in total?`
          : `Share ${total} cookies equally onto ${groups} plates.`
      },
      hint: {
        bm: isGrouping
          ? `Tambah berulang: ${Array(groups).fill(perGroup).join(' + ')} = ?`
          : 'Agihkan satu biskut ke setiap pinggan, berulang kali sehingga habis.',
        en: isGrouping
          ? `Repeated addition: ${Array(groups).fill(perGroup).join(' + ')} = ?`
          : 'Deal one cookie onto each plate, round and round, until none are left.'
      },
      explanation: {
        bm: isGrouping
          ? `${groups} kumpulan ${perGroup} ialah ${total}. (${groups} × ${perGroup} = ${total})`
          : `${total} ÷ ${groups} = ${perGroup} biskut setiap pinggan.`,
        en: isGrouping
          ? `${groups} groups of ${perGroup} is ${total}. (${groups} × ${perGroup} = ${total})`
          : `${total} ÷ ${groups} = ${perGroup} cookies per plate.`
      },
      answer,
      options: isGrouping
        ? buildOptions(total, [groups + perGroup, total + perGroup, total - perGroup, total + 1, total + 2, total - 1])
        : buildOptions(perGroup, [groups, total - groups, perGroup + 1, perGroup + 2, perGroup + 3, total].filter(v => v > 0))
    };
  }

  private static genFndFractionsBasic(): Question {
    const items = [
      { frac: '1/2', bm: 'Separuh (satu perdua)', en: 'Half (one over two)', hintBm: '1 daripada 2 bahagian sama besar.', hintEn: '1 out of 2 equal parts.' },
      { frac: '1/4', bm: 'Suku (satu perempat)', en: 'Quarter (one over four)', hintBm: '1 daripada 4 bahagian sama besar.', hintEn: '1 out of 4 equal parts.' },
      { frac: '3/4', bm: 'Tiga suku (tiga perempat)', en: 'Three quarters', hintBm: '3 daripada 4 bahagian sama besar.', hintEn: '3 out of 4 equal parts.' }
    ];
    const pick = pickOne(items);

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
        bm: `Apakah simbol pecahan bagi "${pick.bm}"?`,
        en: `What is the fraction symbol for "${pick.en}"?`
      },
      voicePrompt: { bm: `Pilih simbol pecahan bagi ${pick.bm}.`, en: `Choose the fraction for ${pick.en}.` },
      hint: { bm: pick.hintBm, en: pick.hintEn },
      explanation: { bm: `${pick.bm} ditulis sebagai ${pick.frac}.`, en: `${pick.en} is written as ${pick.frac}.` },
      answer: pick.frac,
      options: buildOptions(pick.frac, ['1/2', '1/4', '3/4', '1/3', '2/4'])
    };
  }

  private static genFndShopMoney(): Question {
    const items = [
      { nameBm: 'Buku Nota', nameEn: 'Notebook', emoji: '📓', price: 3 },
      { nameBm: 'Pensel Warna', nameEn: 'Colour Pencils', emoji: '✏️', price: 6 },
      { nameBm: 'Pemadam Comel', nameEn: 'Cute Eraser', emoji: '🧽', price: 1 },
      { nameBm: 'Pengasah Pensel', nameEn: 'Sharpener', emoji: '📐', price: 2 },
      { nameBm: 'Pembaris', nameEn: 'Ruler', emoji: '📏', price: 5 },
      { nameBm: 'Beg Sekolah', nameEn: 'School Bag', emoji: '🎒', price: 10 },
      { nameBm: 'Botol Air', nameEn: 'Water Bottle', emoji: '🧃', price: 7 }
    ];
    const pick = pickOne(items);

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
      // The widget asks the child to hand over notes, so the prompt asks for the amount, not a count of notes
      prompt: {
        bm: `${pick.nameBm} ${pick.emoji} berharga RM${pick.price}. Bayar harga yang tepat dengan wang kertas.`,
        en: `${pick.nameEn} ${pick.emoji} costs RM${pick.price}. Pay the exact amount with banknotes.`
      },
      voicePrompt: {
        bm: `${pick.nameBm} berharga ${pick.price} ringgit. Bayar dengan tepat.`,
        en: `${pick.nameEn} costs ${pick.price} ringgit. Pay the exact amount.`
      },
      hint: {
        bm: `Gabungkan wang kertas RM1, RM5 atau RM10 sehingga cukup RM${pick.price}.`,
        en: `Combine RM1, RM5 or RM10 notes until you reach RM${pick.price}.`
      },
      explanation: {
        bm: `Tepat sekali! Jumlah bayaran ialah RM${pick.price}.`,
        en: `Spot on! The total paid is RM${pick.price}.`
      },
      answer: pick.price,
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
    const a = randInt(10, 89);
    let b = randInt(10, 99);
    while (b === a) b = randInt(10, 99);
    const askLarger = coin();
    const answer = askLarger ? Math.max(a, b) : Math.min(a, b);

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
        bm: `Antara ${a} dan ${b}, nombor manakah yang ${askLarger ? 'LEBIH BESAR' : 'LEBIH KECIL'}?`,
        en: `Between ${a} and ${b}, which number is ${askLarger ? 'GREATER' : 'SMALLER'}?`
      },
      voicePrompt: {
        bm: `${a} atau ${b}. Yang mana ${askLarger ? 'lebih besar' : 'lebih kecil'}?`,
        en: `${a} or ${b}. Which one is ${askLarger ? 'greater' : 'smaller'}?`
      },
      hint: { bm: 'Bandingkan digit puluh dahulu. Jika sama, baru bandingkan digit sa.', en: 'Compare the tens digit first. If they match, compare the ones digit.' },
      explanation: {
        bm: `${answer} ialah nombor yang ${askLarger ? 'lebih besar' : 'lebih kecil'}.`,
        en: `${answer} is the ${askLarger ? 'greater' : 'smaller'} number.`
      },
      answer,
      options: shuffle([a, b])
    };
  }

  private static genY1AddSub(difficulty: Difficulty): Question {
    const isAdd = coin();
    const max = difficulty === 'hard' ? 99 : difficulty === 'medium' ? 50 : 20;

    const b = randInt(1, 9);
    let a = randInt(5, max - b);
    if (!isAdd && a < b) a = b + randInt(1, 5);

    const answer = isAdd ? a + b : a - b;

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
      prompt: { bm: `${a} ${isAdd ? '+' : '-'} ${b} = ?`, en: `${a} ${isAdd ? '+' : '-'} ${b} = ?` },
      voicePrompt: {
        bm: `${a} ${isAdd ? 'tambah' : 'tolak'} ${b} sama dengan berapa?`,
        en: `What is ${a} ${isAdd ? 'plus' : 'minus'} ${b}?`
      },
      hint: { bm: 'Kira digit sa dahulu, kemudian digit puluh.', en: 'Work out the ones digit first, then the tens.' },
      explanation: { bm: `${a} ${isAdd ? '+' : '-'} ${b} = ${answer}`, en: `${a} ${isAdd ? '+' : '-'} ${b} = ${answer}` },
      answer,
      options: generateDistractors(answer, 3, 0, 110)
    };
  }

  private static genY1Fractions(): Question {
    // Year 1 works with concrete sets and shaded shapes, not just fraction symbols
    const route = Math.random();
    if (route < 0.55) return this.genY1FractionsExtra();
    if (route < 0.75) return this.genFndFractionsBasic();

    const isHalf = coin();
    const parts = isHalf ? 2 : 4;
    const each = randInt(2, 5);
    const total = each * parts;

    return {
      id: `y1_frac_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_1',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y1_fractions',
        topicName: { bm: '3.0 Pecahan: Separuh & Suku', en: '3.0 Fractions: Half & Quarter' },
        standardContent: '3.1',
        standardLearning: '3.1.1',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Berapakah ${isHalf ? 'SEPARUH' : 'SUKU'} daripada ${total} biji guli?`,
        en: `What is ${isHalf ? 'HALF' : 'A QUARTER'} of ${total} marbles?`
      },
      voicePrompt: {
        bm: `${isHalf ? 'Separuh' : 'Suku'} daripada ${total} ialah berapa?`,
        en: `What is ${isHalf ? 'half' : 'a quarter'} of ${total}?`
      },
      hint: {
        bm: `Bahagikan ${total} kepada ${parts} kumpulan yang sama banyak.`,
        en: `Split ${total} into ${parts} equal groups.`
      },
      explanation: { bm: `${total} ÷ ${parts} = ${each}`, en: `${total} ÷ ${parts} = ${each}` },
      answer: each,
      options: buildOptions(each, [total, total - each, each + 1, each * 2, each - 1].filter(v => v > 0 && v !== each))
    };
  }

  private static genY1Money(): Question {
    const isChange = coin();

    if (isChange) {
      const paid = pickOne([5, 10]);
      const cost = randInt(1, paid - 1);
      const change = paid - cost;

      return {
        id: `y1_money_${Date.now()}`,
        metadata: {
          curriculumVersion: 'KSSR_SEMAKAN_2017',
          level: 'year_1',
          learningArea: 'Nombor dan Operasi',
          topicId: 'y1_money',
          topicName: { bm: '4.0 Wang Hingga RM10', en: '4.0 Money up to RM10' },
          standardContent: '4.1 - 4.2',
          standardLearning: '4.2.1',
          difficulty: 'easy'
        },
        type: 'multiple_choice',
        prompt: {
          bm: `Aminah ada RM${paid}. Dia membeli pemadam berharga RM${cost}. Berapakah baki wangnya?`,
          en: `Aminah has RM${paid}. She buys an eraser for RM${cost}. How much money does she have left?`
        },
        voicePrompt: { bm: `RM${paid} tolak RM${cost} sama dengan berapa?`, en: `What is RM${paid} minus RM${cost}?` },
        hint: { bm: 'Baki bermakna tolak harga barang daripada wang yang ada.', en: 'Change means subtracting the price from the money you had.' },
        explanation: { bm: `RM${paid} - RM${cost} = RM${change}`, en: `RM${paid} - RM${cost} = RM${change}` },
        answer: change,
        options: buildOptions(change, [paid + cost, cost, change + 1, change - 1].filter(v => v > 0 && v !== change))
      };
    }

    const item1 = randInt(1, 5);
    const item2 = randInt(1, 5);
    const total = item1 + item2;

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
        bm: `Ali membeli buku berharga RM${item1} dan pembaris berharga RM${item2}. Berapakah jumlah yang perlu dibayar?`,
        en: `Ali buys a book for RM${item1} and a ruler for RM${item2}. How much does he pay altogether?`
      },
      voicePrompt: { bm: `RM${item1} tambah RM${item2} sama dengan berapa?`, en: `What is RM${item1} plus RM${item2}?` },
      hint: { bm: 'Jumlah bermakna tambah kedua-dua harga.', en: 'Altogether means add both prices.' },
      explanation: { bm: `RM${item1} + RM${item2} = RM${total}`, en: `RM${item1} + RM${item2} = RM${total}` },
      answer: total,
      options: buildOptions(total, [Math.abs(item1 - item2), total + 1, total - 1, total + 2].filter(v => v > 0 && v !== total))
    };
  }

  private static genY1Time(): Question {
    const hours = randInt(1, 12);

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
      // The clock face itself shows the time, so the prompt must not name the hour
      prompt: { bm: 'Pukul berapakah jam ini menunjukkan?', en: 'What time is shown on this clock?' },
      voicePrompt: { bm: 'Pukul berapakah jam ini?', en: 'What time does this clock show?' },
      hint: {
        bm: 'Jarum pendek menunjukkan jam. Jarum panjang di angka 12 bermakna tepat.',
        en: 'The short hand shows the hour. The long hand on 12 means it is exactly o\'clock.'
      },
      explanation: { bm: `Jam menunjukkan tepat pukul ${hours}.`, en: `The clock shows exactly ${hours} o'clock.` },
      answer: hours,
      options: generateDistractors(hours, 3, 1, 12),
      visualData: { clockTime: { hour: hours, minute: 0 } }
    };
  }

  private static genY1Measurement(): Question {
    if (Math.random() < 0.6) return this.genY1MeasurementExtra();

    const tools = [
      { qBm: 'Alat manakah digunakan untuk mengukur PANJANG?', qEn: 'Which tool is used to measure LENGTH?', ans: 'Pembaris (Ruler)' },
      { qBm: 'Alat manakah digunakan untuk menimbang JISIM?', qEn: 'Which tool is used to measure MASS?', ans: 'Penimbang (Weighing scale)' },
      { qBm: 'Alat manakah digunakan untuk menyukat ISI PADU CECAIR?', qEn: 'Which tool is used to measure LIQUID VOLUME?', ans: 'Bikar penyukat (Measuring cylinder)' },
      { qBm: 'Alat manakah digunakan untuk mengukur MASA?', qEn: 'Which tool is used to measure TIME?', ans: 'Jam (Clock)' }
    ];
    const units = [
      { qBm: 'Unit manakah sesuai untuk mengukur panjang pembaris?', qEn: 'Which unit suits the length of a ruler?', ans: 'Sentimeter (cm)' },
      { qBm: 'Unit manakah sesuai untuk menimbang sebuah beg sekolah?', qEn: 'Which unit suits the mass of a school bag?', ans: 'Kilogram (kg)' },
      { qBm: 'Unit manakah sesuai untuk menyukat air dalam botol besar?', qEn: 'Which unit suits water in a big bottle?', ans: 'Liter (l)' },
      { qBm: 'Unit manakah sesuai untuk mengukur panjang padang sekolah?', qEn: 'Which unit suits the length of a school field?', ans: 'Meter (m)' }
    ];

    const useTools = coin();
    const pick = useTools ? pickOne(tools) : pickOne(units);
    const pool = useTools
      ? ['Pembaris (Ruler)', 'Penimbang (Weighing scale)', 'Bikar penyukat (Measuring cylinder)', 'Jam (Clock)']
      : ['Sentimeter (cm)', 'Kilogram (kg)', 'Liter (l)', 'Meter (m)'];

    return {
      id: `y1_measure_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_1',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y1_measurement',
        topicName: { bm: '6.0 Ukuran: Panjang, Jisim & Isi Padu', en: '6.0 Measurement: Length, Mass & Volume' },
        standardContent: '6.1 - 6.3',
        standardLearning: '6.1.1',
        difficulty: 'easy'
      },
      type: 'multiple_choice',
      prompt: { bm: pick.qBm, en: pick.qEn },
      voicePrompt: { bm: pick.qBm, en: pick.qEn },
      hint: {
        bm: 'Panjang guna meter/sentimeter, jisim guna kilogram, isi padu cecair guna liter.',
        en: 'Length uses metres/centimetres, mass uses kilograms, liquid volume uses litres.'
      },
      explanation: { bm: `Jawapan yang betul ialah ${pick.ans}.`, en: `The correct answer is ${pick.ans}.` },
      answer: pick.ans,
      options: shuffle(pool)
    };
  }

  private static genY1Shapes(): Question {
    if (Math.random() < 0.6) return this.genY1ShapesExtra();

    const shapes3D = [
      { label: 'Kubus (Cube)', emoji: '🧊', hintBm: 'Semua 6 permukaannya ialah segi empat sama.', hintEn: 'All 6 faces are squares.' },
      { label: 'Silinder (Cylinder)', emoji: '🥫', hintBm: 'Ada dua permukaan bulat dan boleh menggolek.', hintEn: 'It has two circular faces and can roll.' },
      { label: 'Kon (Cone)', emoji: '🍦', hintBm: 'Tapaknya bulat dan bucunya tirus.', hintEn: 'It has a round base and a pointed tip.' },
      { label: 'Piramid (Pyramid)', emoji: '⛺', hintBm: 'Sisinya segi tiga yang bertemu di satu bucu.', hintEn: 'Its triangular faces meet at one point.' },
      { label: 'Sfera (Sphere)', emoji: '⚽', hintBm: 'Bulat sepenuhnya, tiada bucu atau tepi.', hintEn: 'Perfectly round with no corners or edges.' }
    ];
    const shapes2D = [
      { label: 'Segi Tiga (Triangle)', emoji: '🔺', hintBm: 'Ada 3 sisi dan 3 bucu.', hintEn: 'It has 3 sides and 3 corners.' },
      { label: 'Segi Empat Sama (Square)', emoji: '🟦', hintBm: 'Ada 4 sisi yang sama panjang.', hintEn: 'It has 4 equal sides.' },
      { label: 'Bulatan (Circle)', emoji: '🔴', hintBm: 'Tiada sisi lurus langsung.', hintEn: 'It has no straight sides at all.' },
      { label: 'Bintang (Star)', emoji: '⭐', hintBm: 'Ada lima bucu tajam.', hintEn: 'It has five pointy tips.' }
    ];

    const is3D = coin();
    const pool = is3D ? shapes3D : shapes2D;
    const pick = pickOne(pool);

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
        bm: `Apakah nama bentuk ${is3D ? '3D' : '2D'} ini: ${pick.emoji}?`,
        en: `What is the name of this ${is3D ? '3D' : '2D'} shape: ${pick.emoji}?`
      },
      voicePrompt: { bm: 'Apakah nama bentuk ini?', en: 'What is the name of this shape?' },
      hint: { bm: pick.hintBm, en: pick.hintEn },
      explanation: { bm: `Bentuk ini ialah ${pick.label}.`, en: `This shape is a ${pick.label}.` },
      answer: pick.label,
      options: buildOptions(pick.label, pool.filter(s => s.label !== pick.label).map(s => s.label))
    };
  }

  // =========================================================================
  // YEAR 2 GENERATORS (KSSR Semakan 2017)
  // =========================================================================

  private static genY2Numbers1000(difficulty: Difficulty): Question {
    const n = randInt(120, 969);
    const hundreds = Math.floor(n / 100);
    const tens = Math.floor((n % 100) / 10);
    const ones = n % 10;

    const places = [
      { bm: 'ratus', en: 'hundreds', digit: hundreds, value: hundreds * 100 },
      { bm: 'puluh', en: 'tens', digit: tens, value: tens * 10 },
      { bm: 'sa', en: 'ones', digit: ones, value: ones }
    ];
    const target = pickOne(places);
    const variant = pickOne(['digit', 'value', 'words'] as const);

    const meta = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_2' as LevelId,
      learningArea: 'Nombor dan Operasi',
      topicId: 'y2_numbers_1000',
      topicName: { bm: '1.0 Nombor Bulat Hingga 1000', en: '1.0 Whole Numbers to 1000' },
      standardContent: '1.1 - 1.7',
      standardLearning: '1.2.1',
      difficulty
    };

    if (variant === 'words') {
      const candidates = [n + 100, n - 100, n + 10, n - 10, n + 1, n - 1, ones * 100 + tens * 10 + hundreds]
        .filter(v => v >= 100 && v <= 999 && v !== n);
      return {
        id: `y2_num_${Date.now()}`,
        metadata: meta,
        type: 'multiple_choice',
        prompt: {
          bm: `Nombor manakah ialah "${numberToWords(n, 'bm')}"?`,
          en: `Which numeral is "${numberToWords(n, 'en').toLowerCase()}"?`
        },
        voicePrompt: { bm: `Pilih nombor ${numberToWords(n, 'bm').toLowerCase()}.`, en: `Choose the numeral ${numberToWords(n, 'en').toLowerCase()}.` },
        hint: { bm: 'Dengar bahagian ratus dahulu, kemudian puluh, kemudian sa.', en: 'Listen for the hundreds first, then the tens, then the ones.' },
        explanation: { bm: `${numberToWords(n, 'bm')} ialah ${n}.`, en: `${numberToWords(n, 'en')} is ${n}.` },
        answer: n,
        options: buildOptions(n, candidates)
      };
    }

    const answer = variant === 'value' ? target.value : target.digit;
    const candidates = variant === 'value'
      ? [target.digit, hundreds * 100, tens * 10, ones, target.value + 100, target.value + 10, target.value * 10, n]
          .filter(v => v !== answer && v > 0)
      : [hundreds, tens, ones, target.digit + 1, target.digit - 1, ...shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])]
          .filter(v => v >= 0 && v <= 9 && v !== answer);

    return {
      id: `y2_num_${Date.now()}`,
      metadata: meta,
      type: 'multiple_choice',
      prompt: {
        bm: variant === 'value'
          ? `Dalam nombor ${n}, apakah NILAI digit di tempat ${target.bm.toUpperCase()}?`
          : `Dalam nombor ${n}, apakah DIGIT di tempat ${target.bm.toUpperCase()}?`,
        en: variant === 'value'
          ? `In the number ${n}, what is the VALUE of the digit in the ${target.en.toUpperCase()} place?`
          : `In the number ${n}, what is the DIGIT in the ${target.en.toUpperCase()} place?`
      },
      voicePrompt: {
        bm: `Nombor ${n}. Apakah ${variant === 'value' ? 'nilai' : 'digit'} di tempat ${target.bm}?`,
        en: `Number ${n}. What is the ${target.en} ${variant === 'value' ? 'value' : 'digit'}?`
      },
      hint: {
        bm: 'Kira tempat dari kanan: sa, puluh, ratus.',
        en: 'Count the places from the right: ones, tens, hundreds.'
      },
      explanation: {
        bm: variant === 'value'
          ? `Digit ${target.digit} berada di tempat ${target.bm}, jadi nilainya ${target.value}.`
          : `Digit pada tempat ${target.bm} ialah ${target.digit}.`,
        en: variant === 'value'
          ? `The digit ${target.digit} is in the ${target.en} place, so its value is ${target.value}.`
          : `The digit in the ${target.en} place is ${target.digit}.`
      },
      answer,
      options: buildOptions(answer, candidates)
    };
  }

  private static genY2AddSub(difficulty: Difficulty): Question {
    const isAdd = coin();
    const a = randInt(150, 649);
    const b = randInt(50, 349);
    const bigger = Math.max(a, b);
    const smaller = Math.min(a, b);
    const answer = isAdd ? a + b : bigger - smaller;
    const shownLeft = isAdd ? a : bigger;
    const shownRight = isAdd ? b : smaller;

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
      prompt: {
        bm: `${shownLeft} ${isAdd ? '+' : '-'} ${shownRight} = ?`,
        en: `${shownLeft} ${isAdd ? '+' : '-'} ${shownRight} = ?`
      },
      voicePrompt: {
        bm: `${shownLeft} ${isAdd ? 'tambah' : 'tolak'} ${shownRight} sama dengan berapa?`,
        en: `What is ${shownLeft} ${isAdd ? 'plus' : 'minus'} ${shownRight}?`
      },
      hint: {
        bm: 'Susun mengikut nilai tempat. Kira sa, puluh, kemudian ratus, dengan mengumpul semula jika perlu.',
        en: 'Line the numbers up by place value. Work ones, tens, then hundreds, regrouping when needed.'
      },
      explanation: {
        bm: `${shownLeft} ${isAdd ? '+' : '-'} ${shownRight} = ${answer}`,
        en: `${shownLeft} ${isAdd ? '+' : '-'} ${shownRight} = ${answer}`
      },
      answer,
      options: generateDistractors(answer, 3, 0, 1000)
    };
  }

  private static genY2Operations(difficulty: Difficulty): Question {
    // Sifir 2, 3, 4, 5, 10
    const tables = [2, 3, 4, 5, 10];
    const table = pickOne(tables);
    const factor = randInt(1, 9);
    const product = table * factor;
    const isMultiplication = Math.random() > 0.4;

    const meta = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_2' as LevelId,
      learningArea: 'Nombor dan Operasi',
      topicId: 'y2_operations',
      topicName: { bm: '2.3 & 2.4 Darab & Bahagi (Sifir 2, 3, 4, 5, 10)', en: '2.3 & 2.4 Times Tables & Division' },
      standardContent: '2.3 - 2.4',
      standardLearning: isMultiplication ? '2.3.1' : '2.4.1',
      difficulty
    };

    if (isMultiplication) {
      return {
        id: `y2_mul_${Date.now()}`,
        metadata: meta,
        type: 'numeric_keypad',
        prompt: { bm: `${factor} × ${table} = ?`, en: `${factor} × ${table} = ?` },
        voicePrompt: { bm: `${factor} darab ${table} sama dengan berapa?`, en: `What is ${factor} times ${table}?` },
        hint: { bm: `Kira melompat dalam sifir ${table} sebanyak ${factor} kali.`, en: `Skip count in ${table}s, ${factor} times.` },
        explanation: { bm: `${factor} × ${table} = ${product}`, en: `${factor} × ${table} = ${product}` },
        answer: product,
        options: generateDistractors(product, 3, 1, 100)
      };
    }

    return {
      id: `y2_div_${Date.now()}`,
      metadata: meta,
      type: 'numeric_keypad',
      prompt: { bm: `${product} ÷ ${table} = ?`, en: `${product} ÷ ${table} = ?` },
      voicePrompt: { bm: `${product} bahagi ${table} sama dengan berapa?`, en: `What is ${product} divided by ${table}?` },
      hint: {
        bm: `Apakah nombor yang apabila didarab dengan ${table} menghasilkan ${product}?`,
        en: `What number multiplied by ${table} gives ${product}?`
      },
      explanation: { bm: `${product} ÷ ${table} = ${factor}`, en: `${product} ÷ ${table} = ${factor}` },
      answer: factor,
      options: generateDistractors(factor, 3, 1, 12)
    };
  }

  private static genY2FractionsDecimals(): Question {
    if (Math.random() < 0.6) return this.genY2FractionsDecimalsExtra();

    const tenths = randInt(1, 9);
    const fractionStr = `${tenths}/10`;
    const decimalStr = `0.${tenths}`;
    const isFracToDec = coin();
    const answer = isFracToDec ? decimalStr : fractionStr;

    const candidates = isFracToDec
      ? [`0.0${tenths}`, `${tenths}.0`, `0.${tenths}${tenths}`, `1.${tenths}`]
      : [`${tenths}/100`, `${tenths + 1}/10`, `10/${tenths}`, `${tenths}/1`];

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
      voicePrompt: {
        bm: isFracToDec ? `${tenths} per sepuluh dalam bentuk perpuluhan.` : `Sifar perpuluhan ${tenths} dalam bentuk pecahan.`,
        en: isFracToDec ? `${tenths} tenths as a decimal.` : `Zero point ${tenths} as a fraction.`
      },
      hint: { bm: 'Tempat perpuluhan pertama ialah persepuluh: 1/10 = 0.1.', en: 'The first decimal place is tenths: 1/10 = 0.1.' },
      explanation: { bm: `${fractionStr} bersamaan dengan ${decimalStr}.`, en: `${fractionStr} is equal to ${decimalStr}.` },
      answer,
      options: buildOptions(answer, candidates)
    };
  }

  private static genY2Money100(): Question {
    const paid = pickOne([20, 50, 100]);
    const cost = randInt(Math.round(paid * 0.25), paid - 1);
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
      voicePrompt: { bm: `RM${paid} tolak RM${cost} sama dengan berapa?`, en: `What is RM${paid} minus RM${cost}?` },
      hint: { bm: 'Baki = wang yang dibayar - harga barang.', en: 'Change = money given - price of the item.' },
      explanation: { bm: `RM${paid} - RM${cost} = RM${balance}`, en: `RM${paid} - RM${cost} = RM${balance}` },
      answer: balance,
      options: generateDistractors(balance, 3, 0, 100)
    };
  }

  private static genY2TimeMeasurement(): Question {
    if (Math.random() < 0.6) return this.genY2TimeMeasurementExtra();

    const isTime = coin();

    const meta = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_2' as LevelId,
      learningArea: 'Sukatan dan Geometri',
      topicId: 'y2_time_measurement',
      topicName: { bm: '5.0 Masa & 6.0 Ukuran (m, cm, kg, g, l, ml)', en: '5.0 Time & 6.0 Measurement' },
      standardContent: '5.1, 6.1',
      standardLearning: isTime ? '5.1.2' : '6.1.1',
      difficulty: 'easy' as Difficulty
    };

    if (isTime) {
      const clockNum = randInt(1, 11);
      const minutes = clockNum * 5;

      return {
        id: `y2_tm_${Date.now()}`,
        metadata: meta,
        type: 'multiple_choice',
        prompt: {
          bm: `Apabila jarum panjang jam menunjuk ke angka ${clockNum}, berapa minitkah yang ditunjukkan?`,
          en: `When the long hand points to the number ${clockNum}, how many minutes does it show?`
        },
        voicePrompt: { bm: `Jarum panjang di angka ${clockNum}. Berapa minit?`, en: `Long hand on ${clockNum}. How many minutes?` },
        hint: { bm: 'Setiap angka pada muka jam bernilai 5 minit.', en: 'Each number on the clock face is worth 5 minutes.' },
        explanation: { bm: `${clockNum} × 5 = ${minutes} minit.`, en: `${clockNum} × 5 = ${minutes} minutes.` },
        answer: minutes,
        options: buildOptions(minutes, [clockNum, minutes + 5, minutes - 5, minutes + 10].filter(v => v > 0 && v !== minutes))
      };
    }

    const conversions = [
      { qBm: 'Berapakah sentimeter dalam 1 meter?', qEn: 'How many centimetres are in 1 metre?', ans: 100, others: [10, 1000, 60] },
      { qBm: 'Berapakah gram dalam 1 kilogram?', qEn: 'How many grams are in 1 kilogram?', ans: 1000, others: [100, 10, 500] },
      { qBm: 'Berapakah mililiter dalam 1 liter?', qEn: 'How many millilitres are in 1 litre?', ans: 1000, others: [100, 10, 250] },
      { qBm: 'Berapakah minit dalam 1 jam?', qEn: 'How many minutes are in 1 hour?', ans: 60, others: [30, 100, 24] },
      { qBm: 'Berapakah saat dalam 1 minit?', qEn: 'How many seconds are in 1 minute?', ans: 60, others: [30, 100, 24] }
    ];
    const pick = pickOne(conversions);

    return {
      id: `y2_measure_${Date.now()}`,
      metadata: meta,
      type: 'multiple_choice',
      prompt: { bm: pick.qBm, en: pick.qEn },
      voicePrompt: { bm: pick.qBm, en: pick.qEn },
      hint: {
        bm: 'Awalan "kilo" bermaksud seribu, dan "senti" bermaksud seperseratus.',
        en: 'The prefix "kilo" means a thousand, and "centi" means one hundredth.'
      },
      explanation: { bm: `Jawapannya ialah ${pick.ans}.`, en: `The answer is ${pick.ans}.` },
      answer: pick.ans,
      options: buildOptions(pick.ans, pick.others)
    };
  }

  // =========================================================================
  // YEAR 3 GENERATORS (KSSR Semakan 2017)
  // =========================================================================

  private static genY3Numbers10000(difficulty: Difficulty): Question {
    const n = randInt(1000, 9899);
    const toHundred = Math.round(n / 100) * 100;
    const toThousand = Math.round(n / 1000) * 1000;
    const toNearestHundred = coin();

    const answer = toNearestHundred ? toHundred : toThousand;
    const unit = toNearestHundred ? 100 : 1000;
    const checkDigit = toNearestHundred ? Math.floor((n % 100) / 10) : Math.floor((n % 1000) / 100);

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
        bm: `Bundarkan ${n} kepada ${toNearestHundred ? 'ratus' : 'ribu'} yang terdekat:`,
        en: `Round ${n} to the nearest ${toNearestHundred ? 'hundred' : 'thousand'}:`
      },
      voicePrompt: {
        bm: `Bundarkan ${n} kepada ${toNearestHundred ? 'ratus' : 'ribu'} terdekat.`,
        en: `Round ${n} to the nearest ${toNearestHundred ? 'hundred' : 'thousand'}.`
      },
      hint: {
        bm: `Lihat digit ${toNearestHundred ? 'puluh' : 'ratus'}. Jika 5 atau lebih, bundarkan ke atas.`,
        en: `Look at the ${toNearestHundred ? 'tens' : 'hundreds'} digit. If it is 5 or more, round up.`
      },
      explanation: {
        bm: `Digit ${toNearestHundred ? 'puluh' : 'ratus'} ialah ${checkDigit}, jadi ${n} dibundarkan menjadi ${answer}.`,
        en: `The ${toNearestHundred ? 'tens' : 'hundreds'} digit is ${checkDigit}, so ${n} rounds to ${answer}.`
      },
      answer,
      // Distractors must also be exact multiples, otherwise they are trivially eliminated
      options: generateDistractors(answer, 3, 0, 10000, unit)
    };
  }

  private static genY3Operations(difficulty: Difficulty): Question {
    const mode = pickOne(['times', 'divide', 'long'] as const);

    const meta = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_3' as LevelId,
      learningArea: 'Nombor dan Operasi',
      topicId: 'y3_operations',
      topicName: { bm: '2.0 Operasi Asas (Tambah, Tolak, Darab, Bahagi)', en: '2.0 Basic Operations' },
      standardContent: '2.1 - 2.5',
      standardLearning: mode === 'divide' ? '2.4.1' : '2.3.1',
      difficulty
    };

    if (mode === 'long') {
      const a = randInt(12, 49);
      const b = randInt(3, 9);
      const product = a * b;
      return {
        id: `y3_ops_${Date.now()}`,
        metadata: meta,
        type: 'numeric_keypad',
        prompt: { bm: `${a} × ${b} = ?`, en: `${a} × ${b} = ?` },
        voicePrompt: { bm: `${a} darab ${b} sama dengan berapa?`, en: `What is ${a} times ${b}?` },
        hint: {
          bm: `Cerakinkan: (${Math.floor(a / 10) * 10} × ${b}) + (${a % 10} × ${b}).`,
          en: `Split it up: (${Math.floor(a / 10) * 10} × ${b}) + (${a % 10} × ${b}).`
        },
        explanation: { bm: `${a} × ${b} = ${product}`, en: `${a} × ${b} = ${product}` },
        answer: product,
        options: generateDistractors(product, 3, 10, 500)
      };
    }

    const table = pickOne([6, 7, 8, 9]);
    const factor = randInt(2, 10);
    const product = table * factor;

    if (mode === 'divide') {
      return {
        id: `y3_ops_${Date.now()}`,
        metadata: meta,
        type: 'numeric_keypad',
        prompt: { bm: `${product} ÷ ${table} = ?`, en: `${product} ÷ ${table} = ?` },
        voicePrompt: { bm: `${product} bahagi ${table} sama dengan berapa?`, en: `What is ${product} divided by ${table}?` },
        hint: { bm: `Berapa kali ${table} masuk ke dalam ${product}?`, en: `How many times does ${table} fit into ${product}?` },
        explanation: { bm: `${product} ÷ ${table} = ${factor}`, en: `${product} ÷ ${table} = ${factor}` },
        answer: factor,
        options: generateDistractors(factor, 3, 1, 12)
      };
    }

    return {
      id: `y3_ops_${Date.now()}`,
      metadata: meta,
      type: 'numeric_keypad',
      prompt: { bm: `${factor} × ${table} = ?`, en: `${factor} × ${table} = ?` },
      voicePrompt: { bm: `${factor} darab ${table} sama dengan berapa?`, en: `What is ${factor} times ${table}?` },
      hint: { bm: `Gunakan sifir ${table}.`, en: `Recall the ${table} times table.` },
      explanation: { bm: `${factor} × ${table} = ${product}`, en: `${factor} × ${table} = ${product}` },
      answer: product,
      options: generateDistractors(product, 3, 10, 120)
    };
  }

  private static genY3FractionsPercent(): Question {
    if (Math.random() < 0.6) return this.genY3FractionsPercentExtra();

    const map = [
      { pct: 10, frac: '1/10' },
      { pct: 20, frac: '1/5' },
      { pct: 25, frac: '1/4' },
      { pct: 50, frac: '1/2' },
      { pct: 75, frac: '3/4' }
    ];
    const pick = pickOne(map);
    const pctToFrac = coin();
    const allFracs = map.map(m => m.frac);
    const allPcts = map.map(m => `${m.pct}%`);

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
        bm: pctToFrac
          ? `Nyatakan ${pick.pct}% dalam bentuk pecahan termudah:`
          : `Nyatakan pecahan ${pick.frac} dalam bentuk peratus:`,
        en: pctToFrac
          ? `Express ${pick.pct}% as a fraction in its simplest form:`
          : `Express the fraction ${pick.frac} as a percentage:`
      },
      voicePrompt: {
        bm: pctToFrac ? `${pick.pct} peratus sebagai pecahan.` : `Pecahan ${pick.frac} sebagai peratus.`,
        en: pctToFrac ? `${pick.pct} percent as a fraction.` : `The fraction ${pick.frac} as a percentage.`
      },
      hint: {
        bm: 'Peratus bermaksud "per seratus". Tulis di atas 100, kemudian permudahkan.',
        en: 'Percent means "out of a hundred". Write it over 100, then simplify.'
      },
      explanation: { bm: `${pick.pct}% = ${pick.pct}/100 = ${pick.frac}.`, en: `${pick.pct}% = ${pick.pct}/100 = ${pick.frac}.` },
      answer: pctToFrac ? pick.frac : `${pick.pct}%`,
      options: pctToFrac
        ? buildOptions(pick.frac, allFracs.filter(f => f !== pick.frac))
        : buildOptions(`${pick.pct}%`, allPcts.filter(p => p !== `${pick.pct}%`))
    };
  }

  private static genY3Money10000(): Question {
    const isSaving = coin();

    const meta = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_3' as LevelId,
      learningArea: 'Nombor dan Operasi',
      topicId: 'y3_money_10000',
      topicName: { bm: '4.0 Wang Hingga RM10 000', en: '4.0 Money up to RM10,000' },
      standardContent: '4.1 - 4.8',
      standardLearning: '4.3.1',
      difficulty: 'medium' as Difficulty
    };

    if (isSaving) {
      const savings = randInt(10, 60) * 10;
      const months = randInt(2, 5);
      const total = savings * months;

      return {
        id: `y3_money_${Date.now()}`,
        metadata: meta,
        type: 'numeric_keypad',
        prompt: {
          bm: `Amin menyimpan RM${savings} setiap bulan. Berapakah jumlah simpanannya selepas ${months} bulan?`,
          en: `Amin saves RM${savings} every month. How much has he saved after ${months} months?`
        },
        voicePrompt: { bm: `RM${savings} darab ${months} bulan.`, en: `RM${savings} times ${months} months.` },
        hint: { bm: `Darabkan simpanan sebulan dengan bilangan bulan: RM${savings} × ${months}.`, en: `Multiply the monthly saving by the number of months: RM${savings} × ${months}.` },
        explanation: { bm: `RM${savings} × ${months} = RM${total}`, en: `RM${savings} × ${months} = RM${total}` },
        answer: total,
        options: generateDistractors(total, 3, 0, 10000, savings)
      };
    }

    const budget = randInt(30, 90) * 10;
    const spent = randInt(10, Math.floor(budget / 10) - 1) * 10;
    const left = budget - spent;

    return {
      id: `y3_money_${Date.now()}`,
      metadata: meta,
      type: 'numeric_keypad',
      prompt: {
        bm: `Puan Leha ada RM${budget}. Dia membelanjakan RM${spent} untuk barangan dapur. Berapakah baki wangnya?`,
        en: `Mrs Leha has RM${budget}. She spends RM${spent} on groceries. How much money is left?`
      },
      voicePrompt: { bm: `RM${budget} tolak RM${spent}.`, en: `RM${budget} minus RM${spent}.` },
      hint: { bm: 'Baki = jumlah wang - jumlah perbelanjaan.', en: 'Money left = total money - amount spent.' },
      explanation: { bm: `RM${budget} - RM${spent} = RM${left}`, en: `RM${budget} - RM${spent} = RM${left}` },
      answer: left,
      options: generateDistractors(left, 3, 0, 10000, 10)
    };
  }

  private static genY3TimeCalendar(): Question {
    if (Math.random() < 0.6) return this.genY3TimeCalendarExtra();

    const months = [
      { bm: 'Januari', en: 'January', days: 31 },
      { bm: 'Februari (tahun biasa)', en: 'February (common year)', days: 28 },
      { bm: 'Mac', en: 'March', days: 31 },
      { bm: 'April', en: 'April', days: 30 },
      { bm: 'Jun', en: 'June', days: 30 },
      { bm: 'Julai', en: 'July', days: 31 },
      { bm: 'September', en: 'September', days: 30 },
      { bm: 'November', en: 'November', days: 30 },
      { bm: 'Disember', en: 'December', days: 31 }
    ];
    const facts = [
      { qBm: 'Berapakah bilangan hari dalam seminggu?', qEn: 'How many days are there in a week?', ans: 7, others: [5, 12, 30] },
      { qBm: 'Berapakah bilangan bulan dalam setahun?', qEn: 'How many months are there in a year?', ans: 12, others: [7, 10, 24] },
      { qBm: 'Berapakah bilangan hari dalam tahun lompat?', qEn: 'How many days are there in a leap year?', ans: 366, others: [365, 360, 367] },
      { qBm: 'Berapakah bilangan minggu dalam setahun (anggaran)?', qEn: 'About how many weeks are there in a year?', ans: 52, others: [12, 24, 60] }
    ];

    const meta = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_3' as LevelId,
      learningArea: 'Sukatan dan Geometri',
      topicId: 'y3_time_calendar',
      topicName: { bm: '5.0 Masa, Waktu & Kalendar', en: '5.0 Time & Calendar' },
      standardContent: '5.1 - 5.8',
      standardLearning: '5.4.1',
      difficulty: 'easy' as Difficulty
    };

    if (coin()) {
      const pick = pickOne(months);
      return {
        id: `y3_cal_${Date.now()}`,
        metadata: meta,
        type: 'multiple_choice',
        prompt: { bm: `Berapakah bilangan hari dalam bulan ${pick.bm}?`, en: `How many days are there in ${pick.en}?` },
        voicePrompt: { bm: `Berapa hari dalam bulan ${pick.bm}?`, en: `How many days in ${pick.en}?` },
        hint: {
          bm: '30 hari bagi September, April, Jun dan November. Yang lain 31 hari, kecuali Februari.',
          en: '30 days have September, April, June and November. The rest have 31, except February.'
        },
        explanation: { bm: `Bulan ${pick.bm} mempunyai ${pick.days} hari.`, en: `${pick.en} has ${pick.days} days.` },
        answer: pick.days,
        options: shuffle([28, 29, 30, 31])
      };
    }

    const pick = pickOne(facts);
    return {
      id: `y3_cal_${Date.now()}`,
      metadata: meta,
      type: 'multiple_choice',
      prompt: { bm: pick.qBm, en: pick.qEn },
      voicePrompt: { bm: pick.qBm, en: pick.qEn },
      hint: { bm: 'Ingat kembali kalendar di dinding kelas anda.', en: 'Picture the calendar on your classroom wall.' },
      explanation: { bm: `Jawapannya ialah ${pick.ans}.`, en: `The answer is ${pick.ans}.` },
      answer: pick.ans,
      options: buildOptions(pick.ans, pick.others)
    };
  }

  private static genY3GeometryData(): Question {
    const items = [
      {
        qBm: 'Apakah jenis garis yang tidak akan pernah bersilang walaupun dipanjangkan?',
        qEn: 'What type of lines never intersect no matter how far they extend?',
        ans: 'Garis Selari (Parallel Lines)',
        others: ['Garis Serenjang (Perpendicular Lines)', 'Garis Melengkung (Curved Lines)', 'Garis Menegak (Vertical Lines)'],
        hintBm: 'Contohnya seperti rel landasan kereta api.',
        hintEn: 'Think of railway tracks running side by side.',
        expBm: 'Garis selari sentiasa mempunyai jarak yang sama dan tidak bersilang.',
        expEn: 'Parallel lines stay the same distance apart and never meet.'
      },
      {
        qBm: 'Apakah nama dua garis yang bertemu membentuk sudut tepat 90°?',
        qEn: 'What do we call two lines that meet at a right angle of 90°?',
        ans: 'Garis Serenjang (Perpendicular Lines)',
        others: ['Garis Selari (Parallel Lines)', 'Garis Melengkung (Curved Lines)', 'Garis Condong (Slanted Lines)'],
        hintBm: 'Bentuknya seperti huruf L atau penjuru buku.',
        hintEn: 'It looks like the letter L or the corner of a book.',
        expBm: 'Garis serenjang bertemu pada sudut tepat 90°.',
        expEn: 'Perpendicular lines meet at a right angle of 90°.'
      },
      {
        qBm: 'Berapakah bilangan sisi bagi sebuah pentagon?',
        qEn: 'How many sides does a pentagon have?',
        ans: 5,
        others: [3, 4, 6],
        hintBm: '"Penta" bermaksud lima.',
        hintEn: '"Penta" means five.',
        expBm: 'Pentagon mempunyai 5 sisi dan 5 bucu.',
        expEn: 'A pentagon has 5 sides and 5 corners.'
      },
      {
        qBm: 'Berapakah bilangan sisi bagi sebuah heksagon?',
        qEn: 'How many sides does a hexagon have?',
        ans: 6,
        others: [4, 5, 8],
        hintBm: '"Heksa" bermaksud enam, seperti sarang lebah.',
        hintEn: '"Hexa" means six, like a honeycomb cell.',
        expBm: 'Heksagon mempunyai 6 sisi.',
        expEn: 'A hexagon has 6 sides.'
      }
    ];

    // Four distinct star counts, shuffled so the winner is never the same child
    const chartCount = shuffle([randInt(1, 3), randInt(4, 6), randInt(7, 9), randInt(10, 14)]);
    const names = ['Ali', 'Siti', 'Ana', 'Devan'];
    const askMost = coin();
    const targetValue = askMost ? Math.max(...chartCount) : Math.min(...chartCount);
    const targetIdx = chartCount.indexOf(targetValue);
    const tally = names.map((nm, i) => `${nm} ${chartCount[i]}`).join(', ');
    const chart = {
      qBm: `Carta palang menunjukkan bintang yang dikumpul: ${tally}. Siapakah yang mengumpul bintang paling ${askMost ? 'banyak' : 'sedikit'}?`,
      qEn: `A bar chart shows stars collected: ${tally}. Who collected the ${askMost ? 'most' : 'fewest'} stars?`,
      ans: names[targetIdx],
      others: names.filter((_, i) => i !== targetIdx),
      hintBm: `Cari palang yang paling ${askMost ? 'tinggi' : 'rendah'}, iaitu nombor yang paling ${askMost ? 'besar' : 'kecil'}.`,
      hintEn: `Look for the ${askMost ? 'tallest' : 'shortest'} bar, which is the ${askMost ? 'biggest' : 'smallest'} number.`,
      expBm: `${names[targetIdx]} mengumpul ${targetValue} bintang, paling ${askMost ? 'banyak' : 'sedikit'} antara mereka.`,
      expEn: `${names[targetIdx]} collected ${targetValue} stars, the ${askMost ? 'most' : 'fewest'} of the four.`
    };

    const pick = coin() ? pickOne(items) : chart;

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
      prompt: { bm: pick.qBm, en: pick.qEn },
      voicePrompt: { bm: pick.qBm, en: pick.qEn },
      hint: { bm: pick.hintBm, en: pick.hintEn },
      explanation: { bm: pick.expBm, en: pick.expEn },
      answer: pick.ans,
      options: buildOptions(pick.ans as number | string, pick.others as (number | string)[])
    };
  }

  // =========================================================================
  // YEAR 4 GENERATORS (KSSR Semakan 2017 DSKP)
  // =========================================================================

  private static genY4Numbers100000(difficulty: Difficulty): Question {
    const mode = pickOne(['bodmas', 'round', 'place'] as const);

    const meta = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_4' as LevelId,
      learningArea: 'Nombor dan Operasi',
      topicId: 'y4_numbers_100000',
      topicName: { bm: '1.0 Nombor Bulat & Operasi Bergabung', en: '1.0 Whole Numbers & Mixed Operations' },
      standardContent: '1.1 - 1.9',
      standardLearning: mode === 'bodmas' ? '1.7.1' : '1.4.1',
      difficulty
    };

    if (mode === 'bodmas') {
      const a = randInt(10, 40);
      const b = randInt(2, 9);
      const c = randInt(2, 6);
      const isPlus = coin();
      const product = b * c;
      const answer = isPlus ? a + product : Math.max(a, product + 1) - product;
      const shownA = isPlus ? a : Math.max(a, product + 1);

      return {
        id: `y4_bodmas_${Date.now()}`,
        metadata: meta,
        type: 'numeric_keypad',
        prompt: {
          bm: `Selesaikan: ${shownA} ${isPlus ? '+' : '-'} ${b} × ${c} = ?`,
          en: `Solve: ${shownA} ${isPlus ? '+' : '-'} ${b} × ${c} = ?`
        },
        voicePrompt: {
          bm: `${shownA} ${isPlus ? 'tambah' : 'tolak'} ${b} darab ${c}.`,
          en: `${shownA} ${isPlus ? 'plus' : 'minus'} ${b} times ${c}.`
        },
        hint: {
          bm: 'Mengikut tertib operasi, selesaikan darab dahulu sebelum tambah atau tolak.',
          en: 'Following the order of operations, do the multiplication before adding or subtracting.'
        },
        explanation: {
          bm: `${b} × ${c} = ${product}, kemudian ${shownA} ${isPlus ? '+' : '-'} ${product} = ${answer}`,
          en: `${b} × ${c} = ${product}, then ${shownA} ${isPlus ? '+' : '-'} ${product} = ${answer}`
        },
        answer,
        options: generateDistractors(answer, 3, 0, 200)
      };
    }

    if (mode === 'round') {
      const n = randInt(10000, 99999);
      const answer = Math.round(n / 1000) * 1000;
      const hundredsDigit = Math.floor((n % 1000) / 100);

      return {
        id: `y4_round_${Date.now()}`,
        metadata: meta,
        type: 'multiple_choice',
        prompt: { bm: `Bundarkan ${fmt(n)} kepada ribu yang terdekat:`, en: `Round ${fmt(n)} to the nearest thousand:` },
        voicePrompt: { bm: `Bundarkan ${n} kepada ribu terdekat.`, en: `Round ${n} to the nearest thousand.` },
        hint: { bm: 'Lihat digit ratus. Jika 5 atau lebih, bundarkan ke atas.', en: 'Look at the hundreds digit. If it is 5 or more, round up.' },
        explanation: {
          bm: `Digit ratus ialah ${hundredsDigit}, jadi ${fmt(n)} dibundarkan menjadi ${fmt(answer)}.`,
          en: `The hundreds digit is ${hundredsDigit}, so ${fmt(n)} rounds to ${fmt(answer)}.`
        },
        answer: fmt(answer),
        options: buildOptions(fmt(answer), [
          fmt(answer + 1000),
          fmt(answer - 1000),
          fmt(Math.round(n / 100) * 100),
          fmt(Math.round(n / 10000) * 10000),
          fmt(answer + 2000),
          fmt(answer - 2000)
        ])
      };
    }

    const n = randInt(10000, 99999);
    const places = [
      { bm: 'puluh ribu', en: 'ten thousands', value: Math.floor(n / 10000) * 10000 },
      { bm: 'ribu', en: 'thousands', value: Math.floor((n % 10000) / 1000) * 1000 },
      { bm: 'ratus', en: 'hundreds', value: Math.floor((n % 1000) / 100) * 100 }
    ];
    // Asking for a place whose digit is 0 makes a confusing question, so prefer non-zero places
    const target = pickOne(places.filter(p => p.value > 0).length ? places.filter(p => p.value > 0) : places);

    return {
      id: `y4_place_${Date.now()}`,
      metadata: meta,
      type: 'multiple_choice',
      prompt: {
        bm: `Dalam nombor ${fmt(n)}, apakah NILAI digit di tempat ${target.bm.toUpperCase()}?`,
        en: `In the number ${fmt(n)}, what is the VALUE of the digit in the ${target.en.toUpperCase()} place?`
      },
      voicePrompt: { bm: `Nilai digit tempat ${target.bm} dalam ${n}.`, en: `The value of the ${target.en} digit in ${n}.` },
      hint: { bm: 'Kira tempat dari kanan: sa, puluh, ratus, ribu, puluh ribu.', en: 'Count places from the right: ones, tens, hundreds, thousands, ten thousands.' },
      explanation: { bm: `Nilai digit tempat ${target.bm} ialah ${fmt(target.value)}.`, en: `The value of the ${target.en} digit is ${fmt(target.value)}.` },
      answer: fmt(target.value),
      options: buildOptions(
        fmt(target.value),
        places
          .filter(p => p.value !== target.value && p.value > 0)
          .map(p => fmt(p.value))
          .concat([fmt(target.value * 10), fmt(target.value / 10), fmt(n), fmt(target.value + 1000)])
      )
    };
  }

  private static genY4FractionsDecimals(): Question {
    const toImproper = coin();
    const den = pickOne([2, 3, 4, 5, 8]);
    const num = randInt(1, den - 1);
    const whole = randInt(1, 4);
    const improperNum = whole * den + num;

    if (toImproper) {
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
        voicePrompt: {
          bm: `${whole} dan ${num} per ${den} sebagai pecahan tak wajar.`,
          en: `${whole} and ${num} over ${den} as an improper fraction.`
        },
        hint: {
          bm: `Darabkan nombor bulat dengan penyebut, kemudian tambah pengangka: (${whole} × ${den}) + ${num}.`,
          en: `Multiply the whole number by the denominator, then add the numerator: (${whole} × ${den}) + ${num}.`
        },
        explanation: {
          bm: `(${whole} × ${den}) + ${num} = ${improperNum}, jadi jawapannya ${improperNum}/${den}.`,
          en: `(${whole} × ${den}) + ${num} = ${improperNum}, so the answer is ${improperNum}/${den}.`
        },
        answer: `${improperNum}/${den}`,
        options: buildOptions(`${improperNum}/${den}`, [
          `${whole * den}/${den}`,
          `${whole + num}/${den}`,
          `${improperNum + 1}/${den}`,
          `${improperNum}/${den + 1}`
        ])
      };
    }

    // Decimal <-> fraction with hundredths
    const hundredths = randInt(11, 99);
    const decimalStr = `0.${hundredths}`;

    return {
      id: `y4_fdec_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_4',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y4_fractions_decimals',
        topicName: { bm: '2.0 Pecahan, Perpuluhan & Peratus', en: '2.0 Fractions, Decimals & Percentages' },
        standardContent: '2.1 - 2.3',
        standardLearning: '2.2.1',
        difficulty: 'medium'
      },
      type: 'multiple_choice',
      prompt: {
        bm: `Tukarkan ${decimalStr} kepada pecahan:`,
        en: `Convert ${decimalStr} into a fraction:`
      },
      voicePrompt: { bm: `Sifar perpuluhan ${hundredths} sebagai pecahan.`, en: `Zero point ${hundredths} as a fraction.` },
      hint: {
        bm: 'Dua tempat perpuluhan bermaksud per seratus.',
        en: 'Two decimal places means hundredths.'
      },
      explanation: { bm: `${decimalStr} = ${hundredths}/100.`, en: `${decimalStr} = ${hundredths}/100.` },
      answer: `${hundredths}/100`,
      options: buildOptions(`${hundredths}/100`, [`${hundredths}/10`, `${hundredths}/1000`, `100/${hundredths}`, `${hundredths}%`])
    };
  }

  private static genY4Money100000(): Question {
    if (coin()) {
      const currencies = [
        { countryBm: 'Jepun', countryEn: 'Japan', curr: 'Yen (JPY)' },
        { countryBm: 'United Kingdom', countryEn: 'United Kingdom', curr: 'Pound Sterling (GBP)' },
        { countryBm: 'Amerika Syarikat', countryEn: 'United States', curr: 'Dollar (USD)' },
        { countryBm: 'Arab Saudi', countryEn: 'Saudi Arabia', curr: 'Riyal (SAR)' },
        { countryBm: 'Thailand', countryEn: 'Thailand', curr: 'Baht (THB)' },
        { countryBm: 'Indonesia', countryEn: 'Indonesia', curr: 'Rupiah (IDR)' }
      ];
      const pick = pickOne(currencies);

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
        prompt: { bm: `Apakah mata wang bagi negara ${pick.countryBm}?`, en: `What is the currency of ${pick.countryEn}?` },
        voicePrompt: { bm: `Mata wang negara ${pick.countryBm}.`, en: `The currency of ${pick.countryEn}.` },
        hint: { bm: 'Fikirkan nama mata wang yang biasa didengar tentang negara itu.', en: 'Think of the currency name you usually hear for that country.' },
        explanation: { bm: `Mata wang ${pick.countryBm} ialah ${pick.curr}.`, en: `The currency of ${pick.countryEn} is ${pick.curr}.` },
        answer: pick.curr,
        options: buildOptions(pick.curr, currencies.filter(c => c.curr !== pick.curr).map(c => c.curr))
      };
    }

    const unitPrice = randInt(12, 60) * 100;
    const qty = randInt(2, 8);
    const total = unitPrice * qty;

    return {
      id: `y4_money_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_4',
        learningArea: 'Nombor dan Operasi',
        topicId: 'y4_money_100000',
        topicName: { bm: '3.0 Wang Hingga RM100 000', en: '3.0 Money up to RM100,000' },
        standardContent: '3.1 - 3.3',
        standardLearning: '3.2.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Sebuah komputer riba berharga RM${fmt(unitPrice)}. Berapakah jumlah harga bagi ${qty} buah komputer riba?`,
        en: `A laptop costs RM${fmt(unitPrice)}. What is the total price of ${qty} laptops?`
      },
      voicePrompt: { bm: `RM${unitPrice} darab ${qty}.`, en: `RM${unitPrice} times ${qty}.` },
      hint: { bm: `Darabkan harga seunit dengan kuantiti: RM${unitPrice} × ${qty}.`, en: `Multiply the unit price by the quantity: RM${unitPrice} × ${qty}.` },
      explanation: { bm: `RM${unitPrice} × ${qty} = RM${fmt(total)}`, en: `RM${unitPrice} × ${qty} = RM${fmt(total)}` },
      answer: total,
      options: generateDistractors(total, 3, 0, 100000, unitPrice)
    };
  }

  private static genY4TimeDecades(): Question {
    const units = [
      { bm: 'dekad', en: 'decade', enPlural: 'decades', years: 10 },
      { bm: 'abad', en: 'century', enPlural: 'centuries', years: 100 },
      { bm: 'alaf', en: 'millennium', enPlural: 'millennia', years: 1000 }
    ];
    const unit = pickOne(units);
    const count = unit.years === 1000 ? randInt(2, 4) : randInt(2, 7);
    const years = count * unit.years;
    const toYears = coin();
    const answer = toYears ? years : count;

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
        bm: toYears
          ? `${count} ${unit.bm} bersamaan dengan berapa tahun?`
          : `${fmt(years)} tahun bersamaan dengan berapa ${unit.bm}?`,
        en: toYears
          ? `${count} ${unit.enPlural} is equal to how many years?`
          : `${fmt(years)} years is equal to how many ${unit.enPlural}?`
      },
      voicePrompt: {
        bm: toYears ? `${count} ${unit.bm} berapa tahun?` : `${years} tahun berapa ${unit.bm}?`,
        en: toYears ? `${count} ${unit.enPlural} in years?` : `${years} years in ${unit.enPlural}?`
      },
      hint: {
        bm: `1 ${unit.bm} = ${fmt(unit.years)} tahun. ${toYears ? 'Maka darabkan.' : 'Maka bahagikan.'}`,
        en: `1 ${unit.en} = ${fmt(unit.years)} years. ${toYears ? 'So multiply.' : 'So divide.'}`
      },
      explanation: {
        bm: toYears
          ? `${count} × ${unit.years} = ${fmt(years)} tahun`
          : `${fmt(years)} ÷ ${unit.years} = ${count} ${unit.bm}`,
        en: toYears
          ? `${count} × ${unit.years} = ${fmt(years)} years`
          : `${fmt(years)} ÷ ${unit.years} = ${count} ${unit.enPlural}`
      },
      answer,
      options: generateDistractors(answer, 3, 1, 10000, toYears ? unit.years : 1)
    };
  }

  private static genY4GeometryArea(): Question {
    const isSquare = Math.random() < 0.3;
    const length = randInt(4, 12);
    const width = isSquare ? length : randInt(2, 9);
    const wantArea = coin();
    const area = length * width;
    const perimeter = 2 * (length + width);
    const answer = wantArea ? area : perimeter;

    const shapeBm = isSquare ? 'segi empat sama' : 'segi empat tepat';
    const shapeEn = isSquare ? 'square' : 'rectangle';
    const dimsBm = isSquare ? `sisi ${length} cm` : `panjang ${length} cm dan lebar ${width} cm`;
    const dimsEn = isSquare ? `side ${length} cm` : `length ${length} cm and width ${width} cm`;

    return {
      id: `y4_area_${Date.now()}`,
      metadata: {
        curriculumVersion: 'KSSR_SEMAKAN_2017',
        level: 'year_4',
        learningArea: 'Sukatan dan Geometri',
        topicId: 'y4_geometry_area',
        topicName: { bm: '6.0 Ruang: Perimeter & Luas', en: '6.0 Space: Perimeter & Area' },
        standardContent: '6.1 - 6.4',
        standardLearning: wantArea ? '6.3.1' : '6.2.1',
        difficulty: 'medium'
      },
      type: 'numeric_keypad',
      prompt: {
        bm: `Kira ${wantArea ? 'LUAS' : 'PERIMETER'} sebuah ${shapeBm} dengan ${dimsBm}:`,
        en: `Calculate the ${wantArea ? 'AREA' : 'PERIMETER'} of a ${shapeEn} with ${dimsEn}:`
      },
      voicePrompt: {
        bm: `${wantArea ? 'Luas' : 'Perimeter'} ${shapeBm} itu berapa?`,
        en: `What is the ${wantArea ? 'area' : 'perimeter'} of that ${shapeEn}?`
      },
      hint: {
        bm: wantArea ? 'Luas = panjang × lebar.' : 'Perimeter = jumlah panjang semua sisi.',
        en: wantArea ? 'Area = length × width.' : 'Perimeter = the total length of all sides.'
      },
      explanation: {
        bm: wantArea
          ? `Luas = ${length} × ${width} = ${area} cm²`
          : `Perimeter = ${length} + ${width} + ${length} + ${width} = ${perimeter} cm`,
        en: wantArea
          ? `Area = ${length} × ${width} = ${area} cm²`
          : `Perimeter = ${length} + ${width} + ${length} + ${width} = ${perimeter} cm`
      },
      answer,
      options: buildOptions(answer, [area, perimeter, length + width, area * 2, answer + 2, answer - 2].filter(v => v > 0 && v !== answer))
    };
  }

  private static genY4CoordinatesData(): Question {
    const x = randInt(1, 6);
    let y = randInt(1, 6);
    while (y === x) y = randInt(1, 6); // keeps (x, y) and (y, x) distinct

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
        bm: `Titik P terletak ${x} unit mengufuk (paksi-x) dan ${y} unit mencancang (paksi-y) dari asalan (0, 0). Apakah koordinat titik P?`,
        en: `Point P is ${x} units horizontally (x-axis) and ${y} units vertically (y-axis) from the origin (0, 0). What are the coordinates of P?`
      },
      voicePrompt: { bm: 'Apakah koordinat titik P?', en: 'What are the coordinates of point P?' },
      hint: { bm: 'Koordinat ditulis (x, y): mengufuk dahulu, kemudian mencancang.', en: 'Coordinates are written (x, y): horizontal first, then vertical.' },
      explanation: { bm: `Koordinat P ialah (${x}, ${y}).`, en: `The coordinates of P are (${x}, ${y}).` },
      answer: `(${x}, ${y})`,
      options: buildOptions(`(${x}, ${y})`, [`(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y + 1})`, `(0, ${x})`])
    };
  }

  // =========================================================================
  // YEAR 5 GENERATORS (KSSR Semakan 2017 DSKP)
  // =========================================================================

  private static genY5Numbers1000000(difficulty: Difficulty): Question {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const nonPrimes = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 33, 35, 39, 49];

    const meta = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_5' as LevelId,
      learningArea: 'Nombor dan Operasi',
      topicId: 'y5_numbers_1000000',
      topicName: { bm: '1.0 Nombor Bulat & Nombor Perdana', en: '1.0 Numbers to 1,000,000 & Primes' },
      standardContent: '1.1 - 1.4',
      standardLearning: '1.2.1',
      difficulty
    };

    const mode = pickOne(['prime', 'composite', 'place'] as const);

    if (mode === 'prime') {
      const prime = pickOne(primes);
      return {
        id: `y5_prime_${Date.now()}`,
        metadata: meta,
        type: 'multiple_choice',
        prompt: { bm: 'Antara nombor berikut, yang manakah NOMBOR PERDANA?', en: 'Which of the following is a PRIME NUMBER?' },
        voicePrompt: { bm: 'Pilih nombor perdana.', en: 'Choose the prime number.' },
        hint: { bm: 'Nombor perdana hanya boleh dibahagi tepat dengan 1 dan dirinya sendiri.', en: 'A prime number is divisible only by 1 and itself.' },
        explanation: { bm: `${prime} ialah nombor perdana kerana faktornya hanya 1 dan ${prime}.`, en: `${prime} is prime because its only factors are 1 and ${prime}.` },
        answer: prime,
        options: buildOptions(prime, shuffle(nonPrimes).slice(0, 6))
      };
    }

    if (mode === 'composite') {
      const composite = pickOne(nonPrimes);
      return {
        id: `y5_comp_${Date.now()}`,
        metadata: meta,
        type: 'multiple_choice',
        prompt: { bm: 'Antara nombor berikut, yang manakah BUKAN nombor perdana?', en: 'Which of the following is NOT a prime number?' },
        voicePrompt: { bm: 'Pilih nombor yang bukan nombor perdana.', en: 'Choose the number that is not prime.' },
        hint: { bm: 'Nombor bukan perdana mempunyai lebih daripada dua faktor.', en: 'A number that is not prime has more than two factors.' },
        explanation: {
          bm: `${composite} bukan nombor perdana kerana ia boleh dibahagi dengan nombor selain 1 dan ${composite}.`,
          en: `${composite} is not prime because it can be divided by numbers other than 1 and ${composite}.`
        },
        answer: composite,
        options: buildOptions(composite, shuffle(primes).slice(0, 6))
      };
    }

    const n = randInt(100000, 999999);
    const places = [
      { bm: 'ratus ribu', en: 'hundred thousands', value: Math.floor(n / 100000) * 100000 },
      { bm: 'puluh ribu', en: 'ten thousands', value: Math.floor((n % 100000) / 10000) * 10000 },
      { bm: 'ribu', en: 'thousands', value: Math.floor((n % 10000) / 1000) * 1000 }
    ];
    const target = pickOne(places.filter(p => p.value > 0).length ? places.filter(p => p.value > 0) : places);

    return {
      id: `y5_place_${Date.now()}`,
      metadata: meta,
      type: 'multiple_choice',
      prompt: {
        bm: `Dalam nombor ${fmt(n)}, apakah NILAI digit di tempat ${target.bm.toUpperCase()}?`,
        en: `In the number ${fmt(n)}, what is the VALUE of the digit in the ${target.en.toUpperCase()} place?`
      },
      voicePrompt: { bm: `Nilai digit tempat ${target.bm}.`, en: `The value of the ${target.en} digit.` },
      hint: { bm: 'Kira tempat dari kanan: sa, puluh, ratus, ribu, puluh ribu, ratus ribu.', en: 'Count places from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands.' },
      explanation: { bm: `Nilainya ialah ${fmt(target.value)}.`, en: `Its value is ${fmt(target.value)}.` },
      answer: fmt(target.value),
      options: buildOptions(
        fmt(target.value),
        places
          .filter(p => p.value !== target.value && p.value > 0)
          .map(p => fmt(p.value))
          .concat([fmt(target.value * 10), fmt(Math.floor(target.value / 10)), fmt(n), fmt(target.value + 10000)])
      )
    };
  }

  private static genY5FractionsAdvanced(): Question {
    const den = pickOne([2, 3, 4, 5, 8, 10]);
    const num = randInt(1, den - 1);
    const groups = randInt(2, 9);
    const total = den * groups;
    const answer = num * groups;
    const fruit = pickOne([
      { bm: 'biji durian', en: 'durians' },
      { bm: 'biji rambutan', en: 'rambutans' },
      { bm: 'keping kuih', en: 'pieces of kuih' },
      { bm: 'biji guli', en: 'marbles' }
    ]);

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
        bm: `Kira ${num}/${den} daripada ${total} ${fruit.bm}:`,
        en: `Calculate ${num}/${den} of ${total} ${fruit.en}:`
      },
      voicePrompt: { bm: `${num} per ${den} daripada ${total}.`, en: `${num} over ${den} of ${total}.` },
      hint: {
        bm: `Bahagikan ${total} dengan ${den} dahulu, kemudian darabkan dengan ${num}.`,
        en: `Divide ${total} by ${den} first, then multiply by ${num}.`
      },
      explanation: {
        bm: `${total} ÷ ${den} = ${groups}, kemudian ${groups} × ${num} = ${answer}`,
        en: `${total} ÷ ${den} = ${groups}, then ${groups} × ${num} = ${answer}`
      },
      answer,
      options: generateDistractors(answer, 3, 1, total + 10)
    };
  }

  private static genY5MoneyInvestments(): Question {
    const principal = randInt(2, 20) * 500;
    const rate = pickOne([2, 4, 5, 10]);
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
        bm: `Encik Razak menyimpan RM${fmt(principal)} di bank dengan faedah mudah ${rate}% setahun. Berapakah faedah yang diterimanya selepas 1 tahun?`,
        en: `Mr Razak saves RM${fmt(principal)} in a bank at ${rate}% simple interest per year. How much interest does he receive after 1 year?`
      },
      voicePrompt: { bm: `${rate} peratus daripada RM${principal}.`, en: `${rate} percent of RM${principal}.` },
      hint: { bm: `Faedah = (${rate} ÷ 100) × RM${fmt(principal)}.`, en: `Interest = (${rate} ÷ 100) × RM${fmt(principal)}.` },
      explanation: { bm: `(${rate} ÷ 100) × RM${fmt(principal)} = RM${fmt(interest)}`, en: `(${rate} ÷ 100) × RM${fmt(principal)} = RM${fmt(interest)}` },
      answer: interest,
      options: generateDistractors(interest, 3, 1, principal)
    };
  }

  private static genY5TimeZones(): Question {
    const departHour = randInt(6, 18);
    const duration = randInt(1, 5);
    const arriveHour = (departHour + duration) % 24;
    const pad = (h: number) => `${String(h).padStart(2, '0')}00`;
    const routes = [
      { fromBm: 'Kuala Lumpur', toBm: 'Kuching', fromEn: 'Kuala Lumpur', toEn: 'Kuching' },
      { fromBm: 'Pulau Pinang', toBm: 'Kota Kinabalu', fromEn: 'Penang', toEn: 'Kota Kinabalu' },
      { fromBm: 'Johor Bahru', toBm: 'Langkawi', fromEn: 'Johor Bahru', toEn: 'Langkawi' }
    ];
    const route = pickOne(routes);
    const answer = `Jam ${pad(arriveHour)}`;

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
        bm: `Penerbangan bertolak dari ${route.fromBm} pada jam ${pad(departHour)} dan mengambil masa ${duration} jam untuk tiba di ${route.toBm}. Pukul berapakah ia tiba?`,
        en: `A flight departs ${route.fromEn} at ${pad(departHour)} hours and takes ${duration} hours to reach ${route.toEn}. What time does it arrive?`
      },
      voicePrompt: {
        bm: `Jam ${pad(departHour)} tambah ${duration} jam.`,
        en: `${pad(departHour)} hours plus ${duration} hours.`
      },
      hint: { bm: 'Tambahkan tempoh perjalanan kepada waktu berlepas.', en: 'Add the travel duration to the departure time.' },
      explanation: {
        bm: `${pad(departHour)} + ${duration} jam = ${pad(arriveHour)}`,
        en: `${pad(departHour)} + ${duration} hours = ${pad(arriveHour)}`
      },
      answer,
      options: buildOptions(answer, [
        `Jam ${pad((arriveHour + 1) % 24)}`,
        `Jam ${pad((arriveHour + 24 - 1) % 24)}`,
        `Jam ${pad(departHour)}`,
        `Jam ${pad((arriveHour + 2) % 24)}`
      ])
    };
  }

  private static genY5GeometryVolume(): Question {
    const isCube = coin();
    const s = randInt(2, 6);
    const l = randInt(2, 8);
    const w = randInt(2, 6);
    const h = randInt(2, 5);
    const volume = isCube ? s * s * s : l * w * h;

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
        bm: isCube
          ? `Kira isi padu sebuah kubus dengan panjang sisi ${s} cm:`
          : `Kira isi padu sebuah kuboid dengan panjang ${l} cm, lebar ${w} cm dan tinggi ${h} cm:`,
        en: isCube
          ? `Calculate the volume of a cube with side length ${s} cm:`
          : `Calculate the volume of a cuboid measuring ${l} cm by ${w} cm by ${h} cm:`
      },
      voicePrompt: { bm: 'Berapakah isi padunya?', en: 'What is the volume?' },
      hint: {
        bm: isCube ? 'Isi padu kubus = sisi × sisi × sisi.' : 'Isi padu kuboid = panjang × lebar × tinggi.',
        en: isCube ? 'Volume of a cube = side × side × side.' : 'Volume of a cuboid = length × width × height.'
      },
      explanation: {
        bm: isCube ? `${s} × ${s} × ${s} = ${volume} cm³` : `${l} × ${w} × ${h} = ${volume} cm³`,
        en: isCube ? `${s} × ${s} × ${s} = ${volume} cm³` : `${l} × ${w} × ${h} = ${volume} cm³`
      },
      answer: volume,
      options: generateDistractors(volume, 3, 1, 1000)
    };
  }

  private static genY5Stats(): Question {
    const mode = pickOne(['mean', 'mode', 'median', 'range'] as const);

    const meta = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_5' as LevelId,
      learningArea: 'Statistik dan Kebolehjadian',
      topicId: 'y5_stats_mode_median_mean',
      topicName: { bm: '8.0 Pengurusan Data: Mod, Median, Min & Julat', en: '8.0 Data: Mode, Median, Mean & Range' },
      standardContent: '8.1 - 8.3',
      standardLearning: '8.1.1',
      difficulty: 'medium' as Difficulty
    };

    if (mode === 'mean') {
      const count = pickOne([3, 4]);
      const avg = randInt(6, 20);
      const offsets = count === 3 ? shuffle([-2, 0, 2]) : shuffle([-3, -1, 1, 3]);
      const data = offsets.map(o => avg + o);

      return {
        id: `y5_mean_${Date.now()}`,
        metadata: meta,
        type: 'numeric_keypad',
        prompt: { bm: `Cari MIN (purata) bagi set data ini: ${data.join(', ')}`, en: `Find the MEAN (average) of this data set: ${data.join(', ')}` },
        voicePrompt: { bm: 'Cari min bagi set data ini.', en: 'Find the mean of this data set.' },
        hint: { bm: 'Min = jumlah semua nilai ÷ bilangan nilai.', en: 'Mean = the sum of all values ÷ how many values there are.' },
        explanation: {
          bm: `(${data.join(' + ')}) ÷ ${count} = ${data.reduce((s, v) => s + v, 0)} ÷ ${count} = ${avg}`,
          en: `(${data.join(' + ')}) ÷ ${count} = ${data.reduce((s, v) => s + v, 0)} ÷ ${count} = ${avg}`
        },
        answer: avg,
        options: generateDistractors(avg, 3, 1, 40)
      };
    }

    if (mode === 'range') {
      const values: number[] = [];
      while (values.length < 5) {
        const v = randInt(2, 40);
        if (!values.includes(v)) values.push(v); // distinct values keep the range non-zero
      }
      const data = shuffle(values);
      const range = Math.max(...data) - Math.min(...data);

      return {
        id: `y5_range_${Date.now()}`,
        metadata: meta,
        type: 'numeric_keypad',
        prompt: { bm: `Cari JULAT bagi set data ini: ${data.join(', ')}`, en: `Find the RANGE of this data set: ${data.join(', ')}` },
        voicePrompt: { bm: 'Cari julat bagi set data ini.', en: 'Find the range of this data set.' },
        hint: { bm: 'Julat = nilai terbesar - nilai terkecil.', en: 'Range = the largest value - the smallest value.' },
        explanation: { bm: `${Math.max(...data)} - ${Math.min(...data)} = ${range}`, en: `${Math.max(...data)} - ${Math.min(...data)} = ${range}` },
        answer: range,
        options: generateDistractors(range, 3, 0, 60)
      };
    }

    if (mode === 'mode') {
      const repeated = randInt(3, 15);
      let other1 = randInt(3, 15);
      while (other1 === repeated) other1 = randInt(3, 15);
      let other2 = randInt(3, 15);
      while (other2 === repeated || other2 === other1) other2 = randInt(3, 15);
      const data = shuffle([repeated, repeated, repeated, other1, other2]);

      return {
        id: `y5_mode_${Date.now()}`,
        metadata: meta,
        type: 'numeric_keypad',
        prompt: { bm: `Cari MOD bagi set data ini: ${data.join(', ')}`, en: `Find the MODE of this data set: ${data.join(', ')}` },
        voicePrompt: { bm: 'Cari mod bagi set data ini.', en: 'Find the mode of this data set.' },
        hint: { bm: 'Mod ialah nilai yang paling kerap muncul.', en: 'The mode is the value that appears most often.' },
        explanation: { bm: `${repeated} muncul sebanyak 3 kali, paling kerap dalam set ini.`, en: `${repeated} appears 3 times, more than any other value.` },
        answer: repeated,
        options: buildOptions(repeated, [other1, other2, repeated + 1, repeated - 1, repeated + 2])
      };
    }

    // median of 5 distinct values
    const pool: number[] = [];
    while (pool.length < 5) {
      const v = randInt(2, 30);
      if (!pool.includes(v)) pool.push(v);
    }
    const sorted = [...pool].sort((a, b) => a - b);
    const median = sorted[2];

    return {
      id: `y5_median_${Date.now()}`,
      metadata: meta,
      type: 'numeric_keypad',
      prompt: { bm: `Cari MEDIAN bagi set data ini: ${pool.join(', ')}`, en: `Find the MEDIAN of this data set: ${pool.join(', ')}` },
      voicePrompt: { bm: 'Cari median bagi set data ini.', en: 'Find the median of this data set.' },
      hint: { bm: 'Susun data menaik dahulu, kemudian ambil nilai di tengah.', en: 'Sort the data in order first, then take the middle value.' },
      explanation: { bm: `Tersusun: ${sorted.join(', ')}. Nilai tengah ialah ${median}.`, en: `Sorted: ${sorted.join(', ')}. The middle value is ${median}.` },
      answer: median,
      options: generateDistractors(median, 3, 1, 40)
    };
  }

  // =========================================================================
  // YEAR 6 GENERATORS (KSSR Semakan 2017 DSKP)
  // =========================================================================

  private static genY6Numbers10000000(difficulty: Difficulty): Question {
    const wholeMillions = randInt(1, 9);
    const tenth = randInt(1, 9);
    const useHalfMillion = coin();
    const millionsLabel = useHalfMillion ? `${wholeMillions}.${tenth}` : `${wholeMillions}`;
    const actual = useHalfMillion
      ? wholeMillions * 1000000 + tenth * 100000
      : wholeMillions * 1000000;

    const answer = fmt(actual);
    const candidates = [
      fmt(actual / 10),
      fmt(actual * 10),
      fmt(actual + 100000),
      fmt(useHalfMillion ? wholeMillions * 1000000 + tenth * 10000 : actual + 1000)
    ];

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
      prompt: { bm: `Tukarkan ${millionsLabel} juta kepada nombor bulat:`, en: `Convert ${millionsLabel} million into a whole number:` },
      voicePrompt: { bm: `${millionsLabel} juta dalam bentuk nombor.`, en: `${millionsLabel} million written as a numeral.` },
      hint: { bm: `1 juta = 1 000 000, jadi darabkan ${millionsLabel} dengan 1 000 000.`, en: `1 million = 1,000,000, so multiply ${millionsLabel} by 1,000,000.` },
      explanation: { bm: `${millionsLabel} × 1 000 000 = ${answer}`, en: `${millionsLabel} × 1,000,000 = ${answer}` },
      answer,
      options: buildOptions(answer, candidates)
    };
  }

  private static genY6FractionsDecimalsPercent(): Question {
    const discount = pickOne([10, 20, 25, 50]);
    const price = randInt(2, 20) * 20;
    const savings = (price * discount) / 100;
    const finalPrice = price - savings;
    const askFinal = coin();
    const answer = askFinal ? finalPrice : savings;
    const item = pickOne([
      { bm: 'beg', en: 'bag' },
      { bm: 'kasut sukan', en: 'pair of sports shoes' },
      { bm: 'jam tangan', en: 'watch' },
      { bm: 'baju sekolah', en: 'school shirt' }
    ]);

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
        bm: `Sebuah ${item.bm} berharga RM${price} ditawarkan diskaun ${discount}%. Berapakah ${askFinal ? 'harga selepas diskaun' : 'nilai diskaun'}?`,
        en: `A ${item.en} priced at RM${price} is offered a ${discount}% discount. What is the ${askFinal ? 'price after discount' : 'discount amount'}?`
      },
      voicePrompt: {
        bm: `Diskaun ${discount} peratus daripada RM${price}.`,
        en: `A ${discount} percent discount on RM${price}.`
      },
      hint: {
        bm: `Diskaun = (${discount} ÷ 100) × RM${price}.${askFinal ? ' Kemudian tolak daripada harga asal.' : ''}`,
        en: `Discount = (${discount} ÷ 100) × RM${price}.${askFinal ? ' Then subtract it from the original price.' : ''}`
      },
      explanation: {
        bm: `Diskaun = RM${savings}. Harga jualan = RM${price} - RM${savings} = RM${finalPrice}.`,
        en: `Discount = RM${savings}. Sale price = RM${price} - RM${savings} = RM${finalPrice}.`
      },
      answer,
      options: generateDistractors(answer, 3, 1, price + 20)
    };
  }

  private static genY6MoneyFinancial(): Question {
    const cost = randInt(3, 30) * 10;
    const isProfit = coin();
    const diff = randInt(1, 10) * 5;
    const sell = isProfit ? cost + diff : cost - diff;

    if (!isProfit && sell <= 0) {
      // keep the numbers realistic when the margin would go negative
      return this.genY6MoneyFinancial();
    }

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
        bm: `Peniaga membeli baju dengan harga kos RM${cost} dan menjualnya pada harga RM${sell}. Berapakah ${isProfit ? 'KEUNTUNGAN' : 'KERUGIAN'} peniaga itu?`,
        en: `A trader buys a shirt at a cost price of RM${cost} and sells it for RM${sell}. What is the trader's ${isProfit ? 'PROFIT' : 'LOSS'}?`
      },
      voicePrompt: {
        bm: isProfit ? `RM${sell} tolak RM${cost}.` : `RM${cost} tolak RM${sell}.`,
        en: isProfit ? `RM${sell} minus RM${cost}.` : `RM${cost} minus RM${sell}.`
      },
      hint: {
        bm: isProfit ? 'Untung = harga jual - harga kos.' : 'Rugi = harga kos - harga jual.',
        en: isProfit ? 'Profit = selling price - cost price.' : 'Loss = cost price - selling price.'
      },
      explanation: {
        bm: isProfit ? `Untung = RM${sell} - RM${cost} = RM${diff}` : `Rugi = RM${cost} - RM${sell} = RM${diff}`,
        en: isProfit ? `Profit = RM${sell} - RM${cost} = RM${diff}` : `Loss = RM${cost} - RM${sell} = RM${diff}`
      },
      answer: diff,
      options: generateDistractors(diff, 3, 1, cost + sell)
    };
  }

  private static genY6TimeSpeed(): Question {
    const speed = randInt(4, 12) * 10;
    const time = randInt(2, 6);
    const distance = speed * time;
    const solveFor = pickOne(['distance', 'speed', 'time'] as const);

    const answer = solveFor === 'distance' ? distance : solveFor === 'speed' ? speed : time;

    const promptBm =
      solveFor === 'distance'
        ? `Sebuah kereta bergerak dengan kelajuan ${speed} km/j selama ${time} jam. Berapakah jarak yang dilaluinya?`
        : solveFor === 'speed'
        ? `Sebuah kereta melalui jarak ${fmt(distance)} km dalam masa ${time} jam. Berapakah kelajuan puratanya dalam km/j?`
        : `Sebuah kereta melalui jarak ${fmt(distance)} km dengan kelajuan ${speed} km/j. Berapakah masa yang diambil dalam jam?`;

    const promptEn =
      solveFor === 'distance'
        ? `A car travels at ${speed} km/h for ${time} hours. What distance does it cover?`
        : solveFor === 'speed'
        ? `A car covers ${fmt(distance)} km in ${time} hours. What is its average speed in km/h?`
        : `A car covers ${fmt(distance)} km at ${speed} km/h. How many hours does the journey take?`;

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
      prompt: { bm: promptBm, en: promptEn },
      voicePrompt: { bm: promptBm, en: promptEn },
      hint: {
        bm: 'Jarak = laju × masa. Maka laju = jarak ÷ masa, dan masa = jarak ÷ laju.',
        en: 'Distance = speed × time. So speed = distance ÷ time, and time = distance ÷ speed.'
      },
      explanation: {
        bm: solveFor === 'distance'
          ? `Jarak = ${speed} × ${time} = ${fmt(distance)} km`
          : solveFor === 'speed'
          ? `Laju = ${fmt(distance)} ÷ ${time} = ${speed} km/j`
          : `Masa = ${fmt(distance)} ÷ ${speed} = ${time} jam`,
        en: solveFor === 'distance'
          ? `Distance = ${speed} × ${time} = ${fmt(distance)} km`
          : solveFor === 'speed'
          ? `Speed = ${fmt(distance)} ÷ ${time} = ${speed} km/h`
          : `Time = ${fmt(distance)} ÷ ${speed} = ${time} hours`
      },
      answer,
      options: generateDistractors(answer, 3, 1, distance + 50)
    };
  }

  private static genY6GeometryComposite(): Question {
    const rectL = randInt(4, 12);
    const rectW = randInt(3, 9);
    const triBase = randInt(4, 10);
    const triHeightHalf = randInt(1, 5);
    const triHeight = triHeightHalf * 2; // keeps the triangle area a whole number

    const areaA = rectL * rectW;
    const areaB = (triBase * triHeight) / 2;
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
        bm: `Sebuah bentuk gabungan terdiri daripada segi empat tepat (panjang ${rectL} cm, lebar ${rectW} cm) dan segi tiga (tapak ${triBase} cm, tinggi ${triHeight} cm). Berapakah jumlah luasnya dalam cm²?`,
        en: `A composite shape is made of a rectangle (${rectL} cm by ${rectW} cm) and a triangle (base ${triBase} cm, height ${triHeight} cm). What is its total area in cm²?`
      },
      voicePrompt: { bm: 'Berapakah jumlah luas bentuk gabungan itu?', en: 'What is the total area of the composite shape?' },
      hint: {
        bm: 'Luas segi empat tepat = panjang × lebar. Luas segi tiga = ½ × tapak × tinggi. Kemudian jumlahkan.',
        en: 'Rectangle area = length × width. Triangle area = ½ × base × height. Then add them.'
      },
      explanation: {
        bm: `Segi empat tepat = ${rectL} × ${rectW} = ${areaA} cm². Segi tiga = ½ × ${triBase} × ${triHeight} = ${areaB} cm². Jumlah = ${totalArea} cm².`,
        en: `Rectangle = ${rectL} × ${rectW} = ${areaA} cm². Triangle = ½ × ${triBase} × ${triHeight} = ${areaB} cm². Total = ${totalArea} cm².`
      },
      answer: totalArea,
      options: buildOptions(totalArea, [areaA, areaB, areaA + triBase * triHeight, totalArea + 10].filter(v => v !== totalArea))
    };
  }

  private static genY6ProbabilityData(): Question {
    if (Math.random() < 0.6) return this.genY6ProbabilityDataExtra();

    const situations = [
      {
        bm: 'Matahari terbit di sebelah timur esok pagi.',
        en: 'The sun rises in the east tomorrow morning.',
        ans: 'Pasti (Certain)'
      },
      {
        bm: 'Mendapat nombor 7 apabila melambung sebiji dadu bernombor 1 hingga 6.',
        en: 'Rolling a 7 on a standard six-sided die.',
        ans: 'Mustahil (Impossible)'
      },
      {
        bm: 'Hujan akan turun di Kuala Lumpur pada petang ini.',
        en: 'It will rain in Kuala Lumpur this afternoon.',
        ans: 'Mungkin berlaku (Possible)'
      },
      {
        bm: 'Mendapat kepala apabila melambung sekeping syiling yang adil.',
        en: 'Getting heads when tossing a fair coin.',
        ans: 'Sama kemungkinan (Equally Likely)'
      },
      {
        bm: 'Mengambil bola merah daripada beg yang mengandungi bola merah sahaja.',
        en: 'Drawing a red ball from a bag that contains only red balls.',
        ans: 'Pasti (Certain)'
      },
      {
        bm: 'Seekor kucing bertutur dalam Bahasa Melayu esok.',
        en: 'A cat speaking Malay tomorrow.',
        ans: 'Mustahil (Impossible)'
      }
    ];

    const pick = pickOne(situations);

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
        bm: `Tentukan kebolehjadian bagi peristiwa ini: "${pick.bm}"`,
        en: `Determine the likelihood of this event: "${pick.en}"`
      },
      voicePrompt: { bm: pick.bm, en: pick.en },
      hint: {
        bm: 'Pasti = tentu berlaku. Mustahil = tidak mungkin berlaku. Sama kemungkinan = peluang sama rata.',
        en: 'Certain = it must happen. Impossible = it cannot happen. Equally likely = both outcomes share the same chance.'
      },
      explanation: { bm: `Kebolehjadian peristiwa ini ialah ${pick.ans}.`, en: `The likelihood of this event is ${pick.ans}.` },
      answer: pick.ans,
      options: shuffle([
        'Pasti (Certain)',
        'Mungkin berlaku (Possible)',
        'Mustahil (Impossible)',
        'Sama kemungkinan (Equally Likely)'
      ])
    };
  }

  // =========================================================================
  // EXTRA VARIANT BANKS
  // Each bank widens a topic that used to repeat itself too often. They are
  // plain question banks: pick one entry, wrap it with buildMcq.
  // =========================================================================

  private static buildMcq(spec: {
    idPrefix: string;
    metadata: CurriculumMetadata;
    type?: QuestionType;
    qBm: string;
    qEn: string;
    voiceBm?: string;
    voiceEn?: string;
    hintBm: string;
    hintEn: string;
    expBm: string;
    expEn: string;
    ans: number | string;
    others: (number | string)[];
  }): Question {
    return {
      id: `${spec.idPrefix}_${Date.now()}`,
      metadata: spec.metadata,
      type: spec.type ?? 'multiple_choice',
      prompt: { bm: spec.qBm, en: spec.qEn },
      voicePrompt: { bm: spec.voiceBm ?? spec.qBm, en: spec.voiceEn ?? spec.qEn },
      hint: { bm: spec.hintBm, en: spec.hintEn },
      explanation: { bm: spec.expBm, en: spec.expEn },
      answer: spec.ans,
      options: buildOptions(spec.ans, spec.others)
    };
  }

  private static genPreTimeMoneyExtra(): Question {
    const metadata: CurriculumMetadata = {
      curriculumVersion: 'KSPK_2017',
      level: 'preschool',
      learningArea: 'Sukatan dan Geometri',
      topicId: 'pre_time_money',
      topicName: { bm: 'Masa & Wang Syiling Asas', en: 'Time & Basic Coins' },
      difficulty: 'easy'
    };

    const kind = pickOne(['days', 'combine', 'exchange', 'enough'] as const);

    if (kind === 'days') {
      const daysBm = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'];
      const daysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const i = randInt(0, 6);
      const after = coin();
      const j = after ? (i + 1) % 7 : (i + 6) % 7;

      return this.buildMcq({
        idPrefix: 'pre_days',
        metadata,
        qBm: `Apakah hari ${after ? 'SELEPAS' : 'SEBELUM'} hari ${daysBm[i]}?`,
        qEn: `Which day comes ${after ? 'AFTER' : 'BEFORE'} ${daysEn[i]}?`,
        hintBm: 'Urutan hari: Isnin, Selasa, Rabu, Khamis, Jumaat, Sabtu, Ahad.',
        hintEn: 'Day order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
        expBm: `Hari ${after ? 'selepas' : 'sebelum'} ${daysBm[i]} ialah ${daysBm[j]}.`,
        expEn: `The day ${after ? 'after' : 'before'} ${daysEn[i]} is ${daysEn[j]}.`,
        ans: daysBm[j],
        others: daysBm.filter(d => d !== daysBm[j])
      });
    }

    if (kind === 'combine') {
      const coins = [5, 10, 20, 50];
      const a = pickOne(coins);
      let b = pickOne(coins);
      while (b === a) b = pickOne(coins);
      const total = a + b;

      return this.buildMcq({
        idPrefix: 'pre_coin_mix',
        metadata,
        qBm: `Amira ada satu syiling ${a} sen dan satu syiling ${b} sen. Berapakah jumlahnya?`,
        qEn: `Amira has one ${a} sen coin and one ${b} sen coin. What is the total?`,
        voiceBm: `${a} sen tambah ${b} sen.`,
        voiceEn: `${a} sen plus ${b} sen.`,
        hintBm: 'Tambahkan nilai kedua-dua syiling itu.',
        hintEn: 'Add the values of both coins together.',
        expBm: `${a} sen + ${b} sen = ${total} sen.`,
        expEn: `${a} sen + ${b} sen = ${total} sen.`,
        ans: `${total} sen`,
        others: [`${total + 5} sen`, `${total - 5} sen`, `${a} sen`, `${total + 10} sen`]
      });
    }

    if (kind === 'exchange') {
      const small = pickOne([5, 10, 20]);
      const bigOptions = small === 20 ? [40, 60, 80] : small === 10 ? [30, 50, 100] : [20, 25, 50];
      const big = pickOne(bigOptions);
      const count = big / small;

      return this.buildMcq({
        idPrefix: 'pre_coin_swap',
        metadata,
        qBm: `Berapa keping syiling ${small} sen diperlukan untuk menyamai ${big} sen?`,
        qEn: `How many ${small} sen coins are needed to make ${big} sen?`,
        hintBm: `Kira melompat ${small} sen setiap kali sehingga cukup ${big} sen.`,
        hintEn: `Skip count by ${small} sen until you reach ${big} sen.`,
        expBm: `${big} ÷ ${small} = ${count} keping syiling.`,
        expEn: `${big} ÷ ${small} = ${count} coins.`,
        ans: count,
        others: [count + 1, count - 1, count + 2, count * 2].filter(v => v > 0 && v !== count)
      });
    }

    // kind === 'enough'
    const price = pickOne([15, 25, 30, 45, 60, 70]);
    const money = price + pickOne([5, 10, 20]);
    const ansBm = 'Cukup (Enough)';

    return this.buildMcq({
      idPrefix: 'pre_coin_enough',
      metadata,
      qBm: `Sebatang gula-gula berharga ${price} sen. Rina ada ${money} sen. Cukupkah wangnya?`,
      qEn: `A sweet costs ${price} sen. Rina has ${money} sen. Is her money enough?`,
      hintBm: 'Bandingkan nombor wang Rina dengan nombor harga.',
      hintEn: "Compare Rina's amount with the price.",
      expBm: `${money} sen lebih banyak daripada ${price} sen, jadi wangnya cukup.`,
      expEn: `${money} sen is more than ${price} sen, so she has enough.`,
      ans: ansBm,
      others: ['Tidak cukup (Not enough)', 'Sama banyak (Exactly the same)']
    });
  }

  private static genY1FractionsExtra(): Question {
    const metadata: CurriculumMetadata = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_1',
      learningArea: 'Nombor dan Operasi',
      topicId: 'y1_fractions',
      topicName: { bm: '3.0 Pecahan: Separuh & Suku', en: '3.0 Fractions: Half & Quarter' },
      standardContent: '3.1',
      standardLearning: '3.1.1',
      difficulty: 'easy'
    };

    const kind = pickOne(['shaded', 'eaten', 'left', 'compare'] as const);
    const den = pickOne([2, 4]);

    if (kind === 'shaded') {
      const num = randInt(1, den - 1);
      const shape = pickOne([
        { bm: 'bulatan', en: 'circle' },
        { bm: 'segi empat', en: 'square' },
        { bm: 'piza', en: 'pizza' }
      ]);

      return this.buildMcq({
        idPrefix: 'y1_frac_shade',
        metadata,
        qBm: `Sebuah ${shape.bm} dibahagi kepada ${den} bahagian sama besar. ${num} bahagian diwarnakan. Apakah pecahan bahagian yang diwarnakan?`,
        qEn: `A ${shape.en} is divided into ${den} equal parts. ${num} part${num > 1 ? 's are' : ' is'} shaded. What fraction is shaded?`,
        hintBm: 'Pengangka ialah bahagian yang diwarnakan, penyebut ialah jumlah semua bahagian.',
        hintEn: 'The top number is the shaded parts, the bottom number is the total parts.',
        expBm: `${num} daripada ${den} bahagian diwarnakan, jadi pecahannya ${num}/${den}.`,
        expEn: `${num} out of ${den} parts are shaded, so the fraction is ${num}/${den}.`,
        ans: `${num}/${den}`,
        others: [`${den}/${num}`, `${num}/${den + 1}`, `${num + 1}/${den}`, '1/3']
      });
    }

    if (kind === 'eaten' || kind === 'left') {
      const eaten = 1;
      const leftParts = den - eaten;
      const askLeft = kind === 'left';
      const ans = askLeft ? `${leftParts}/${den}` : `${eaten}/${den}`;

      return this.buildMcq({
        idPrefix: 'y1_frac_cake',
        metadata,
        qBm: `Sekeping kek dipotong kepada ${den} bahagian sama besar. Ali makan ${eaten} bahagian. Apakah pecahan kek yang ${askLeft ? 'TINGGAL' : 'DIMAKAN'}?`,
        qEn: `A cake is cut into ${den} equal parts. Ali eats ${eaten} part. What fraction of the cake is ${askLeft ? 'LEFT' : 'EATEN'}?`,
        hintBm: askLeft ? `Daripada ${den} bahagian, satu sudah dimakan.` : 'Berapa bahagian dimakan daripada jumlah bahagian?',
        hintEn: askLeft ? `Out of ${den} parts, one has been eaten.` : 'How many parts were eaten out of the total?',
        expBm: askLeft ? `${den} - ${eaten} = ${leftParts}, jadi ${leftParts}/${den} tinggal.` : `1 daripada ${den} bahagian dimakan, iaitu ${eaten}/${den}.`,
        expEn: askLeft ? `${den} - ${eaten} = ${leftParts}, so ${leftParts}/${den} is left.` : `1 out of ${den} parts was eaten, which is ${eaten}/${den}.`,
        ans,
        others: [`${eaten}/${den}`, `${leftParts}/${den}`, `${den}/${den}`, '1/3'].filter(v => v !== ans)
      });
    }

    // kind === 'compare'
    const bigger = coin();
    const ans = bigger ? '1/2' : '1/4';

    return this.buildMcq({
      idPrefix: 'y1_frac_cmp',
      metadata,
      qBm: `Antara 1/2 dan 1/4, pecahan manakah yang ${bigger ? 'LEBIH BESAR' : 'LEBIH KECIL'}?`,
      qEn: `Between 1/2 and 1/4, which fraction is ${bigger ? 'BIGGER' : 'SMALLER'}?`,
      hintBm: 'Semakin banyak bahagian sesuatu benda dipotong, semakin kecil setiap bahagian.',
      hintEn: 'The more parts something is cut into, the smaller each part becomes.',
      expBm: `Separuh (1/2) lebih besar daripada suku (1/4), kerana 2 bahagian lebih besar daripada 4 bahagian.`,
      expEn: `A half (1/2) is bigger than a quarter (1/4), because halves are bigger pieces than quarters.`,
      ans,
      others: ['1/2', '1/4'].filter(v => v !== ans)
    });
  }

  private static genY1MeasurementExtra(): Question {
    const metadata: CurriculumMetadata = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_1',
      learningArea: 'Sukatan dan Geometri',
      topicId: 'y1_measurement',
      topicName: { bm: '6.0 Ukuran: Panjang, Jisim & Isi Padu', en: '6.0 Measurement: Length, Mass & Volume' },
      standardContent: '6.1 - 6.3',
      standardLearning: '6.1.2',
      difficulty: 'easy'
    };

    const kind = pickOne(['nonstandard', 'heavier', 'capacity', 'sameMass'] as const);

    if (kind === 'nonstandard') {
      const unit = pickOne([
        { bm: 'klip kertas', en: 'paper clips' },
        { bm: 'batang mancis', en: 'matchsticks' },
        { bm: 'kiub', en: 'cubes' }
      ]);
      const a = randInt(4, 12);
      let b = randInt(4, 12);
      while (b === a) b = randInt(4, 12);
      const askLonger = coin();
      const ans = askLonger ? (a > b ? 'Pensel A' : 'Pensel B') : (a < b ? 'Pensel A' : 'Pensel B');

      return this.buildMcq({
        idPrefix: 'y1_ms_nonstd',
        metadata,
        qBm: `Pensel A sepanjang ${a} ${unit.bm}. Pensel B sepanjang ${b} ${unit.bm}. Pensel manakah yang LEBIH ${askLonger ? 'PANJANG' : 'PENDEK'}?`,
        qEn: `Pencil A is ${a} ${unit.en} long. Pencil B is ${b} ${unit.en} long. Which pencil is ${askLonger ? 'LONGER' : 'SHORTER'}?`,
        hintBm: 'Semakin banyak unit yang digunakan, semakin panjang objek itu.',
        hintEn: 'The more units it takes, the longer the object is.',
        expBm: `${ans} menggunakan ${askLonger ? 'lebih' : 'kurang'} ${unit.bm}, jadi ia lebih ${askLonger ? 'panjang' : 'pendek'}.`,
        expEn: `${ans === 'Pensel A' ? 'Pencil A' : 'Pencil B'} uses ${askLonger ? 'more' : 'fewer'} ${unit.en}, so it is ${askLonger ? 'longer' : 'shorter'}.`,
        ans,
        others: ['Pensel A', 'Pensel B'].filter(v => v !== ans)
      });
    }

    if (kind === 'heavier') {
      const pairs = [
        { heavy: { bm: 'Sebiji tembikai', en: 'A watermelon' }, light: { bm: 'Sebiji telur', en: 'An egg' } },
        { heavy: { bm: 'Sebuah beg sekolah penuh', en: 'A full school bag' }, light: { bm: 'Sebatang pensel', en: 'A pencil' } },
        { heavy: { bm: 'Sebuah basikal', en: 'A bicycle' }, light: { bm: 'Sehelai kertas', en: 'A sheet of paper' } },
        { heavy: { bm: 'Sebotol air 1 liter', en: 'A 1 litre bottle of water' }, light: { bm: 'Sebiji belon', en: 'A balloon' } }
      ];
      const pair = pickOne(pairs);
      const askHeavy = coin();
      const ans = askHeavy ? pair.heavy.bm : pair.light.bm;

      return this.buildMcq({
        idPrefix: 'y1_ms_mass',
        metadata,
        qBm: `Antara "${pair.heavy.bm}" dan "${pair.light.bm}", yang manakah LEBIH ${askHeavy ? 'BERAT' : 'RINGAN'}?`,
        qEn: `Between "${pair.heavy.en}" and "${pair.light.en}", which one is ${askHeavy ? 'HEAVIER' : 'LIGHTER'}?`,
        hintBm: 'Bayangkan mengangkat kedua-duanya dengan tangan anda.',
        hintEn: 'Imagine lifting each one with your hands.',
        expBm: `${pair.heavy.bm} lebih berat daripada ${pair.light.bm.toLowerCase()}.`,
        expEn: `${pair.heavy.en} is heavier than ${pair.light.en.toLowerCase()}.`,
        ans,
        others: [pair.heavy.bm, pair.light.bm].filter(v => v !== ans)
      });
    }

    if (kind === 'capacity') {
      const containers = [
        { bm: 'Sebuah baldi', en: 'A bucket', big: true },
        { bm: 'Sebuah cawan', en: 'A cup', big: false },
        { bm: 'Sebuah kolam', en: 'A pool', big: true },
        { bm: 'Sebuah sudu', en: 'A spoon', big: false }
      ];
      const big = pickOne(containers.filter(c => c.big));
      const small = pickOne(containers.filter(c => !c.big));
      const askMore = coin();
      const ans = askMore ? big.bm : small.bm;

      return this.buildMcq({
        idPrefix: 'y1_ms_cap',
        metadata,
        qBm: `Antara "${big.bm}" dan "${small.bm}", yang manakah boleh memuatkan air LEBIH ${askMore ? 'BANYAK' : 'SEDIKIT'}?`,
        qEn: `Between "${big.en}" and "${small.en}", which one holds ${askMore ? 'MORE' : 'LESS'} water?`,
        hintBm: 'Bekas yang lebih besar boleh memuatkan lebih banyak air.',
        hintEn: 'A bigger container holds more water.',
        expBm: `${big.bm} memuatkan lebih banyak air daripada ${small.bm.toLowerCase()}.`,
        expEn: `${big.en} holds more water than ${small.en.toLowerCase()}.`,
        ans,
        others: [big.bm, small.bm].filter(v => v !== ans)
      });
    }

    // kind === 'sameMass' — a classic misconception check
    const kg = randInt(1, 3);
    return this.buildMcq({
      idPrefix: 'y1_ms_same',
      metadata,
      qBm: `Sebuah beg mengandungi ${kg} kg beras. Sebuah lagi beg mengandungi ${kg} kg kapas. Beg manakah lebih berat?`,
      qEn: `One bag holds ${kg} kg of rice. Another bag holds ${kg} kg of cotton. Which bag is heavier?`,
      hintBm: 'Lihat nombor kilogramnya, bukan saiz begnya.',
      hintEn: 'Look at the number of kilograms, not the size of the bag.',
      expBm: `Kedua-duanya ${kg} kg, jadi jisimnya sama berat walaupun saiz begnya berbeza.`,
      expEn: `Both are ${kg} kg, so they have the same mass even though the bags look different.`,
      ans: 'Sama berat (Same mass)',
      others: ['Beg beras (Rice bag)', 'Beg kapas (Cotton bag)']
    });
  }

  private static genY1ShapesExtra(): Question {
    const metadata: CurriculumMetadata = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_1',
      learningArea: 'Sukatan dan Geometri',
      topicId: 'y1_shapes',
      topicName: { bm: '7.0 Ruang: Bentuk 2D & 3D', en: '7.0 Space: 2D & 3D Shapes' },
      standardContent: '7.1 - 7.2',
      standardLearning: '7.1.2',
      difficulty: 'easy'
    };

    const kind = pickOne(['sides', 'corners', 'roll', 'everyday', 'faces'] as const);

    const flat = [
      { bm: 'segi tiga', en: 'triangle', sides: 3 },
      { bm: 'segi empat sama', en: 'square', sides: 4 },
      { bm: 'segi empat tepat', en: 'rectangle', sides: 4 },
      { bm: 'pentagon', en: 'pentagon', sides: 5 },
      { bm: 'heksagon', en: 'hexagon', sides: 6 }
    ];

    if (kind === 'sides' || kind === 'corners') {
      const pick = pickOne(flat);
      const askSides = kind === 'sides';

      return this.buildMcq({
        idPrefix: 'y1_shape_count',
        metadata,
        qBm: `Berapakah bilangan ${askSides ? 'SISI' : 'BUCU'} bagi sebuah ${pick.bm}?`,
        qEn: `How many ${askSides ? 'SIDES' : 'CORNERS'} does a ${pick.en} have?`,
        hintBm: 'Bagi bentuk rata, bilangan sisi sentiasa sama dengan bilangan bucu.',
        hintEn: 'For a flat shape, the number of sides always equals the number of corners.',
        expBm: `Sebuah ${pick.bm} mempunyai ${pick.sides} sisi dan ${pick.sides} bucu.`,
        expEn: `A ${pick.en} has ${pick.sides} sides and ${pick.sides} corners.`,
        ans: pick.sides,
        others: [pick.sides + 1, pick.sides - 1, pick.sides + 2, 3, 4, 8].filter(v => v > 0 && v !== pick.sides)
      });
    }

    if (kind === 'roll') {
      const canRoll = coin();
      const rollers = ['Sfera (Sphere)', 'Silinder (Cylinder)'];
      const statics = ['Kubus (Cube)', 'Piramid (Pyramid)'];
      const ans = canRoll ? pickOne(rollers) : pickOne(statics);

      return this.buildMcq({
        idPrefix: 'y1_shape_roll',
        metadata,
        qBm: `Bentuk 3D manakah yang ${canRoll ? 'BOLEH' : 'TIDAK BOLEH'} menggolek?`,
        qEn: `Which 3D shape ${canRoll ? 'CAN' : 'CANNOT'} roll?`,
        hintBm: 'Bentuk yang mempunyai permukaan melengkung boleh menggolek.',
        hintEn: 'A shape with a curved surface can roll.',
        expBm: canRoll
          ? `${ans} ada permukaan melengkung, jadi ia boleh menggolek.`
          : `${ans} ada permukaan rata sahaja, jadi ia tidak boleh menggolek.`,
        expEn: canRoll
          ? `${ans} has a curved surface, so it can roll.`
          : `${ans} has only flat faces, so it cannot roll.`,
        ans,
        others: canRoll ? statics.concat(rollers.filter(r => r !== ans)) : rollers.concat(statics.filter(s => s !== ans))
      });
    }

    if (kind === 'everyday') {
      const objects = [
        { bm: 'bola sepak ⚽', en: 'football ⚽', shape: 'Sfera (Sphere)' },
        { bm: 'tin susu 🥫', en: 'tin of milk 🥫', shape: 'Silinder (Cylinder)' },
        { bm: 'kon aiskrim 🍦', en: 'ice cream cone 🍦', shape: 'Kon (Cone)' },
        { bm: 'kotak hadiah 🎁', en: 'gift box 🎁', shape: 'Kubus (Cube)' },
        { bm: 'dadu 🎲', en: 'dice 🎲', shape: 'Kubus (Cube)' }
      ];
      const pick = pickOne(objects);

      return this.buildMcq({
        idPrefix: 'y1_shape_obj',
        metadata,
        qBm: `Sebuah ${pick.bm} berbentuk seperti bentuk 3D yang manakah?`,
        qEn: `A ${pick.en} is shaped like which 3D shape?`,
        hintBm: 'Bayangkan bentuk keseluruhan objek itu.',
        hintEn: 'Picture the overall shape of the object.',
        expBm: `${pick.bm} berbentuk ${pick.shape}.`,
        expEn: `A ${pick.en} has the shape of a ${pick.shape}.`,
        ans: pick.shape,
        others: ['Sfera (Sphere)', 'Silinder (Cylinder)', 'Kon (Cone)', 'Kubus (Cube)', 'Piramid (Pyramid)'].filter(s => s !== pick.shape)
      });
    }

    // kind === 'faces'
    const solids = [
      { bm: 'kubus', en: 'cube', faces: 6 },
      { bm: 'kuboid', en: 'cuboid', faces: 6 },
      { bm: 'silinder', en: 'cylinder', faces: 3 },
      { bm: 'kon', en: 'cone', faces: 2 }
    ];
    const solid = pickOne(solids);

    return this.buildMcq({
      idPrefix: 'y1_shape_face',
      metadata,
      qBm: `Berapakah bilangan permukaan bagi sebuah ${solid.bm}?`,
      qEn: `How many faces does a ${solid.en} have?`,
      hintBm: 'Kira setiap permukaan yang boleh disentuh, termasuk permukaan melengkung.',
      hintEn: 'Count every surface you could touch, including curved ones.',
      expBm: `Sebuah ${solid.bm} mempunyai ${solid.faces} permukaan.`,
      expEn: `A ${solid.en} has ${solid.faces} faces.`,
      ans: solid.faces,
      others: [solid.faces + 1, solid.faces - 1, solid.faces + 2, 4, 8].filter(v => v > 0 && v !== solid.faces)
    });
  }

  private static genY2FractionsDecimalsExtra(): Question {
    const metadata: CurriculumMetadata = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_2',
      learningArea: 'Nombor dan Operasi',
      topicId: 'y2_fractions_decimals',
      topicName: { bm: '3.0 Pecahan Wajar & Perpuluhan', en: '3.0 Proper Fractions & Decimals' },
      standardContent: '3.1 - 3.4',
      standardLearning: '3.3.1',
      difficulty: 'easy'
    };

    const kind = pickOne(['addSame', 'subSame', 'compare', 'halfQuarter', 'proper'] as const);

    if (kind === 'addSame' || kind === 'subSame') {
      const isAdd = kind === 'addSame';
      const den = pickOne([5, 8, 10]);
      const a = randInt(1, den - 2);
      const b = randInt(1, den - 1 - a);
      const big = a + b;
      const ansNum = isAdd ? big : a;

      return this.buildMcq({
        idPrefix: 'y2_frac_op',
        metadata,
        qBm: isAdd
          ? `Kira: ${a}/${den} + ${b}/${den} = ?`
          : `Kira: ${big}/${den} - ${b}/${den} = ?`,
        qEn: isAdd
          ? `Work out: ${a}/${den} + ${b}/${den} = ?`
          : `Work out: ${big}/${den} - ${b}/${den} = ?`,
        hintBm: 'Bila penyebut sama, tambah atau tolak pengangka sahaja. Penyebut kekal.',
        hintEn: 'When the denominators match, add or subtract only the top numbers. The bottom stays the same.',
        expBm: isAdd
          ? `${a} + ${b} = ${big}, jadi jawapannya ${big}/${den}.`
          : `${big} - ${b} = ${a}, jadi jawapannya ${a}/${den}.`,
        expEn: isAdd
          ? `${a} + ${b} = ${big}, so the answer is ${big}/${den}.`
          : `${big} - ${b} = ${a}, so the answer is ${a}/${den}.`,
        ans: `${ansNum}/${den}`,
        others: [`${ansNum}/${den * 2}`, `${ansNum + 1}/${den}`, `${ansNum - 1}/${den}`, `${a}/${b}`].filter(v => v !== `${ansNum}/${den}`)
      });
    }

    if (kind === 'compare') {
      const den = pickOne([5, 8, 10]);
      const a = randInt(1, den - 1);
      let b = randInt(1, den - 1);
      while (b === a) b = randInt(1, den - 1);
      const askBigger = coin();
      const ansNum = askBigger ? Math.max(a, b) : Math.min(a, b);

      return this.buildMcq({
        idPrefix: 'y2_frac_cmp',
        metadata,
        qBm: `Antara ${a}/${den} dan ${b}/${den}, pecahan manakah yang LEBIH ${askBigger ? 'BESAR' : 'KECIL'}?`,
        qEn: `Between ${a}/${den} and ${b}/${den}, which fraction is ${askBigger ? 'BIGGER' : 'SMALLER'}?`,
        hintBm: 'Bila penyebut sama, bandingkan pengangka sahaja.',
        hintEn: 'When the denominators are the same, just compare the top numbers.',
        expBm: `Penyebutnya sama, dan ${ansNum} ialah pengangka yang lebih ${askBigger ? 'besar' : 'kecil'}.`,
        expEn: `The denominators match, and ${ansNum} is the ${askBigger ? 'bigger' : 'smaller'} numerator.`,
        ans: `${ansNum}/${den}`,
        others: [`${a}/${den}`, `${b}/${den}`].filter(v => v !== `${ansNum}/${den}`)
      });
    }

    if (kind === 'halfQuarter') {
      const pairs = [
        { frac: '1/2', dec: '0.5' },
        { frac: '1/4', dec: '0.25' },
        { frac: '3/4', dec: '0.75' },
        { frac: '1/5', dec: '0.2' },
        { frac: '1/10', dec: '0.1' }
      ];
      const pick = pickOne(pairs);
      const toDec = coin();

      return this.buildMcq({
        idPrefix: 'y2_frac_key',
        metadata,
        qBm: toDec ? `Tukarkan ${pick.frac} kepada nombor perpuluhan:` : `Tukarkan ${pick.dec} kepada pecahan:`,
        qEn: toDec ? `Convert ${pick.frac} to a decimal:` : `Convert ${pick.dec} to a fraction:`,
        hintBm: 'Ingat pecahan penting: 1/2 = 0.5, 1/4 = 0.25, 1/10 = 0.1.',
        hintEn: 'Remember the key fractions: 1/2 = 0.5, 1/4 = 0.25, 1/10 = 0.1.',
        expBm: `${pick.frac} bersamaan dengan ${pick.dec}.`,
        expEn: `${pick.frac} is equal to ${pick.dec}.`,
        ans: toDec ? pick.dec : pick.frac,
        others: toDec
          ? pairs.filter(p => p.dec !== pick.dec).map(p => p.dec)
          : pairs.filter(p => p.frac !== pick.frac).map(p => p.frac)
      });
    }

    // kind === 'proper'
    const den = pickOne([4, 5, 8, 10]);
    const num = randInt(1, den - 1);

    return this.buildMcq({
      idPrefix: 'y2_frac_proper',
      metadata,
      qBm: 'Antara pecahan berikut, yang manakah PECAHAN WAJAR?',
      qEn: 'Which of the following is a PROPER FRACTION?',
      hintBm: 'Pecahan wajar mempunyai pengangka yang lebih kecil daripada penyebut.',
      hintEn: 'A proper fraction has a numerator smaller than its denominator.',
      expBm: `${num}/${den} ialah pecahan wajar kerana ${num} lebih kecil daripada ${den}.`,
      expEn: `${num}/${den} is proper because ${num} is smaller than ${den}.`,
      ans: `${num}/${den}`,
      others: [`${den}/${num}`, `${den}/${den}`, `${den + 2}/${den}`, `${den + 1}/${num}`]
    });
  }

  private static genY2TimeMeasurementExtra(): Question {
    const metadata: CurriculumMetadata = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_2',
      learningArea: 'Sukatan dan Geometri',
      topicId: 'y2_time_measurement',
      topicName: { bm: '5.0 Masa & 6.0 Ukuran (m, cm, kg, g, l, ml)', en: '5.0 Time & 6.0 Measurement' },
      standardContent: '5.1, 6.1',
      standardLearning: '6.2.1',
      difficulty: 'medium'
    };

    const kind = pickOne(['convert', 'duration', 'compare', 'halfPast'] as const);

    if (kind === 'convert') {
      const rules = [
        { fromBm: 'meter', fromEn: 'metres', toBm: 'sentimeter', toEn: 'centimetres', factor: 100 },
        { fromBm: 'kilogram', fromEn: 'kilograms', toBm: 'gram', toEn: 'grams', factor: 1000 },
        { fromBm: 'liter', fromEn: 'litres', toBm: 'mililiter', toEn: 'millilitres', factor: 1000 },
        { fromBm: 'jam', fromEn: 'hours', toBm: 'minit', toEn: 'minutes', factor: 60 },
        { fromBm: 'minit', fromEn: 'minutes', toBm: 'saat', toEn: 'seconds', factor: 60 }
      ];
      const rule = pickOne(rules);
      const qty = randInt(2, 9);
      const ans = qty * rule.factor;

      return this.buildMcq({
        idPrefix: 'y2_conv',
        metadata,
        qBm: `${qty} ${rule.fromBm} bersamaan dengan berapa ${rule.toBm}?`,
        qEn: `${qty} ${rule.fromEn} is equal to how many ${rule.toEn}?`,
        hintBm: `1 ${rule.fromBm} = ${rule.factor} ${rule.toBm}. Maka darabkan dengan ${rule.factor}.`,
        hintEn: `1 ${rule.fromEn.replace(/s$/, '')} = ${rule.factor} ${rule.toEn}. So multiply by ${rule.factor}.`,
        expBm: `${qty} × ${rule.factor} = ${ans} ${rule.toBm}.`,
        expEn: `${qty} × ${rule.factor} = ${ans} ${rule.toEn}.`,
        ans,
        others: [ans + rule.factor, ans - rule.factor, qty + rule.factor, ans * 10].filter(v => v > 0 && v !== ans)
      });
    }

    if (kind === 'duration') {
      // Keep both times inside the morning so "pagi" / "a.m." stays correct
      const startHour = randInt(7, 9);
      const hours = randInt(1, 11 - startHour);
      const endHour = startHour + hours;

      return this.buildMcq({
        idPrefix: 'y2_dur',
        metadata,
        qBm: `Kelas bermula pada pukul ${startHour}:00 pagi dan tamat pada pukul ${endHour}:00 pagi. Berapa jamkah tempoh kelas itu?`,
        qEn: `A class starts at ${startHour}:00 a.m. and ends at ${endHour}:00 a.m. How many hours long is the class?`,
        hintBm: 'Tolak waktu mula daripada waktu tamat.',
        hintEn: 'Subtract the start time from the end time.',
        expBm: `${endHour} - ${startHour} = ${hours} jam.`,
        expEn: `${endHour} - ${startHour} = ${hours} hours.`,
        ans: hours,
        others: [hours + 1, hours - 1, hours + 2, endHour].filter(v => v > 0 && v !== hours)
      });
    }

    if (kind === 'compare') {
      const sets = [
        { aBm: '2 m', aEn: '2 m', bBm: '150 cm', bEn: '150 cm', biggerBm: '2 m' },
        { aBm: '1 kg', aEn: '1 kg', bBm: '800 g', bEn: '800 g', biggerBm: '1 kg' },
        { aBm: '2 l', aEn: '2 l', bBm: '1500 ml', bEn: '1500 ml', biggerBm: '2 l' },
        { aBm: '90 minit', aEn: '90 minutes', bBm: '1 jam', bEn: '1 hour', biggerBm: '90 minit' },
        { aBm: '250 cm', aEn: '250 cm', bBm: '2 m', bEn: '2 m', biggerBm: '250 cm' }
      ];
      const pick = pickOne(sets);
      const askBigger = coin();
      const smaller = pick.biggerBm === pick.aBm ? pick.bBm : pick.aBm;
      const ans = askBigger ? pick.biggerBm : smaller;

      return this.buildMcq({
        idPrefix: 'y2_cmp_unit',
        metadata,
        qBm: `Antara ${pick.aBm} dan ${pick.bBm}, yang manakah LEBIH ${askBigger ? 'BESAR' : 'KECIL'}?`,
        qEn: `Between ${pick.aEn} and ${pick.bEn}, which one is ${askBigger ? 'LARGER' : 'SMALLER'}?`,
        hintBm: 'Tukarkan kedua-duanya kepada unit yang sama dahulu sebelum membanding.',
        hintEn: 'Convert both to the same unit before comparing them.',
        expBm: `Selepas ditukar kepada unit yang sama, ${pick.biggerBm} adalah yang lebih besar.`,
        expEn: `Once both are in the same unit, ${pick.biggerBm} is the larger one.`,
        ans,
        others: [pick.aBm, pick.bBm].filter(v => v !== ans)
      });
    }

    // kind === 'halfPast'
    const hour = randInt(1, 11);
    const isHalf = coin();
    const ans = isHalf ? `${hour}:30` : `${hour}:00`;

    return this.buildMcq({
      idPrefix: 'y2_clock_read',
      metadata,
      qBm: isHalf
        ? `Jarum pendek berada antara ${hour} dan ${hour + 1}, jarum panjang menunjuk ke angka 6. Pukul berapakah ini?`
        : `Jarum pendek menunjuk tepat ke ${hour}, jarum panjang menunjuk ke angka 12. Pukul berapakah ini?`,
      qEn: isHalf
        ? `The short hand is between ${hour} and ${hour + 1}, and the long hand points to 6. What time is it?`
        : `The short hand points exactly at ${hour} and the long hand points to 12. What time is it?`,
      hintBm: 'Jarum panjang di angka 6 bermaksud 30 minit, di angka 12 bermaksud tepat.',
      hintEn: 'The long hand on 6 means 30 minutes past; on 12 it means exactly o\'clock.',
      expBm: `Waktu yang ditunjukkan ialah ${ans}.`,
      expEn: `The time shown is ${ans}.`,
      ans,
      others: [`${hour}:${isHalf ? '00' : '30'}`, `${hour + 1}:30`, `${hour + 1}:00`, `6:${hour < 10 ? '0' : ''}${hour}`].filter(v => v !== ans)
    });
  }

  private static genY3FractionsPercentExtra(): Question {
    const metadata: CurriculumMetadata = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_3',
      learningArea: 'Nombor dan Operasi',
      topicId: 'y3_fractions_percent',
      topicName: { bm: '3.0 Pecahan, Perpuluhan & Peratus', en: '3.0 Fractions, Decimals & Percent' },
      standardContent: '3.1 - 3.4',
      standardLearning: '3.3.2',
      difficulty: 'medium'
    };

    const kind = pickOne(['ofQuantity', 'decPercent', 'equivalent', 'fracDec'] as const);

    if (kind === 'ofQuantity') {
      const pct = pickOne([10, 20, 25, 50, 75]);
      const base = pickOne([20, 40, 60, 80, 100, 200]);
      const ans = (base * pct) / 100;

      return {
        id: `y3_pct_of_${Date.now()}`,
        metadata,
        type: 'numeric_keypad',
        prompt: { bm: `Kira ${pct}% daripada ${base}:`, en: `Calculate ${pct}% of ${base}:` },
        voicePrompt: { bm: `${pct} peratus daripada ${base}.`, en: `${pct} percent of ${base}.` },
        hint: { bm: `${pct}% bermaksud ${pct} bahagian daripada 100. Darabkan ${base} dengan ${pct}, kemudian bahagi 100.`, en: `${pct}% means ${pct} out of 100. Multiply ${base} by ${pct}, then divide by 100.` },
        explanation: { bm: `(${pct} ÷ 100) × ${base} = ${ans}`, en: `(${pct} ÷ 100) × ${base} = ${ans}` },
        answer: ans,
        options: generateDistractors(ans, 3, 1, base + 20)
      };
    }

    if (kind === 'decPercent') {
      const pairs = [
        { dec: '0.1', pct: '10%' },
        { dec: '0.2', pct: '20%' },
        { dec: '0.25', pct: '25%' },
        { dec: '0.5', pct: '50%' },
        { dec: '0.75', pct: '75%' },
        { dec: '0.9', pct: '90%' }
      ];
      const pick = pickOne(pairs);
      const toPct = coin();

      return this.buildMcq({
        idPrefix: 'y3_dec_pct',
        metadata,
        qBm: toPct ? `Nyatakan ${pick.dec} dalam bentuk peratus:` : `Nyatakan ${pick.pct} dalam bentuk perpuluhan:`,
        qEn: toPct ? `Express ${pick.dec} as a percentage:` : `Express ${pick.pct} as a decimal:`,
        hintBm: 'Perpuluhan ke peratus: darab 100. Peratus ke perpuluhan: bahagi 100.',
        hintEn: 'Decimal to percent: multiply by 100. Percent to decimal: divide by 100.',
        expBm: `${pick.dec} bersamaan dengan ${pick.pct}.`,
        expEn: `${pick.dec} is equal to ${pick.pct}.`,
        ans: toPct ? pick.pct : pick.dec,
        others: toPct
          ? pairs.filter(p => p.pct !== pick.pct).map(p => p.pct)
          : pairs.filter(p => p.dec !== pick.dec).map(p => p.dec)
      });
    }

    if (kind === 'equivalent') {
      const families = [
        { simple: '1/2', same: ['2/4', '3/6', '5/10'] },
        { simple: '1/3', same: ['2/6', '3/9', '4/12'] },
        { simple: '1/4', same: ['2/8', '3/12', '5/20'] },
        { simple: '2/3', same: ['4/6', '6/9', '8/12'] },
        { simple: '3/4', same: ['6/8', '9/12', '15/20'] }
      ];
      const fam = pickOne(families);
      const shown = pickOne(fam.same);
      const others = families.filter(f => f.simple !== fam.simple).map(f => f.simple);

      return this.buildMcq({
        idPrefix: 'y3_equiv',
        metadata,
        qBm: `Permudahkan pecahan ${shown} kepada bentuk termudah:`,
        qEn: `Simplify the fraction ${shown} to its simplest form:`,
        hintBm: 'Bahagikan pengangka dan penyebut dengan nombor yang sama.',
        hintEn: 'Divide both the numerator and the denominator by the same number.',
        expBm: `${shown} dipermudahkan menjadi ${fam.simple}.`,
        expEn: `${shown} simplifies to ${fam.simple}.`,
        ans: fam.simple,
        others
      });
    }

    // kind === 'fracDec'
    const pairs = [
      { frac: '1/2', dec: '0.5' },
      { frac: '1/4', dec: '0.25' },
      { frac: '3/4', dec: '0.75' },
      { frac: '1/5', dec: '0.2' },
      { frac: '2/5', dec: '0.4' },
      { frac: '1/10', dec: '0.1' },
      { frac: '3/10', dec: '0.3' }
    ];
    const pick = pickOne(pairs);

    return this.buildMcq({
      idPrefix: 'y3_frac_dec',
      metadata,
      qBm: `Tukarkan pecahan ${pick.frac} kepada nombor perpuluhan:`,
      qEn: `Convert the fraction ${pick.frac} into a decimal:`,
      hintBm: 'Bahagikan pengangka dengan penyebut.',
      hintEn: 'Divide the numerator by the denominator.',
      expBm: `${pick.frac} = ${pick.dec}.`,
      expEn: `${pick.frac} = ${pick.dec}.`,
      ans: pick.dec,
      others: pairs.filter(p => p.dec !== pick.dec).map(p => p.dec)
    });
  }

  private static genY3TimeCalendarExtra(): Question {
    const metadata: CurriculumMetadata = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_3',
      learningArea: 'Sukatan dan Geometri',
      topicId: 'y3_time_calendar',
      topicName: { bm: '5.0 Masa, Waktu & Kalendar', en: '5.0 Time & Calendar' },
      standardContent: '5.1 - 5.8',
      standardLearning: '5.3.1',
      difficulty: 'medium'
    };

    const kind = pickOne(['convert', 'duration', 'dayAhead', 'monthOrder', 'leap'] as const);

    if (kind === 'convert') {
      const rules = [
        { bm: 'jam', en: 'hours', toBm: 'minit', toEn: 'minutes', factor: 60 },
        { bm: 'minit', en: 'minutes', toBm: 'saat', toEn: 'seconds', factor: 60 },
        { bm: 'hari', en: 'days', toBm: 'jam', toEn: 'hours', factor: 24 },
        { bm: 'minggu', en: 'weeks', toBm: 'hari', toEn: 'days', factor: 7 },
        { bm: 'tahun', en: 'years', toBm: 'bulan', toEn: 'months', factor: 12 }
      ];
      const rule = pickOne(rules);
      const qty = randInt(2, 9);
      const ans = qty * rule.factor;

      return this.buildMcq({
        idPrefix: 'y3_time_conv',
        metadata,
        qBm: `${qty} ${rule.bm} bersamaan dengan berapa ${rule.toBm}?`,
        qEn: `${qty} ${rule.en} is equal to how many ${rule.toEn}?`,
        hintBm: `1 ${rule.bm} = ${rule.factor} ${rule.toBm}.`,
        hintEn: `1 ${rule.en.replace(/s$/, '')} = ${rule.factor} ${rule.toEn}.`,
        expBm: `${qty} × ${rule.factor} = ${ans} ${rule.toBm}.`,
        expEn: `${qty} × ${rule.factor} = ${ans} ${rule.toEn}.`,
        ans,
        others: [ans + rule.factor, ans - rule.factor, qty + rule.factor, ans + 10].filter(v => v > 0 && v !== ans)
      });
    }

    if (kind === 'duration') {
      const startHour = randInt(1, 9);
      const startMin = pickOne([0, 15, 30, 45]);
      const addMin = pickOne([30, 45, 60, 75, 90]);
      const totalStart = startHour * 60 + startMin;
      const totalEnd = totalStart + addMin;
      const endHour = Math.floor(totalEnd / 60);
      const endMin = totalEnd % 60;
      const fmtT = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`;

      return this.buildMcq({
        idPrefix: 'y3_time_dur',
        metadata,
        qBm: `Sebuah perlawanan bermula pada ${fmtT(startHour, startMin)} petang dan tamat pada ${fmtT(endHour, endMin)} petang. Berapa minitkah tempohnya?`,
        qEn: `A match starts at ${fmtT(startHour, startMin)} p.m. and ends at ${fmtT(endHour, endMin)} p.m. How many minutes long is it?`,
        hintBm: 'Tukarkan kedua-dua waktu kepada minit, kemudian tolak.',
        hintEn: 'Convert both times into minutes, then subtract.',
        expBm: `Dari ${fmtT(startHour, startMin)} ke ${fmtT(endHour, endMin)} ialah ${addMin} minit.`,
        expEn: `From ${fmtT(startHour, startMin)} to ${fmtT(endHour, endMin)} is ${addMin} minutes.`,
        ans: addMin,
        others: [addMin + 15, addMin - 15, addMin + 30, addMin - 30].filter(v => v > 0 && v !== addMin)
      });
    }

    if (kind === 'dayAhead') {
      const daysBm = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'];
      const daysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const i = randInt(0, 6);
      const ahead = randInt(2, 5);
      const j = (i + ahead) % 7;

      return this.buildMcq({
        idPrefix: 'y3_day_ahead',
        metadata,
        qBm: `Hari ini hari ${daysBm[i]}. Apakah hari ${ahead} hari lagi?`,
        qEn: `Today is ${daysEn[i]}. What day will it be in ${ahead} days?`,
        hintBm: 'Kira ke hadapan hari demi hari, dan mula semula selepas Ahad.',
        hintEn: 'Count forward day by day, wrapping back to Monday after Sunday.',
        expBm: `${ahead} hari selepas ${daysBm[i]} ialah hari ${daysBm[j]}.`,
        expEn: `${ahead} days after ${daysEn[i]} is ${daysEn[j]}.`,
        ans: daysBm[j],
        others: daysBm.filter(d => d !== daysBm[j])
      });
    }

    if (kind === 'monthOrder') {
      const monthsBm = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
      const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const i = randInt(0, 11);
      const after = coin();
      const j = after ? (i + 1) % 12 : (i + 11) % 12;

      return this.buildMcq({
        idPrefix: 'y3_month',
        metadata,
        qBm: `Apakah bulan ${after ? 'SELEPAS' : 'SEBELUM'} bulan ${monthsBm[i]}?`,
        qEn: `Which month comes ${after ? 'AFTER' : 'BEFORE'} ${monthsEn[i]}?`,
        hintBm: 'Ingat urutan 12 bulan dalam kalendar.',
        hintEn: 'Recall the order of the 12 months on a calendar.',
        expBm: `Bulan ${after ? 'selepas' : 'sebelum'} ${monthsBm[i]} ialah ${monthsBm[j]}.`,
        expEn: `The month ${after ? 'after' : 'before'} ${monthsEn[i]} is ${monthsEn[j]}.`,
        ans: monthsBm[j],
        others: monthsBm.filter(m => m !== monthsBm[j])
      });
    }

    // kind === 'leap'
    const leapYears = [2016, 2020, 2024, 2028, 2032];
    const commonYears = [2017, 2018, 2019, 2021, 2022, 2023, 2025, 2026];
    const askLeap = coin();
    const ans = askLeap ? pickOne(leapYears) : pickOne(commonYears);

    return this.buildMcq({
      idPrefix: 'y3_leap',
      metadata,
      qBm: `Antara tahun berikut, yang manakah ${askLeap ? 'TAHUN LOMPAT' : 'BUKAN tahun lompat'}?`,
      qEn: `Which of the following years ${askLeap ? 'IS a leap year' : 'is NOT a leap year'}?`,
      hintBm: 'Tahun lompat boleh dibahagi tepat dengan 4 dan mempunyai 366 hari.',
      hintEn: 'A leap year divides exactly by 4 and has 366 days.',
      expBm: askLeap
        ? `${ans} boleh dibahagi tepat dengan 4, jadi ia tahun lompat (366 hari).`
        : `${ans} tidak boleh dibahagi tepat dengan 4, jadi ia tahun biasa (365 hari).`,
      expEn: askLeap
        ? `${ans} divides exactly by 4, so it is a leap year (366 days).`
        : `${ans} does not divide exactly by 4, so it is a common year (365 days).`,
      ans,
      others: askLeap ? shuffle(commonYears).slice(0, 4) : shuffle(leapYears).slice(0, 4)
    });
  }

  private static genY6ProbabilityDataExtra(): Question {
    const metadata: CurriculumMetadata = {
      curriculumVersion: 'KSSR_SEMAKAN_2017',
      level: 'year_6',
      learningArea: 'Statistik dan Kebolehjadian',
      topicId: 'y6_probability_data',
      topicName: { bm: '7.0 Kebolehjadian & Tafsir Data', en: '7.0 Probability & Data Interpretation' },
      standardContent: '7.1 - 8.1',
      standardLearning: '7.1.2',
      difficulty: 'medium'
    };

    const kind = pickOne(['bag', 'die', 'spinner', 'tableTotal', 'tableMean', 'tableDiff'] as const);

    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const simplify = (n: number, d: number) => {
      const g = gcd(n, d);
      return `${n / g}/${d / g}`;
    };

    if (kind === 'bag') {
      const red = randInt(2, 6);
      const blue = randInt(2, 6);
      const green = randInt(1, 4);
      const total = red + blue + green;
      const target = pickOne([
        { bm: 'merah', en: 'red', count: red },
        { bm: 'biru', en: 'blue', count: blue },
        { bm: 'hijau', en: 'green', count: green }
      ]);
      const ans = simplify(target.count, total);

      return this.buildMcq({
        idPrefix: 'y6_prob_bag',
        metadata,
        qBm: `Sebuah beg mengandungi ${red} guli merah, ${blue} guli biru dan ${green} guli hijau. Sebiji guli diambil secara rawak. Apakah kebolehjadian mendapat guli ${target.bm}?`,
        qEn: `A bag holds ${red} red marbles, ${blue} blue marbles and ${green} green marbles. One marble is drawn at random. What is the probability of getting a ${target.en} marble?`,
        voiceBm: `Kebolehjadian mendapat guli ${target.bm}.`,
        voiceEn: `The probability of drawing a ${target.en} marble.`,
        hintBm: 'Kebolehjadian = bilangan hasil yang dikehendaki ÷ jumlah semua hasil.',
        hintEn: 'Probability = the number of favourable outcomes ÷ the total number of outcomes.',
        expBm: `Ada ${target.count} guli ${target.bm} daripada ${total} guli, jadi kebolehjadiannya ${target.count}/${total} = ${ans}.`,
        expEn: `There are ${target.count} ${target.en} marbles out of ${total}, so the probability is ${target.count}/${total} = ${ans}.`,
        ans,
        others: [
          `${total}/${target.count}`,
          simplify(target.count, total + target.count),
          `${target.count}/${total + 1}`,
          `1/${total}`,
          `${target.count}/${total - 1}`
        ].filter(v => v !== ans)
      });
    }

    if (kind === 'die') {
      const cases = [
        { bm: 'nombor genap', en: 'an even number', count: 3 },
        { bm: 'nombor ganjil', en: 'an odd number', count: 3 },
        { bm: 'nombor lebih besar daripada 4', en: 'a number greater than 4', count: 2 },
        { bm: 'nombor 3', en: 'the number 3', count: 1 },
        { bm: 'nombor kurang daripada 5', en: 'a number less than 5', count: 4 }
      ];
      const pick = pickOne(cases);
      const ans = simplify(pick.count, 6);

      return this.buildMcq({
        idPrefix: 'y6_prob_die',
        metadata,
        qBm: `Sebiji dadu bernombor 1 hingga 6 dilambung. Apakah kebolehjadian mendapat ${pick.bm}?`,
        qEn: `A die numbered 1 to 6 is rolled. What is the probability of getting ${pick.en}?`,
        hintBm: 'Kira berapa banyak muka dadu yang memenuhi syarat itu, kemudian bahagikan dengan 6.',
        hintEn: 'Count how many faces satisfy the condition, then divide by 6.',
        expBm: `${pick.count} daripada 6 muka memenuhi syarat, jadi ${pick.count}/6 = ${ans}.`,
        expEn: `${pick.count} of the 6 faces satisfy it, so ${pick.count}/6 = ${ans}.`,
        ans,
        others: ['1/6', '1/2', '1/3', '2/3', '1/1', '5/6'].filter(v => v !== ans)
      });
    }

    if (kind === 'spinner') {
      const parts = pickOne([4, 5, 6, 8, 10]);
      const winning = randInt(1, parts - 1);
      const ans = simplify(winning, parts);

      return this.buildMcq({
        idPrefix: 'y6_prob_spin',
        metadata,
        qBm: `Sebuah roda berputar dibahagi kepada ${parts} sektor yang sama besar. ${winning} sektor berwarna kuning. Apakah kebolehjadian jarum berhenti pada sektor kuning?`,
        qEn: `A spinner is divided into ${parts} equal sectors. ${winning} of them are yellow. What is the probability that the pointer stops on yellow?`,
        hintBm: 'Sektor kuning ÷ jumlah sektor, kemudian permudahkan.',
        hintEn: 'Yellow sectors ÷ total sectors, then simplify.',
        expBm: `${winning} daripada ${parts} sektor berwarna kuning, jadi ${winning}/${parts} = ${ans}.`,
        expEn: `${winning} out of ${parts} sectors are yellow, so ${winning}/${parts} = ${ans}.`,
        ans,
        others: [
          `${parts}/${winning}`,
          `${winning}/${parts + 1}`,
          simplify(parts - winning, parts),
          `1/${parts}`
        ].filter(v => v !== ans)
      });
    }

    // Data-handling variants built on one small table
    const names = ['Isnin', 'Selasa', 'Rabu', 'Khamis'];
    const namesEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    const counts = kind === 'tableMean'
      ? (() => {
          const avg = randInt(6, 20);
          return shuffle([avg - 3, avg - 1, avg + 1, avg + 3]);
        })()
      : shuffle([randInt(5, 12), randInt(13, 20), randInt(21, 28), randInt(29, 36)]);
    const total = counts.reduce((s, v) => s + v, 0);
    const tally = names.map((d, i) => `${d} ${counts[i]}`).join(', ');
    const tallyEn = namesEn.map((d, i) => `${d} ${counts[i]}`).join(', ');

    if (kind === 'tableTotal') {
      return {
        id: `y6_data_total_${Date.now()}`,
        metadata,
        type: 'numeric_keypad',
        prompt: {
          bm: `Jadual menunjukkan bilangan buku yang dijual: ${tally}. Berapakah jumlah buku yang dijual?`,
          en: `A table shows the number of books sold: ${tallyEn}. How many books were sold in total?`
        },
        voicePrompt: { bm: 'Berapakah jumlah keseluruhan?', en: 'What is the grand total?' },
        hint: { bm: 'Tambahkan semua nilai dalam jadual.', en: 'Add up every value in the table.' },
        explanation: { bm: `${counts.join(' + ')} = ${total}`, en: `${counts.join(' + ')} = ${total}` },
        answer: total,
        options: generateDistractors(total, 3, 1, total + 30)
      };
    }

    if (kind === 'tableMean') {
      const mean = total / counts.length;
      return {
        id: `y6_data_mean_${Date.now()}`,
        metadata,
        type: 'numeric_keypad',
        prompt: {
          bm: `Jadual menunjukkan bilangan buku yang dijual: ${tally}. Berapakah purata buku yang dijual sehari?`,
          en: `A table shows the number of books sold: ${tallyEn}. What is the average number of books sold per day?`
        },
        voicePrompt: { bm: 'Berapakah puratanya?', en: 'What is the average?' },
        hint: { bm: 'Purata = jumlah semua nilai ÷ bilangan hari.', en: 'Average = the total of all values ÷ the number of days.' },
        explanation: { bm: `${total} ÷ ${counts.length} = ${mean}`, en: `${total} ÷ ${counts.length} = ${mean}` },
        answer: mean,
        options: generateDistractors(mean, 3, 1, total)
      };
    }

    // kind === 'tableDiff'
    const maxV = Math.max(...counts);
    const minV = Math.min(...counts);
    const diff = maxV - minV;

    return {
      id: `y6_data_diff_${Date.now()}`,
      metadata,
      type: 'numeric_keypad',
      prompt: {
        bm: `Jadual menunjukkan bilangan buku yang dijual: ${tally}. Berapakah beza antara jualan tertinggi dan jualan terendah?`,
        en: `A table shows the number of books sold: ${tallyEn}. What is the difference between the highest and the lowest sales?`
      },
      voicePrompt: { bm: 'Berapakah bezanya?', en: 'What is the difference?' },
      hint: { bm: 'Cari nilai tertinggi dan terendah, kemudian tolak.', en: 'Find the highest and lowest values, then subtract.' },
      explanation: { bm: `${maxV} - ${minV} = ${diff}`, en: `${maxV} - ${minV} = ${diff}` },
      answer: diff,
      options: generateDistractors(diff, 3, 1, total)
    };
  }
}
