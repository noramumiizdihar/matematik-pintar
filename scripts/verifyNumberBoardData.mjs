import { NUMBER_BOARD_DATA, MILESTONE_NUMBERS } from '../src/data/numberBoardData.ts';

console.log('🧪 Verifying NUMBER_BOARD_DATA...');

if (NUMBER_BOARD_DATA.length !== 101) {
  throw new Error(`Expected exactly 101 entries, found ${NUMBER_BOARD_DATA.length}`);
}

const seenNumbers = new Set();
NUMBER_BOARD_DATA.forEach((item, index) => {
  if (item.number !== index) {
    throw new Error(`Item at index ${index} has number ${item.number}`);
  }
  if (seenNumbers.has(item.number)) {
    throw new Error(`Duplicate number detected: ${item.number}`);
  }
  seenNumbers.add(item.number);

  if (!item.english || typeof item.english !== 'string') {
    throw new Error(`Invalid english field for number ${item.number}`);
  }
  if (!item.malay || typeof item.malay !== 'string') {
    throw new Error(`Invalid malay field for number ${item.number}`);
  }
});

// Specific spelling checks requested by user
const specificChecks = [
  { num: 0, en: 'ZERO', ms: 'SIFAR' },
  { num: 1, en: 'ONE', ms: 'SATU' },
  { num: 7, en: 'SEVEN', ms: 'TUJUH' },
  { num: 8, en: 'EIGHT', ms: 'LAPAN' },
  { num: 10, en: 'TEN', ms: 'SEPULUH' },
  { num: 14, en: 'FOURTEEN', ms: 'EMPAT BELAS' },
  { num: 20, en: 'TWENTY', ms: 'DUA PULUH' },
  { num: 21, en: 'TWENTY-ONE', ms: 'DUA PULUH SATU' },
  { num: 32, en: 'THIRTY-TWO', ms: 'TIGA PULUH DUA' },
  { num: 40, en: 'FORTY', ms: 'EMPAT PULUH' },
  { num: 45, en: 'FORTY-FIVE', ms: 'EMPAT PULUH LIMA' },
  { num: 57, en: 'FIFTY-SEVEN', ms: 'LIMA PULUH TUJUH' },
  { num: 68, en: 'SIXTY-EIGHT', ms: 'ENAM PULUH LAPAN' },
  { num: 79, en: 'SEVENTY-NINE', ms: 'TUJUH PULUH SEMBILAN' },
  { num: 84, en: 'EIGHTY-FOUR', ms: 'LAPAN PULUH EMPAT' },
  { num: 96, en: 'NINETY-SIX', ms: 'SEMBILAN PULUH ENAM' },
  { num: 100, en: 'ONE HUNDRED', ms: 'SERATUS' }
];

for (const check of specificChecks) {
  const item = NUMBER_BOARD_DATA[check.num];
  if (item.english !== check.en) {
    throw new Error(`Mismatch at ${check.num} EN: expected "${check.en}", got "${item.english}"`);
  }
  if (item.malay !== check.ms) {
    throw new Error(`Mismatch at ${check.num} MS: expected "${check.ms}", got "${item.malay}"`);
  }
}

console.log('✅ ALL 101 Numbers validated perfectly with zero errors!');
