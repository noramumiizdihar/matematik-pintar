// Number to Words Converter for Bahasa Melayu and English (0 - 1000+)
import { Language } from '../types/curriculum';

const BASIC_BM = [
  'Sifar', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Lapan', 'Sembilan',
  'Sepuluh', 'Sebelas', 'Dua belas', 'Tiga belas', 'Empat belas', 'Lima belas',
  'Enam belas', 'Tujuh belas', 'Lapan belas', 'Sembilan belas', 'Dua puluh'
];

const TENS_BM: Record<number, string> = {
  2: 'Dua puluh',
  3: 'Tiga puluh',
  4: 'Empat puluh',
  5: 'Lima puluh',
  6: 'Enam puluh',
  7: 'Tujuh puluh',
  8: 'Lapan puluh',
  9: 'Sembilan puluh'
};

const BASIC_EN = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
  'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'
];

const TENS_EN: Record<number, string> = {
  2: 'Twenty',
  3: 'Thirty',
  4: 'Forty',
  5: 'Fifty',
  6: 'Sixty',
  7: 'Seventy',
  8: 'Eighty',
  9: 'Ninety'
};

export function numberToWords(n: number, lang: Language): string {
  if (n < 0) return String(n);

  if (lang === 'bm') {
    if (n <= 20) return BASIC_BM[n] || String(n);
    if (n < 100) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      if (ones === 0) return TENS_BM[tens];
      return `${TENS_BM[tens]} ${BASIC_BM[ones].toLowerCase()}`;
    }
    if (n === 100) return 'Seratus';
    if (n < 200) {
      return `Seratus ${numberToWords(n - 100, 'bm').toLowerCase()}`;
    }
    if (n < 1000) {
      const hundreds = Math.floor(n / 100);
      const rem = n % 100;
      const base = `${BASIC_BM[hundreds]} ratus`;
      if (rem === 0) return base;
      return `${base} ${numberToWords(rem, 'bm').toLowerCase()}`;
    }
    if (n === 1000) return 'Seribu';
    return String(n);
  }

  // English
  if (n <= 20) return BASIC_EN[n] || String(n);
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones === 0) return TENS_EN[tens];
    return `${TENS_EN[tens]}-${BASIC_EN[ones].toLowerCase()}`;
  }
  if (n === 100) return 'One Hundred';
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rem = n % 100;
    const base = `${BASIC_EN[hundreds]} hundred`;
    if (rem === 0) return base;
    return `${base} and ${numberToWords(rem, 'en').toLowerCase()}`;
  }
  if (n === 1000) return 'One Thousand';
  return String(n);
}
