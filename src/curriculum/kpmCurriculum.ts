// Authoritative KPM Mathematics Curriculum Definition (KSSR Semakan 2017 / DSKP / KSPK)
import { LevelId, LevelInfo } from '../types/curriculum';

export const CURRICULUM_LEVELS: LevelInfo[] = [
  {
    id: 'beginner',
    name: {
      bm: 'Peringkat Awal',
      en: 'Beginner'
    },
    shortName: 'Tahap 0',
    icon: '🧸',
    ageRange: 'Umur 3 - 5',
    themeColor: 'from-amber-400 to-orange-500',
    description: {
      bm: 'Langkah pertama mengenal nombor, bentuk, saiz dan warna secara visual tanpa perlu membaca.',
      en: 'First steps with numbers, shapes, sizes, and colors purely visually with voice guidance.'
    },
    autoVoiceDefault: true,
    topics: [
      {
        id: 'beg_numbers_0_10',
        level: 'beginner',
        name: { bm: 'Kenal Nombor 0–10', en: 'Numbers 0–10' },
        icon: '🔢',
        description: { bm: 'Mengenal simbol nombor dan sebutannya', en: 'Recognise number symbols and names' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'Awal 1.1',
        standardLearning: 'Awal 1.1.1',
        order: 1
      },
      {
        id: 'beg_count_objects',
        level: 'beginner',
        name: { bm: 'Kira Objek Ceria', en: 'Counting Fun Objects' },
        icon: '🍎',
        description: { bm: 'Sentuh setiap objek comel untuk mengira', en: 'Tap cute items one by one to count' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'Awal 1.2',
        standardLearning: 'Awal 1.2.1',
        order: 2
      },
      {
        id: 'beg_more_less',
        level: 'beginner',
        name: { bm: 'Banyak atau Sedikit', en: 'More or Less' },
        icon: '⚖️',
        description: { bm: 'Membandingkan kuantiti kumpulan objek', en: 'Compare quantities of groups' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'Awal 1.3',
        standardLearning: 'Awal 1.3.1',
        order: 3
      },
      {
        id: 'beg_sizes',
        level: 'beginner',
        name: { bm: 'Besar & Kecil / Panjang & Pendek', en: 'Big & Small / Long & Short' },
        icon: '🦒',
        description: { bm: 'Membandingkan saiz dan ketinggian', en: 'Comparing size, length, and height' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: 'Awal 2.1',
        standardLearning: 'Awal 2.1.1',
        order: 4
      },
      {
        id: 'beg_shapes_colors',
        level: 'beginner',
        name: { bm: 'Bentuk & Warna Asas', en: 'Basic Shapes & Colors' },
        icon: '🔷',
        description: { bm: 'Bulatan, segi empat, segi tiga dan warna', en: 'Circles, squares, triangles & colors' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: 'Awal 2.2',
        standardLearning: 'Awal 2.2.1',
        order: 5
      },
      {
        id: 'beg_positions',
        level: 'beginner',
        name: { bm: 'Kedudukan: Atas, Bawah, Kiri, Kanan', en: 'Positions: Up, Down, Left, Right' },
        icon: '🧭',
        description: { bm: 'Arah dan kedudukan ruang', en: 'Direction and spatial position' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: 'Awal 2.3',
        standardLearning: 'Awal 2.3.1',
        order: 6
      },
      {
        id: 'beg_patterns',
        level: 'beginner',
        name: { bm: 'Corak & Susunan', en: 'Patterns & Sequences' },
        icon: '🧩',
        description: { bm: 'Melengkapkan corak warna dan bentuk', en: 'Complete color and shape patterns' },
        learningArea: 'Perkaitan dan Aljabar',
        standardContent: 'Awal 3.1',
        standardLearning: 'Awal 3.1.1',
        order: 7
      }
    ]
  },
  {
    id: 'preschool',
    name: {
      bm: 'Prasekolah',
      en: 'Preschool'
    },
    shortName: 'Pra',
    icon: '🎨',
    ageRange: 'Umur 5 - 6',
    themeColor: 'from-pink-400 to-rose-500',
    description: {
      bm: 'Persediaan melangkah ke sekolah rendah mengikut Kurikulum Standard Prasekolah Kebangsaan (KSPK).',
      en: 'Preparing for primary school based on the National Preschool Curriculum (KSPK).'
    },
    autoVoiceDefault: true,
    topics: [
      {
        id: 'pre_numbers_0_20',
        level: 'preschool',
        name: { bm: 'Nombor 0 hingga 20', en: 'Numbers 0 to 20' },
        icon: '🔢',
        description: { bm: 'Membilang, menulis dan menyusun nombor 0-20', en: 'Count, write, and order numbers 0-20' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'MA 2.1',
        standardLearning: 'MA 2.1.8',
        order: 1
      },
      {
        id: 'pre_sequences',
        level: 'preschool',
        name: { bm: 'Sebelum & Selepas', en: 'Before & After' },
        icon: '🚂',
        description: { bm: 'Menentukan nombor sebelum, selepas dan di antara', en: 'Determine before, after, and between' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'MA 2.2',
        standardLearning: 'MA 2.2.2',
        order: 2
      },
      {
        id: 'pre_addition_10',
        level: 'preschool',
        name: { bm: 'Tambah Visual dalam 10', en: 'Visual Addition within 10' },
        icon: '➕',
        description: { bm: 'Menggabungkan dua kumpulan objek', en: 'Combine two groups of objects' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'MA 3.1',
        standardLearning: 'MA 3.1.4',
        order: 3
      },
      {
        id: 'pre_subtraction_10',
        level: 'preschool',
        name: { bm: 'Tolak Visual dalam 10', en: 'Visual Subtraction within 10' },
        icon: '➖',
        description: { bm: 'Mengeluarkan atau mengasingkan objek', en: 'Separate or take away items' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'MA 3.2',
        standardLearning: 'MA 3.2.3',
        order: 4
      },
      {
        id: 'pre_shapes_sort',
        level: 'preschool',
        name: { bm: 'Bentuk & Pengelasan', en: 'Shapes & Sorting' },
        icon: '🔷',
        description: { bm: 'Mengecam dan mengelaskan bentuk 2D', en: 'Identify and classify 2D shapes' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: 'MA 6.2',
        standardLearning: 'MA 6.2.2',
        order: 5
      },
      {
        id: 'pre_time_money',
        level: 'preschool',
        name: { bm: 'Masa & Wang Syiling Asas', en: 'Time & Basic Coins' },
        icon: '⏰',
        description: { bm: 'Mengecam waktu pagi, petang, malam dan syiling 10s, 20s, 50s', en: 'Times of day and Malaysian coins' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: 'MA 5.1',
        standardLearning: 'MA 5.1.2',
        order: 6
      }
    ]
  },
  {
    id: 'foundation',
    name: {
      bm: 'Asas Pengukuhan',
      en: 'Foundation'
    },
    shortName: 'Asas',
    icon: '🌱',
    ageRange: 'Peralihan Tahun 1',
    themeColor: 'from-emerald-400 to-teal-600',
    description: {
      bm: 'Membina keyakinan mantap sebelum Tahun 1 dengan nombor hingga 100, nilai tempat dan operasi asas.',
      en: 'Bridge confidence before Year 1 with numbers to 100, place value, and operations.'
    },
    autoVoiceDefault: false,
    topics: [
      {
        id: 'fnd_numbers_100',
        level: 'foundation',
        name: { bm: 'Nombor Hingga 100', en: 'Numbers up to 100' },
        icon: '💯',
        description: { bm: 'Membilang puluh dan sa, menyusun urutan', en: 'Count by tens and ones, ordering' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'ASAS 1.1',
        standardLearning: 'ASAS 1.1.2',
        order: 1
      },
      {
        id: 'fnd_place_value',
        level: 'foundation',
        name: { bm: 'Nilai Tempat: Sa & Puluh', en: 'Place Value: Tens & Ones' },
        icon: '🏛️',
        description: { bm: 'Mengenal blok puluh dan sa dengan jelas', en: 'Decompose numbers into tens and ones' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'ASAS 1.2',
        standardLearning: 'ASAS 1.2.1',
        order: 2
      },
      {
        id: 'fnd_addition_numline',
        level: 'foundation',
        name: { bm: 'Tambah dengan Garis Nombor', en: 'Addition on Number Line' },
        icon: '🐸',
        description: { bm: 'Melompat ke depan pada garis nombor', en: 'Hop forward along the number line' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'ASAS 2.1',
        standardLearning: 'ASAS 2.1.2',
        order: 3
      },
      {
        id: 'fnd_subtraction_numline',
        level: 'foundation',
        name: { bm: 'Tolak dengan Garis Nombor', en: 'Subtraction on Number Line' },
        icon: '🔙',
        description: { bm: 'Melompat ke belakang pada garis nombor', en: 'Hop backward along the number line' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'ASAS 2.2',
        standardLearning: 'ASAS 2.2.2',
        order: 4
      },
      {
        id: 'fnd_groups_share',
        level: 'foundation',
        name: { bm: 'Kumpulan & Kongsi Sama Rata', en: 'Equal Groups & Sharing' },
        icon: '🍪',
        description: { bm: 'Asas konsep darab dan bahagi visual', en: 'Visual multiplication and division concepts' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'ASAS 2.3',
        standardLearning: 'ASAS 2.3.1',
        order: 5
      },
      {
        id: 'fnd_fractions_basic',
        level: 'foundation',
        name: { bm: 'Pecahan: Separuh & Suku', en: 'Fractions: Half & Quarter' },
        icon: '🍕',
        description: { bm: 'Mengenal satu perdua dan satu perempat', en: 'Visual halves and quarters' },
        learningArea: 'Nombor dan Operasi',
        standardContent: 'ASAS 3.1',
        standardLearning: 'ASAS 3.1.1',
        order: 6
      },
      {
        id: 'fnd_shop_money',
        level: 'foundation',
        name: { bm: 'Kedai Runcit Ringgit & Sen', en: 'Grocery Shop: Money Basics' },
        icon: '🏪',
        description: { bm: 'Membayar barangan dengan wang kertas RM1-RM10', en: 'Pay for items using Ringgit notes' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: 'ASAS 4.1',
        standardLearning: 'ASAS 4.1.1',
        order: 7
      }
    ]
  },
  {
    id: 'year_1',
    name: {
      bm: 'Tahun 1',
      en: 'Year 1'
    },
    shortName: 'T1',
    icon: '1️⃣',
    ageRange: 'Umur 7',
    themeColor: 'from-blue-500 to-indigo-600',
    description: {
      bm: 'Kurikulum Standard Sekolah Rendah (KSSR Semakan 2017) DSKP Tahun 1.',
      en: 'KPM KSSR Semakan 2017 Year 1 Mathematics curriculum.'
    },
    autoVoiceDefault: false,
    topics: [
      {
        id: 'y1_numbers_100',
        level: 'year_1',
        name: { bm: '1.0 Nombor Bulat Hingga 100', en: '1.0 Whole Numbers to 100' },
        icon: '🔢',
        description: { bm: 'Nilai nombor, nilai tempat, banding dan susun nombor (SK 1.1 - 1.8)', en: 'Place value, comparison, order (SK 1.1 - 1.8)' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '1.1 - 1.8',
        standardLearning: '1.2.1, 1.4.1',
        order: 1
      },
      {
        id: 'y1_addition_subtraction',
        level: 'year_1',
        name: { bm: '2.0 Tambah dan Tolak', en: '2.0 Addition & Subtraction' },
        icon: '➕',
        description: { bm: 'Fakta asas tambah dan tolak dalam lingkungan 100 (SK 2.1 - 2.5)', en: 'Basic addition and subtraction facts within 100' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '2.1 - 2.5',
        standardLearning: '2.2.1, 2.3.1',
        order: 2
      },
      {
        id: 'y1_fractions',
        level: 'year_1',
        name: { bm: '3.0 Pecahan Wajar', en: '3.0 Proper Fractions' },
        icon: '🍰',
        description: { bm: 'Konsep satu perdua dan satu perempat (SK 3.1)', en: 'Halves and quarters concepts' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '3.1',
        standardLearning: '3.1.1',
        order: 3
      },
      {
        id: 'y1_money',
        level: 'year_1',
        name: { bm: '4.0 Wang Hingga RM10', en: '4.0 Money up to RM10' },
        icon: '💵',
        description: { bm: 'Mengecam syiling dan wang kertas, tambah wang (SK 4.1 - 4.2)', en: 'Coins and Ringgit banknotes, basic addition' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '4.1 - 4.2',
        standardLearning: '4.1.2',
        order: 4
      },
      {
        id: 'y1_time',
        level: 'year_1',
        name: { bm: '5.0 Masa dan Waktu', en: '5.0 Time' },
        icon: '⏰',
        description: { bm: 'Waktu sehari, muka jam analog (setengah jam dan jam) (SK 5.1 - 5.2)', en: 'Daily times, analog clock hours and half-hours' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '5.1 - 5.2',
        standardLearning: '5.2.1',
        order: 5
      },
      {
        id: 'y1_measurement',
        level: 'year_1',
        name: { bm: '6.0 Ukuran dan Sukatan', en: '6.0 Measurement' },
        icon: '📏',
        description: { bm: 'Panjang, jisim dan isi padu cecair secara unit bukan piawai (SK 6.1)', en: 'Length, mass, and liquid capacity with non-standard units' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '6.1',
        standardLearning: '6.1.1',
        order: 6
      },
      {
        id: 'y1_shapes',
        level: 'year_1',
        name: { bm: '7.0 Ruang: Bentuk 2D & 3D', en: '7.0 Space: 2D & 3D Shapes' },
        icon: '📦',
        description: { bm: 'Bentuk kubus, kuboid, piramid, silinder, kon, segi empat, segi tiga (SK 7.1 - 7.2)', en: '3D and 2D shapes identification and properties' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '7.1 - 7.2',
        standardLearning: '7.1.1',
        order: 7
      }
    ]
  },
  {
    id: 'year_2',
    name: {
      bm: 'Tahun 2',
      en: 'Year 2'
    },
    shortName: 'T2',
    icon: '2️⃣',
    ageRange: 'Umur 8',
    themeColor: 'from-cyan-500 to-blue-600',
    description: {
      bm: 'KSSR Semakan 2017: Nombor hingga 1000, sifir darab dan bahagi, wang hingga RM100.',
      en: 'KSSR Semakan 2017: Numbers to 1000, times tables, division, money up to RM100.'
    },
    autoVoiceDefault: false,
    topics: [
      {
        id: 'y2_numbers_1000',
        level: 'year_2',
        name: { bm: '1.0 Nombor Bulat Hingga 1000', en: '1.0 Whole Numbers to 1000' },
        icon: '🔢',
        description: { bm: 'Nilai tempat ratus, puluh dan sa, pola nombor (SK 1.1 - 1.7)', en: 'Hundreds, tens, ones, number patterns' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '1.1 - 1.7',
        standardLearning: '1.2.1',
        order: 1
      },
      {
        id: 'y2_addition_subtraction',
        level: 'year_2',
        name: { bm: '2.1 & 2.2 Tambah dan Tolak hingga 1000', en: '2.1 & 2.2 Addition & Subtraction to 1000' },
        icon: '➕',
        description: { bm: 'Operasi dengan mengumpul semula (SK 2.1 - 2.2)', en: 'Operations with regrouping' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '2.1 - 2.2',
        standardLearning: '2.1.1, 2.2.1',
        order: 2
      },
      {
        id: 'y2_multiplication_division',
        level: 'year_2',
        name: { bm: '2.3 & 2.4 Darab & Bahagi (Sifir 2, 3, 4, 5, 10)', en: '2.3 & 2.4 Times Tables & Division' },
        icon: '✖️',
        description: { bm: 'Sifir darab 2, 3, 4, 5, 10 dan bahagi berkaitan (SK 2.3 - 2.4)', en: 'Times tables 2, 3, 4, 5, 10 and related division' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '2.3 - 2.4',
        standardLearning: '2.3.1',
        order: 3
      },
      {
        id: 'y2_fractions_decimals',
        level: 'year_2',
        name: { bm: '3.0 Pecahan Wajar & Perpuluhan', en: '3.0 Proper Fractions & Decimals' },
        icon: '🥧',
        description: { bm: 'Pecahan wajar hingga 10 dan perpuluhan 0.1 - 0.9 (SK 3.1 - 3.4)', en: 'Fractions up to tenths, decimals 0.1 to 0.9' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '3.1 - 3.4',
        standardLearning: '3.1.2, 3.2.2',
        order: 4
      },
      {
        id: 'y2_money_100',
        level: 'year_2',
        name: { bm: '4.0 Wang Hingga RM100', en: '4.0 Money up to RM100' },
        icon: '💰',
        description: { bm: 'Tambah, tolak wang dan nilai mata wang hingga RM100 (SK 4.1 - 4.7)', en: 'Add, subtract money up to RM100' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '4.1 - 4.7',
        standardLearning: '4.2.1',
        order: 5
      },
      {
        id: 'y2_time_measurement',
        level: 'year_2',
        name: { bm: '5.0 Masa & 6.0 Ukuran (m, cm, kg, g, l, ml)', en: '5.0 Time & 6.0 Measurement' },
        icon: '⏱️',
        description: { bm: 'Masa selang 5 minit dan unit ukuran piawai (SK 5.1, 6.1)', en: '5-minute intervals, standard measurement units' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '5.1, 6.1',
        standardLearning: '5.1.2',
        order: 6
      }
    ]
  },
  {
    id: 'year_3',
    name: {
      bm: 'Tahun 3',
      en: 'Year 3'
    },
    shortName: 'T3',
    icon: '3️⃣',
    ageRange: 'Umur 9',
    themeColor: 'from-emerald-500 to-green-600',
    description: {
      bm: 'KSSR Semakan 2017: Nombor hingga 10 000, sifir 6, 7, 8, 9, pecahan setara, peratus dan data.',
      en: 'KSSR Semakan 2017: Numbers to 10,000, sifir 6-9, equivalent fractions, percentages, data.'
    },
    autoVoiceDefault: false,
    topics: [
      {
        id: 'y3_numbers_10000',
        level: 'year_3',
        name: { bm: '1.0 Nombor Bulat Hingga 10 000', en: '1.0 Numbers up to 10,000' },
        icon: '🔢',
        description: { bm: 'Nilai nombor, nilai tempat ribu, bundar nombor (SK 1.1 - 1.8)', en: 'Thousands place value, rounding, comparison' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '1.1 - 1.8',
        standardLearning: '1.4.1, 1.6.1',
        order: 1
      },
      {
        id: 'y3_operations',
        level: 'year_3',
        name: { bm: '2.0 Operasi Asas (Tambah, Tolak, Darab, Bahagi)', en: '2.0 Basic Operations' },
        icon: '🧮',
        description: { bm: 'Darab sifir 6, 7, 8, 9 dan bahagi dalam lingkungan 10 000 (SK 2.1 - 2.5)', en: 'Multiplication sifir 6-9, division within 10,000' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '2.1 - 2.5',
        standardLearning: '2.3.1',
        order: 2
      },
      {
        id: 'y3_fractions_percent',
        level: 'year_3',
        name: { bm: '3.0 Pecahan, Perpuluhan & Peratus', en: '3.0 Fractions, Decimals & Percent' },
        icon: '📊',
        description: { bm: 'Pecahan setara, pecahan bentuk termudah, peratus (SK 3.1 - 3.4)', en: 'Equivalent fractions, simplest form, percentages' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '3.1 - 3.4',
        standardLearning: '3.1.2',
        order: 3
      },
      {
        id: 'y3_money_10000',
        level: 'year_3',
        name: { bm: '4.0 Wang Hingga RM10 000', en: '4.0 Money up to RM10,000' },
        icon: '💳',
        description: { bm: 'Operasi bercampur wang, celik wang, simpanan (SK 4.1 - 4.8)', en: 'Money operations up to RM10,000' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '4.1 - 4.8',
        standardLearning: '4.3.1',
        order: 4
      },
      {
        id: 'y3_time_calendar',
        level: 'year_3',
        name: { bm: '5.0 Masa, Waktu & Kalendar', en: '5.0 Time & Calendar' },
        icon: '🗓️',
        description: { bm: 'Jam, minit, saat, perkaitan waktu dan kalendar (SK 5.1 - 5.8)', en: 'Hours, minutes, seconds, calendar conversions' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '5.1 - 5.8',
        standardLearning: '5.4.1',
        order: 5
      },
      {
        id: 'y3_geometry_data',
        level: 'year_3',
        name: { bm: '7.0 Geometri & 8.0 Pengurusan Data', en: '7.0 Geometry & 8.0 Data' },
        icon: '📐',
        description: { bm: 'Garis selari, serenjang, sudut tegak, carta bar (SK 7.1, 8.1)', en: 'Parallel, perpendicular lines, bar charts' },
        learningArea: 'Statistik dan Kebolehjadian',
        standardContent: '7.1, 8.1',
        standardLearning: '7.1.1',
        order: 6
      }
    ]
  },
  {
    id: 'year_4',
    name: {
      bm: 'Tahun 4',
      en: 'Year 4'
    },
    shortName: 'T4',
    icon: '4️⃣',
    ageRange: 'Umur 10',
    themeColor: 'from-violet-500 to-purple-600',
    description: {
      bm: 'KSSR Semakan 2017: Nombor hingga 100 000, operasi bergabung, pecahan bercampur, perpuluhan, koordinat.',
      en: 'KSSR Semakan 2017: Numbers to 100,000, mixed operations, mixed numbers, coordinates.'
    },
    autoVoiceDefault: false,
    topics: [
      {
        id: 'y4_numbers_100000',
        level: 'year_4',
        name: { bm: '1.0 Nombor Bulat & Operasi Bergabung', en: '1.0 Whole Numbers & Mixed Operations' },
        icon: '🔢',
        description: { bm: 'Nombor hingga 100 000, pola nombor, operasi bergabung (+,-,×,÷) (SK 1.1 - 1.9)', en: 'Numbers to 100,000, mixed operations' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '1.1 - 1.9',
        standardLearning: '1.7.1',
        order: 1
      },
      {
        id: 'y4_fractions_decimals',
        level: 'year_4',
        name: { bm: '2.0 Pecahan, Perpuluhan & Peratus', en: '2.0 Fractions, Decimals & Percentages' },
        icon: '🍰',
        description: { bm: 'Nombor bercampur, pecahan tak wajar, perpuluhan 3 tempat (SK 2.1 - 2.3)', en: 'Mixed numbers, improper fractions, decimals to thousandths' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '2.1 - 2.3',
        standardLearning: '2.1.2',
        order: 2
      },
      {
        id: 'y4_money_100000',
        level: 'year_4',
        name: { bm: '3.0 Wang Hingga RM100 000', en: '3.0 Money up to RM100,000' },
        icon: '💰',
        description: { bm: 'Operasi bergabung wang, mata wang utama dunia, instrumen pembayaran (SK 3.1 - 3.3)', en: 'Money operations, world currencies, payment methods' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '3.1 - 3.3',
        standardLearning: '3.1.1',
        order: 3
      },
      {
        id: 'y4_time_decades',
        level: 'year_4',
        name: { bm: '4.0 Masa & Waktu: Dekad & Abad', en: '4.0 Time: Decades & Centuries' },
        icon: '⏳',
        description: { bm: 'Perkaitan alaf, abad, dekad dan tahun (SK 4.1 - 4.4)', en: 'Centuries, decades, and years conversions' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '4.1 - 4.4',
        standardLearning: '4.1.1',
        order: 4
      },
      {
        id: 'y4_geometry_area',
        level: 'year_4',
        name: { bm: '6.0 Ruang: Perimeter & Luas', en: '6.0 Space: Perimeter & Area' },
        icon: '📐',
        description: { bm: 'Sudut tirus/cakah, perimeter dan luas poligon sekata (SK 6.1 - 6.4)', en: 'Angles, perimeter, and area calculation' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '6.1 - 6.4',
        standardLearning: '6.3.1',
        order: 5
      },
      {
        id: 'y4_coordinates_data',
        level: 'year_4',
        name: { bm: '7.0 Koordinat, Nisbah & 8.0 Data Carta Pai', en: '7.0 Coordinates, Ratio & 8.0 Pie Charts' },
        icon: '📍',
        description: { bm: 'Titik asalan, koordinat sukuan pertama, carta pai (SK 7.1, 8.1)', en: 'First quadrant coordinates, ratio, pie charts' },
        learningArea: 'Perkaitan dan Aljabar',
        standardContent: '7.1, 8.1',
        standardLearning: '7.1.1',
        order: 6
      }
    ]
  },
  {
    id: 'year_5',
    name: {
      bm: 'Tahun 5',
      en: 'Year 5'
    },
    shortName: 'T5',
    icon: '5️⃣',
    ageRange: 'Umur 11',
    themeColor: 'from-amber-500 to-yellow-600',
    description: {
      bm: 'KSSR Semakan 2017: Nombor hingga 1 000 000, nombor perdana, simpanan & faedah, zon masa, purata (min).',
      en: 'KSSR Semakan 2017: Numbers to 1,000,000, prime numbers, savings & interest, mean, mode.'
    },
    autoVoiceDefault: false,
    topics: [
      {
        id: 'y5_numbers_1000000',
        level: 'year_5',
        name: { bm: '1.0 Nombor Bulat & Nombor Perdana', en: '1.0 Numbers to 1,000,000 & Primes' },
        icon: '🔢',
        description: { bm: 'Nombor perdana dalam lingkungan 100, pola nombor, juta (SK 1.1 - 1.4)', en: 'Prime numbers within 100, numbers up to 1,000,000' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '1.1 - 1.4',
        standardLearning: '1.2.1',
        order: 1
      },
      {
        id: 'y5_fractions_advanced',
        level: 'year_5',
        name: { bm: '2.0 Operasi Pecahan, Perpuluhan & Peratus', en: '2.0 Operations with Fractions & Percent' },
        icon: '🥧',
        description: { bm: 'Darab pecahan dengan kuantiti, peratus nilai simpanan (SK 2.1 - 2.4)', en: 'Multiplying fractions by quantities, percentages' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '2.1 - 2.4',
        standardLearning: '2.1.1',
        order: 2
      },
      {
        id: 'y5_money_investments',
        level: 'year_5',
        name: { bm: '3.0 Wang: Simpanan, Pelaburan & Faedah', en: '3.0 Money: Savings, Investment & Interest' },
        icon: '🏦',
        description: { bm: 'Faedah mudah, faedah kompaun, harga kos, harga jual (SK 3.1 - 3.4)', en: 'Simple & compound interest, cost price, selling price' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '3.1 - 3.4',
        standardLearning: '3.2.1',
        order: 3
      },
      {
        id: 'y5_time_zones',
        level: 'year_5',
        name: { bm: '4.0 Masa: Tempoh & Zon Waktu', en: '4.0 Time: Duration & Time Zones' },
        icon: '🌍',
        description: { bm: 'Mengira tempoh masa dan beza zon waktu dunia (SK 4.1)', en: 'Calculating time durations and world time zones' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '4.1',
        standardLearning: '4.1.1',
        order: 4
      },
      {
        id: 'y5_geometry_volume',
        level: 'year_5',
        name: { bm: '6.0 Ruang: Poligon Sekata & Isi Padu', en: '6.0 Space: Regular Polygons & Volume' },
        icon: '🧊',
        description: { bm: 'Ciri poligon sekata, sudut pedalaman, isi padu bongkah gabungan (SK 6.1 - 6.4)', en: 'Polygon characteristics, volume of composite solids' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '6.1 - 6.4',
        standardLearning: '6.3.1',
        order: 5
      },
      {
        id: 'y5_stats_mode_median_mean',
        level: 'year_5',
        name: { bm: '8.0 Pengurusan Data: Mod, Median, Min & Julat', en: '8.0 Data: Mode, Median, Mean & Range' },
        icon: '📈',
        description: { bm: 'Mengenal dan mengira mod, median, min (purata) dan julat (SK 8.1 - 8.3)', en: 'Determine and calculate mode, median, mean, range' },
        learningArea: 'Statistik dan Kebolehjadian',
        standardContent: '8.1 - 8.3',
        standardLearning: '8.1.1',
        order: 6
      }
    ]
  },
  {
    id: 'year_6',
    name: {
      bm: 'Tahun 6',
      en: 'Year 6'
    },
    shortName: 'T6',
    icon: '6️⃣',
    ageRange: 'Umur 12',
    themeColor: 'from-rose-500 to-red-600',
    description: {
      bm: 'KSSR Semakan 2017: Penyelesaian masalah pelbagai langkah, untung rugi, diskaun, laju, kebolehjadian.',
      en: 'KSSR Semakan 2017: Multi-step problem solving, profit & loss, discount, speed, probability.'
    },
    autoVoiceDefault: false,
    topics: [
      {
        id: 'y6_numbers_10000000',
        level: 'year_6',
        name: { bm: '1.0 Nombor Bulat & Operasi Hingga 10 Juta', en: '1.0 Whole Numbers up to 10 Million' },
        icon: '🔢',
        description: { bm: 'Pecahan juta, perpuluhan juta, nombor gubahan (SK 1.1 - 1.4)', en: 'Millions in fractions and decimals, composite numbers' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '1.1 - 1.4',
        standardLearning: '1.1.2',
        order: 1
      },
      {
        id: 'y6_fractions_decimals_percent',
        level: 'year_6',
        name: { bm: '2.0 Operasi Bergabung & Masalah Berayat', en: '2.0 Mixed Operations & Word Problems' },
        icon: '📚',
        description: { bm: 'Penyelesaian masalah pelbagai langkah melibatkan pecahan & peratus (SK 2.1 - 2.3)', en: 'Multi-step real-world problems with fractions and percentages' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '2.1 - 2.3',
        standardLearning: '2.2.1',
        order: 2
      },
      {
        id: 'y6_money_financial',
        level: 'year_6',
        name: { bm: '3.0 Wang: Untung, Rugi, Diskaun, Cukai & Invois', en: '3.0 Money: Profit, Loss, Discount & Tax' },
        icon: '🧾',
        description: { bm: 'Aset, liabiliti, faedah, cukai perkhidmatan, rebat (SK 3.1 - 3.3)', en: 'Assets, liabilities, discount, service tax, invoices' },
        learningArea: 'Nombor dan Operasi',
        standardContent: '3.1 - 3.3',
        standardLearning: '3.1.2',
        order: 3
      },
      {
        id: 'y6_time_speed',
        level: 'year_6',
        name: { bm: '4.0 Masa, Waktu & Laju (Kelajuan)', en: '4.0 Time & Speed' },
        icon: '⚡',
        description: { bm: 'Konsep laju (km/j, m/s), jarak dan masa perjalanan (SK 4.1 - 4.2)', en: 'Speed formula (km/h), travel distance and time' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '4.1 - 4.2',
        standardLearning: '4.2.1',
        order: 4
      },
      {
        id: 'y6_geometry_composite',
        level: 'year_6',
        name: { bm: '5.0 Ruang: Bentuk Gabungan & Sudut', en: '5.0 Space: Composite Shapes & Angles' },
        icon: '📐',
        description: { bm: 'Luas bentuk gabungan 2D dan isi padu bentuk gabungan 3D (SK 5.1 - 5.3)', en: 'Area of composite 2D shapes, volume of composite 3D shapes' },
        learningArea: 'Sukatan dan Geometri',
        standardContent: '5.1 - 5.3',
        standardLearning: '5.2.1',
        order: 5
      },
      {
        id: 'y6_probability_data',
        level: 'year_6',
        name: { bm: '7.0 Kebolehjadian & Tafsir Data', en: '7.0 Probability & Data Interpretation' },
        icon: '🎲',
        description: { bm: 'Mungkin, mustahil, pasti; mentafsir carta palang dan carta pai (SK 7.1 - 8.1)', en: 'Likelihood (likely, impossible, certain), interpreting pie charts' },
        learningArea: 'Statistik dan Kebolehjadian',
        standardContent: '7.1 - 8.1',
        standardLearning: '7.1.1',
        order: 6
      }
    ]
  }
];

export function getLevelById(id: LevelId): LevelInfo | undefined {
  return CURRICULUM_LEVELS.find(l => l.id === id);
}

export function getTopicById(levelId: LevelId, topicId: string) {
  const level = getLevelById(levelId);
  return level?.topics.find(t => t.id === topicId);
}
