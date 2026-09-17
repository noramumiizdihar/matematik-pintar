// Tiny script to generate simple valid PNG icons for PWA without external packages
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createSolidPNG(width: number, height: number, r: number, g: number, b: number): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, toCrc, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = chunk('IHDR', ihdr);

  // Scanlines: each row has 1 filter byte (0) + width * 3 bytes
  const rowLen = 1 + width * 3;
  const rawData = Buffer.alloc(rowLen * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowLen;
    rawData[rowStart] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const pxStart = rowStart + 1 + x * 3;
      // Indigo gradient background
      rawData[pxStart] = r;
      rawData[pxStart + 1] = g;
      rawData[pxStart + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write 192x192 (#6366f1) and 512x512 (#4f46e5)
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createSolidPNG(192, 192, 99, 102, 241));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createSolidPNG(512, 512, 79, 70, 229));
console.log('PNG Icons generated successfully');
