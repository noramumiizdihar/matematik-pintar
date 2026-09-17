// Interactive Lesson Library (Sesi Belajar Interaktif Sebelum Latihan)
import { LevelId, TopicLesson, LessonStep } from '../types/curriculum';
import { getLevelById, getTopicById } from './kpmCurriculum';

export const CURATED_LESSONS: Record<string, TopicLesson> = {
  // --- Beginner: Numbers 0 to 10 ---
  beg_numbers_0_10: {
    topicId: 'beg_numbers_0_10',
    level: 'beginner',
    title: { bm: 'Mari Kenal Nombor 0 hingga 10', en: 'Meet Numbers 0 to 10' },
    summary: {
      bm: 'Nombor menunjukkan berapa banyak barang yang kita ada.',
      en: 'Numbers tell us how many items we have.'
    },
    icon: '🔢',
    steps: [
      {
        title: { bm: 'Apa Itu Nombor?', en: 'What is a Number?' },
        concept: {
          bm: 'Nombor adalah simbol ajaib untuk mengira barang di sekeliling kita!',
          en: 'Numbers are magical symbols used to count things all around us!'
        },
        voiceText: {
          bm: 'Hai kawan! Nombor digunakan untuk mengira berapa banyak benda yang ada.',
          en: 'Hello friend! Numbers are used to count how many things there are.'
        },
        illustrationEmoji: '🌟',
        visualItems: [{ emoji: '🍎', label: '1 epal' }, { emoji: '🍎🍎', label: '2 epal' }],
        tip: {
          bm: '0 (Sifar) bermaksud tiada apa-apa langsung.',
          en: '0 (Zero) means nothing at all.'
        }
      },
      {
        title: { bm: 'Membilang 1, 2, 3!', en: 'Counting 1, 2, 3!' },
        concept: {
          bm: 'Setiap kali kita tambah satu barang lagi, nombornya menjadi semakin besar.',
          en: 'Every time we add one more item, the number gets bigger.'
        },
        voiceText: {
          bm: 'Satu, dua, tiga! Mari kita kira bersama-sama dengan gembira.',
          en: 'One, two, three! Let us count happily together.'
        },
        illustrationEmoji: '🍎',
        visualItems: [
          { emoji: '🎈', label: 'Satu (1)' },
          { emoji: '🎈🎈', label: 'Dua (2)' },
          { emoji: '🎈🎈🎈', label: 'Tiga (3)' }
        ],
        tip: {
          bm: 'Gunakan jari tangan anda untuk membantu mengira!',
          en: 'Use your fingers to help you count!'
        }
      },
      {
        title: { bm: 'Hebat! Sekarang Anda Tahu Nombor', en: 'Great! Now You Know Numbers' },
        concept: {
          bm: 'Selepas nombor 3, ada 4, 5, 6, 7, 8, 9, dan 10!',
          en: 'After number 3, comes 4, 5, 6, 7, 8, 9, and 10!'
        },
        voiceText: {
          bm: 'Hebat sekali! Anda kini bersedia untuk bermain aktiviti mengenal nombor.',
          en: 'Awesome! You are now ready to play number recognition games.'
        },
        illustrationEmoji: '🎉',
        tip: {
          bm: 'Jom ketik butang di bawah untuk cuba latihan ceria!',
          en: 'Tap the button below to start fun practice!'
        }
      }
    ]
  },

  // --- Beginner: Counting objects ---
  beg_count_objects: {
    topicId: 'beg_count_objects',
    level: 'beginner',
    title: { bm: 'Cara Mengira Objek Ceria', en: 'How to Count Fun Objects' },
    summary: {
      bm: 'Ketik satu per satu sambil menyebut nombor secara berurutan.',
      en: 'Tap each item one by one while counting in order.'
    },
    icon: '🍎',
    steps: [
      {
        title: { bm: 'Petua 1: Sentuh Satu Demi Satu', en: 'Tip 1: Touch One by One' },
        concept: {
          bm: 'Jangan tergopoh-gapah. Sentuh satu barang, sebut "Satu". Sentuh barang seterusnya, sebut "Dua".',
          en: 'Take your time. Touch one item and say "One". Touch the next and say "Two".'
        },
        voiceText: {
          bm: 'Sentuh setiap objek satu demi satu dengan jari anda, dan sebut nombornya.',
          en: 'Touch each object one by one with your finger, and say the number.'
        },
        illustrationEmoji: '👆',
        visualItems: [{ emoji: '⭐', label: '1' }, { emoji: '⭐', label: '2' }, { emoji: '⭐', label: '3' }],
        tip: {
          bm: 'Setiap objek hanya dikira sekali sahaja.',
          en: 'Each item is counted only once.'
        }
      },
      {
        title: { bm: 'Petua 2: Nombor Terakhir Ialah Jumlahnya', en: 'Tip 2: Last Number is the Total' },
        concept: {
          bm: 'Nombor terakhir yang anda sebut ialah jumlah semua barang yang ada!',
          en: 'The last number you speak is the total count of items!'
        },
        voiceText: {
          bm: 'Nombor terakhir yang anda kira ialah jumlah kesemua barang itu.',
          en: 'The last number you count is the total amount.'
        },
        illustrationEmoji: '🎯',
        tip: {
          bm: 'Contoh: Jika anda berhenti di angka 5, ada 5 biji epal kesemuanya!',
          en: 'Example: If you stop at 5, there are 5 apples altogether!'
        }
      }
    ]
  },

  // --- Beginner: More or Less ---
  beg_more_less: {
    topicId: 'beg_more_less',
    level: 'beginner',
    title: { bm: 'Banyak atau Sedikit?', en: 'More or Less?' },
    summary: {
      bm: 'Membandingkan saiz kumpulan barang dengan mudah.',
      en: 'Easily comparing the size of two groups.'
    },
    icon: '⚖️',
    steps: [
      {
        title: { bm: 'Lebih Banyak', en: 'More' },
        concept: {
          bm: 'Kumpulan yang mempunyai timbunan lebih besar mempunyai LEBIH BANYAK barang.',
          en: 'The group with a larger pile has MORE items.'
        },
        voiceText: {
          bm: 'Kumpulan yang banyak mempunyai bilangan objek yang lebih tinggi.',
          en: 'A group with more items has a higher number of objects.'
        },
        illustrationEmoji: '🧺',
        visualItems: [{ emoji: '🍎🍎🍎🍎🍎', label: 'Banyak (5)' }, { emoji: '🍎🍎', label: 'Sedikit (2)' }]
      },
      {
        title: { bm: 'Lebih Sedikit', en: 'Less' },
        concept: {
          bm: 'Kumpulan yang ada sikit barang sahaja dipanggil LEBIH SEDIKIT.',
          en: 'A group with fewer items is called LESS.'
        },
        voiceText: {
          bm: 'Kumpulan yang sedikit mempunyai bilangan objek yang lebih rendah.',
          en: 'A group with less has a lower number of items.'
        },
        illustrationEmoji: '🤏'
      }
    ]
  },

  // --- Preschool: Addition within 10 ---
  pre_addition_10: {
    topicId: 'pre_addition_10',
    level: 'preschool',
    title: { bm: 'Konsep Tambah: Cantumkan Semuanya!', en: 'Addition Concept: Combine Together!' },
    summary: {
      bm: 'Bila dua kumpulan disatukan, jumlahnya menjadi lebih banyak.',
      en: 'When two groups come together, the total becomes greater.'
    },
    icon: '➕',
    steps: [
      {
        title: { bm: 'Apa Maksud "Tambah"?', en: 'What Does "Add" Mean?' },
        concept: {
          bm: 'Tambah bermaksud kita kumpulkan atau cantumkan dua benda bersama-sama.',
          en: 'Adding means bringing or putting two groups together.'
        },
        voiceText: {
          bm: 'Tambah bermaksud kita gabungkan barang bersama-sama. Jumlahnya menjadi lebih banyak.',
          en: 'Adding means combining items together. The total becomes larger.'
        },
        illustrationEmoji: '🤝',
        visualItems: [
          { emoji: '🍎🍎', label: '2 epal' },
          { emoji: '➕', label: 'tambah' },
          { emoji: '🍎', label: '1 epal' },
          { emoji: '🟰', label: 'jadi' },
          { emoji: '🍎🍎🍎', label: '3 epal' }
        ],
        exampleFormula: '2 + 1 = 3'
      },
      {
        title: { bm: 'Simbol Tambah (+) dan Sama Dengan (=)', en: 'The Plus (+) and Equals (=) Signs' },
        concept: {
          bm: 'Tanda palang (+) ialah simbol TAMBAH. Tanda dua garisan (=) bermaksud SAMA DENGAN jawapannya.',
          en: 'The cross (+) is the PLUS sign. The two bars (=) mean EQUALS the answer.'
        },
        voiceText: {
          bm: 'Tanda tambah mencantumkan barang, tanda sama dengan menunjukkan jawapan akhir.',
          en: 'The plus sign joins items, the equals sign shows the final answer.'
        },
        illustrationEmoji: '➕',
        exampleFormula: '3 + 2 = 5'
      }
    ]
  },

  // --- Preschool: Subtraction within 10 ---
  pre_subtraction_10: {
    topicId: 'pre_subtraction_10',
    level: 'preschool',
    title: { bm: 'Konsep Tolak: Asingkan atau Buang', en: 'Subtraction Concept: Take Away' },
    summary: {
      bm: 'Bila sesuatu barang dikeluarkan atau dimakan, bakinya berkurang.',
      en: 'When items are taken away or eaten, the remaining count decreases.'
    },
    icon: '➖',
    steps: [
      {
        title: { bm: 'Apa Maksud "Tolak"?', en: 'What Does "Minus" Mean?' },
        concept: {
          bm: 'Tolak bermaksud kita asingkan, beri kepada kawan, atau makan sebahagian barang.',
          en: 'Minus means taking away, giving away, or eating some items.'
        },
        voiceText: {
          bm: 'Tolak bermaksud kita kurangkan barang. Jumlah yang tinggal akan menjadi lebih sedikit.',
          en: 'Subtracting means taking away items. What is left becomes less.'
        },
        illustrationEmoji: '🐰',
        visualItems: [
          { emoji: '🥕🥕🥕🥕', label: 'Ada 4 lobak' },
          { emoji: '➖', label: 'Arnab makan 1' },
          { emoji: '🟰', label: 'Tinggal' },
          { emoji: '🥕🥕🥕', label: 'Baki 3 lobak' }
        ],
        exampleFormula: '4 - 1 = 3'
      }
    ]
  },

  // --- Foundation: Place Value (Sa & Puluh) ---
  fnd_place_value: {
    topicId: 'fnd_place_value',
    level: 'foundation',
    title: { bm: 'Nilai Tempat: Sa & Puluh', en: 'Place Value: Tens & Ones' },
    summary: {
      bm: 'Memahami kumpulan 10 (Puluh) dan baki unit (Sa).',
      en: 'Understanding groups of 10 (Tens) and single units (Ones).'
    },
    icon: '🏛️',
    steps: [
      {
        title: { bm: 'Kenapa Perlu Puluh dan Sa?', en: 'Why Tens and Ones?' },
        concept: {
          bm: 'Bila kita ada banyak barang, lebih mudah mengira dalam kumpulan 10!',
          en: 'When we have many items, counting in groups of 10 is much faster!'
        },
        voiceText: {
          bm: 'Satu ikat sepuluh barang dipanggil satu puluh. Barang yang tersendiri dipanggil sa.',
          en: 'A bundle of ten items is called one ten. Single loose items are called ones.'
        },
        illustrationEmoji: '📦',
        visualItems: [
          { emoji: '📦 (10)', label: '1 Puluh = 10' },
          { emoji: '✏️✏️✏️', label: '3 Sa = 3' }
        ],
        exampleFormula: '10 + 3 = 13 (1 Puluh 3 Sa)'
      },
      {
        title: { bm: 'Kedudukan Nombor', en: 'Position of Digits' },
        concept: {
          bm: 'Digit di sebelah KIRI ialah PULUH, digit di sebelah KANAN ialah SA.',
          en: 'The digit on the LEFT is TENS, the digit on the RIGHT is ONES.'
        },
        voiceText: {
          bm: 'Dalam nombor dua puluh lima, angka dua ialah puluh, angka lima ialah sa.',
          en: 'In number twenty-five, two is in the tens place, five is in the ones place.'
        },
        illustrationEmoji: '💡',
        exampleFormula: '25 = 2 Puluh + 5 Sa'
      }
    ]
  },

  // --- Foundation: Number Line Hops ---
  fnd_addition_numline: {
    topicId: 'fnd_addition_numline',
    level: 'foundation',
    title: { bm: 'Garis Nombor: Lompatan Si Katak', en: 'Number Line: Froggy Hops' },
    summary: {
      bm: 'Lompat ke kanan untuk Tambah, lompat ke kiri untuk Tolak.',
      en: 'Hop right to Add, hop left to Subtract.'
    },
    icon: '🐸',
    steps: [
      {
        title: { bm: 'Garis Nombor Seperti Tangga', en: 'Number Line is Like Steps' },
        concept: {
          bm: 'Garis nombor menyusun nombor dari kecil ke besar ke arah kanan.',
          en: 'A number line arranges numbers from small to large going right.'
        },
        voiceText: {
          bm: 'Untuk menambah, lompat ke kanan mengikut bilangan langkah yang diberi.',
          en: 'To add, jump forward to the right according to the number of steps given.'
        },
        illustrationEmoji: '🐸',
        visualItems: [
          { emoji: '3 ➔ +2 ➔ 5', label: 'Mula di 3, lompat 2 langkah, tiba di 5!' }
        ],
        exampleFormula: '3 + 2 = 5'
      }
    ]
  },

  // --- Foundation: Fractions Basic ---
  fnd_fractions_basic: {
    topicId: 'fnd_fractions_basic',
    level: 'foundation',
    title: { bm: 'Pecahan Asas: Separuh & Suku', en: 'Basic Fractions: Halves & Quarters' },
    summary: {
      bm: 'Membahagikan sesuatu objek kepada bahagian yang sama besar.',
      en: 'Splitting an object into equal parts.'
    },
    icon: '🍕',
    steps: [
      {
        title: { bm: 'Bahagian Mesti SAMA BESAR', en: 'Parts Must Be EQUAL' },
        concept: {
          bm: 'Pecahan hanya berlaku jika setiap potongan mempunyai saiz yang sama rata!',
          en: 'Fractions only work when every piece is cut equally!'
        },
        voiceText: {
          bm: 'Pecahan bermaksud membahagi satu benda kepada bahagian yang sama saiznya.',
          en: 'Fractions mean dividing an item into pieces of equal size.'
        },
        illustrationEmoji: '🍕'
      },
      {
        title: { bm: 'Satu Perdua (1/2) & Satu Perempat (1/4)', en: 'Half (1/2) and Quarter (1/4)' },
        concept: {
          bm: '1 daripada 2 bahagian dipanggil SATU PERDUA (Separuh). 1 daripada 4 bahagian dipanggil SATU PEREMPAT (Suku).',
          en: '1 out of 2 pieces is ONE HALF. 1 out of 4 pieces is ONE QUARTER.'
        },
        voiceText: {
          bm: 'Satu perdua ditulis satu per dua, satu perempat ditulis satu per empat.',
          en: 'Half is written as one over two, quarter is written as one over four.'
        },
        illustrationEmoji: '🍰',
        visualItems: [
          { emoji: '🌗', label: '1/2 (Separuh)' },
          { emoji: '🍕 (1/4)', label: '1/4 (Suku)' }
        ]
      }
    ]
  },

  // --- Year 1: Time ---
  y1_time: {
    topicId: 'y1_time',
    level: 'year_1',
    title: { bm: 'Masa: Membaca Muka Jam Analog', en: 'Time: Reading Analog Clocks' },
    summary: {
      bm: 'Mengenal jarum pendek (jam) dan jarum panjang (minit).',
      en: 'Recognising the short hand (hour) and long hand (minute).'
    },
    icon: '⏰',
    steps: [
      {
        title: { bm: 'Dua Jarum Jam Utama', en: 'The Two Clock Hands' },
        concept: {
          bm: 'Jarum PENDEK menunjukkan JAM (pukul berapa). Jarum PANJANG menunjukkan MINIT.',
          en: 'The SHORT hand shows the HOUR. The LONG hand shows the MINUTES.'
        },
        voiceText: {
          bm: 'Jarum pendek menunjukkan jam, jarum panjang menunjukkan minit.',
          en: 'Short hand points to the hour, long hand points to the minutes.'
        },
        illustrationEmoji: '🕰️',
        tip: {
          bm: 'Bila jarum panjang di angka 12, ia tepat pada jam tersebut (contoh: Pukul 3).',
          en: 'When the long hand points to 12, it is exactly that hour (e.g. 3 o\'clock).'
        }
      }
    ]
  },

  // --- Year 2: Multiplication ---
  y2_operations: {
    topicId: 'y2_operations',
    level: 'year_2',
    title: { bm: 'Konsep Darab: Tambah Berulang', en: 'Multiplication: Repeated Addition' },
    summary: {
      bm: 'Darab ialah cara pantas mengira kumpulan yang sama saiz.',
      en: 'Multiplication is a fast way to count equal groups.'
    },
    icon: '✖️',
    steps: [
      {
        title: { bm: 'Kumpulan Sama Banyak', en: 'Equal Sized Groups' },
        concept: {
          bm: 'Jika anda ada 3 pinggan, dan setiap pinggan ada 2 biji kuih: 2 + 2 + 2 = 6 biji kuih!',
          en: 'If you have 3 plates and each plate has 2 cakes: 2 + 2 + 2 = 6 cakes!'
        },
        voiceText: {
          bm: 'Darab ialah penambahan nombor yang sama berulang kali. Tiga darab dua sama dengan enam.',
          en: 'Multiplication is repeated addition of the same number. Three times two equals six.'
        },
        illustrationEmoji: '🍪',
        visualItems: [
          { emoji: '🍪🍪', label: 'Kumpulan 1' },
          { emoji: '🍪🍪', label: 'Kumpulan 2' },
          { emoji: '🍪🍪', label: 'Kumpulan 3' }
        ],
        exampleFormula: '3 × 2 = 6 (3 kumpulan 2)'
      }
    ]
  },

  // --- Year 4: BODMAS ---
  y4_numbers_100000: {
    topicId: 'y4_numbers_100000',
    level: 'year_4',
    title: { bm: 'Hukum Tertib Operasi (BODMAS)', en: 'Order of Operations (BODMAS)' },
    summary: {
      bm: 'Mengetahui operasi mana yang wajib diselesaikan terlebih dahulu.',
      en: 'Knowing which operation must be calculated first.'
    },
    icon: '🧮',
    steps: [
      {
        title: { bm: 'Siapa Menang Dulu?', en: 'Who Goes First?' },
        concept: {
          bm: 'Jika ada operasi bercampur (+, -, ×, ÷), kita TIDAK boleh kira dari kiri ke kanan sembarangan!',
          en: 'In mixed operations (+, -, ×, ÷), we CANNOT simply calculate from left to right!'
        },
        voiceText: {
          bm: 'Dalam operasi bercampur, sentiasa selesaikan kurungan dahulu, kemudian darab atau bahagi, barulah tambah atau tolak.',
          en: 'In mixed operations, always solve brackets first, then multiply or divide, then add or subtract.'
        },
        illustrationEmoji: '🥇',
        tip: {
          bm: 'Urutan: 1. Kurungan ( ) ➔ 2. Darab (×) / Bahagi (÷) ➔ 3. Tambah (+) / Tolak (-)',
          en: 'Order: 1. Brackets ( ) ➔ 2. Multiply (×) / Divide (÷) ➔ 3. Add (+) / Subtract (-)'
        },
        exampleFormula: '10 + 2 × 3 = 10 + 6 = 16 (Bukan 36!)'
      }
    ]
  }
};

