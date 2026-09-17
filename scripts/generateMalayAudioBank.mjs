import fs from 'fs';
import path from 'path';
import https from 'https';

const BASIC_BM = [
  'sifar', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'lapan', 'sembilan',
  'sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas',
  'enam belas', 'tujuh belas', 'lapan belas', 'sembilan belas', 'dua puluh'
];

const TENS_BM = {
  2: 'dua puluh',
  3: 'tiga puluh',
  4: 'empat puluh',
  5: 'lima puluh',
  6: 'enam puluh',
  7: 'tujuh puluh',
  8: 'lapan puluh',
  9: 'sembilan puluh'
};

function numberToMalayWord(n) {
  if (n <= 20) return BASIC_BM[n];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones === 0) return TENS_BM[tens];
    return `${TENS_BM[tens]} ${BASIC_BM[ones]}`;
  }
  if (n === 100) return 'seratus';
  return String(n);
}

function fetchTTSAudio(text, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      // already downloaded
      return resolve();
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ms&client=tw-ob&q=${encodeURIComponent(text)}`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${text}`));
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
      stream.on('error', reject);
    });

    req.on('error', reject);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Generating Authentic Malaysian Malay Audio Bank...');

  // 1. Numbers 0 - 100
  console.log('Downloading numbers 0 to 100...');
  for (let i = 0; i <= 100; i++) {
    const word = numberToMalayWord(i);
    const dest = path.join('public', 'audio', 'ms', 'numbers', `${i}.mp3`);
    try {
      await fetchTTSAudio(word, dest);
      process.stdout.write(`.`);
      await delay(80); // avoid rate limit
    } catch (e) {
      console.error(`\nFailed for ${i} (${word}):`, e.message);
    }
  }
  console.log('\nNumbers 0 to 100 completed!');

  // 2. Math Terms
  const mathTerms = [
    { key: 'tambah', text: 'tambah' },
    { key: 'tolak', text: 'tolak' },
    { key: 'darab', text: 'darab' },
    { key: 'bahagi', text: 'bahagi' },
    { key: 'sama_dengan', text: 'sama dengan' },
    { key: 'ringgit', text: 'ringgit' },
    { key: 'sen', text: 'sen' },
    { key: 'sa', text: 'sa' },
    { key: 'puluh', text: 'puluh' },
    { key: 'ratus', text: 'ratus' },
    { key: 'ribu', text: 'ribu' },
    { key: 'sentimeter', text: 'sentimeter' },
    { key: 'kilogram', text: 'kilogram' },
    { key: 'meter', text: 'meter' },
    { key: 'liter', text: 'liter' }
  ];

  console.log('Downloading math terms...');
  for (const item of mathTerms) {
    const dest = path.join('public', 'audio', 'ms', 'math', `${item.key}.mp3`);
    try {
      await fetchTTSAudio(item.text, dest);
      console.log(`✓ ${item.key} (${item.text})`);
      await delay(100);
    } catch (e) {
      console.error(`Failed for ${item.key}:`, e.message);
    }
  }

  // 3. Encouragement & Feedback Phrases
  const feedbackPhrases = [
    { key: 'syabas', text: 'Syabas! Hebat sekali!' },
    { key: 'tepat', text: 'Tepat sekali! Anda sangat bijak!' },
    { key: 'bagus', text: 'Bagus! Teruskan usaha!' },
    { key: 'hebat', text: 'Hebat! Satu lagi jawapan betul!' },
    { key: 'cuba_lagi', text: 'Hampir betul! Mari cuba lagi.' },
    { key: 'jangan_putus_asa', text: 'Jangan putus asa, mari lihat petunjuk.' },
    { key: 'pasti_boleh', text: 'Cuba sekali lagi, anda pasti boleh!' }
  ];

  console.log('Downloading feedback phrases...');
  for (const item of feedbackPhrases) {
    const dest = path.join('public', 'audio', 'ms', 'feedback', `${item.key}.mp3`);
    try {
      await fetchTTSAudio(item.text, dest);
      console.log(`✓ ${item.key}`);
      await delay(100);
    } catch (e) {
      console.error(`Failed for ${item.key}:`, e.message);
    }
  }

  console.log('🎉 Audio bank generation fully complete!');
}

run().catch(console.error);