/**
 * Get lesson for any topic. If a curated lesson exists, returns it;
 * otherwise automatically generates a developmentally appropriate lesson based on KPM topic metadata!
 */
export function getLessonForTopic(levelId: LevelId, topicId: string): TopicLesson {
  if (CURATED_LESSONS[topicId]) {
    return CURATED_LESSONS[topicId];
  }

  const topic = getTopicById(levelId, topicId);
  const level = getLevelById(levelId);

  const topicNameBm = topic ? topic.name.bm : 'Pelajaran Matematik';
  const topicNameEn = topic ? topic.name.en : 'Math Lesson';
  const icon = topic ? topic.icon : '📚';

  // Fallback intelligent pedagogical lesson
  return {
    topicId,
    level: levelId,
    title: {
      bm: `Sesi Belajar: ${topicNameBm}`,
      en: `Learning Session: ${topicNameEn}`
    },
    summary: {
      bm: topic?.description.bm || 'Fahami konsep penting sebelum mencuba soalan latihan.',
      en: topic?.description.en || 'Understand key concepts before trying practice questions.'
    },
    icon,
    steps: [
      {
        title: {
          bm: `1. Pengenalan Konsep ${topicNameBm}`,
          en: `1. Concept Introduction: ${topicNameEn}`
        },
        concept: {
          bm: `Dalam topik ini, kita akan mempelajari ${topicNameBm} (${topic?.standardContent ? `SK ${topic.standardContent}` : topic?.learningArea}).`,
          en: `In this topic, we will learn ${topicNameEn} (${topic?.standardContent ? `Standard ${topic.standardContent}` : topic?.learningArea}).`
        },
        voiceText: {
          bm: `Selamat datang ke sesi belajar ${topicNameBm}. Mari kita fahami asas topik ini bersama-sama.`,
          en: `Welcome to the learning session for ${topicNameEn}. Let us understand the fundamentals together.`
        },
        illustrationEmoji: icon,
        tip: {
          bm: 'Baca dengan teliti dan dengar penerangan suara sebelum memulakan soalan.',
          en: 'Read carefully and listen to voice guidance before answering.'
        }
      },
      {
        title: {
          bm: '2. Cara Berfikir & Petua Penting',
          en: '2. Thinking Strategy & Key Tips'
        },
        concept: {
          bm: 'Perhatikan maklumat dalam soalan. Kenal pasti apa yang diberi dan apa yang perlu dicari.',
          en: 'Look closely at the given information. Identify what is provided and what needs to be solved.'
        },
        voiceText: {
          bm: 'Kenal pasti maklumat yang diberi dan fikirkan formula atau langkah yang sesuai.',
          en: 'Identify the information given and think of the right steps.'
        },
        illustrationEmoji: '💡',
        tip: {
          bm: 'Jangan bimbang jika tersilap, anda boleh mencuba lagi dan meminta petunjuk.',
          en: 'Do not worry about mistakes, you can always try again with helpful hints.'
        }
      },
      {
        title: {
          bm: '3. Anda Bersedia!',
          en: '3. You Are Ready!'
        },
        concept: {
          bm: 'Tahniah! Sekarang anda sudah mempunyai asas yang mantap untuk mencuba soalan.',
          en: 'Congratulations! You now have a solid understanding to try the practice questions.'
        },
        voiceText: {
          bm: 'Bagus sekali! Anda kini bersedia untuk sesi latihan interaktif.',
          en: 'Well done! You are now ready for the interactive practice questions.'
        },
        illustrationEmoji: '🚀',
        tip: {
          bm: 'Ketik butang di bawah untuk memulakan latihan!',
          en: 'Tap the button below to start practice!'
        }
      }
    ]
  };
}
