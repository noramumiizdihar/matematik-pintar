// True pitch shifting for speech (WSOLA time-stretch + resample).
//
// Raising pitch by simply increasing playbackRate also speeds the speech up, which
// turns a voice into a rushed chipmunk — wrong for a learning app where a child must
// hear each Malay word at a normal speaking pace. Here the signal is first stretched
// in time, then resampled back to the original length, so only the pitch changes.

const MIN_RATIO = 1.01;
const MAX_RATIO = 2.0;

function hann(size: number): Float32Array {
  const w = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
  }
  return w;
}

/**
 * Cross-correlation between a candidate input segment and what has already been
 * written into the output at the current write head. WSOLA uses this to pick the
 * analysis frame that lines up best with the previous one, which is what keeps
 * speech from sounding flangy or doubled.
 */
function similarity(
  input: Float32Array,
  inPos: number,
  out: Float32Array,
  outPos: number,
  length: number
): number {
  let dot = 0;
  let energy = 1e-9;
  // Every 2nd sample is plenty for alignment and halves the cost
  for (let i = 0; i < length; i += 2) {
    const a = input[inPos + i];
    const b = out[outPos + i];
    dot += a * b;
    energy += a * a;
  }
  return dot / Math.sqrt(energy);
}

/** Stretch a mono signal in time by `factor` (>1 = longer) without changing pitch. */
function timeStretch(input: Float32Array, sampleRate: number, factor: number): Float32Array {
  const frame = Math.max(256, Math.round(0.040 * sampleRate)); // ~40 ms analysis window
  const synHop = Math.round(frame / 4); // 75% overlap
  const anaHop = Math.max(1, Math.round(synHop / factor));
  const overlap = frame - synHop;
  const search = Math.round(0.008 * sampleRate); // +/- 8 ms alignment search
  const window = hann(frame);

  const outLength = Math.ceil(input.length * factor) + frame;
  const out = new Float32Array(outLength);
  const norm = new Float32Array(outLength);

  let writePos = 0;
  let analysis = 0;

  while (analysis + frame < input.length && writePos + frame < outLength) {
    let best = analysis;

    if (writePos > 0) {
      let bestScore = -Infinity;
      for (let d = -search; d <= search; d += 4) {
        const candidate = analysis + d;
        if (candidate < 0 || candidate + frame >= input.length) continue;
        const score = similarity(input, candidate, out, writePos, overlap);
        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
      }
    }

    for (let i = 0; i < frame; i++) {
      out[writePos + i] += input[best + i] * window[i];
      norm[writePos + i] += window[i];
    }

    writePos += synHop;
    analysis += anaHop;
  }

  const used = Math.min(outLength, writePos + frame);
  const result = new Float32Array(used);
  for (let i = 0; i < used; i++) {
    result[i] = norm[i] > 1e-6 ? out[i] / norm[i] : out[i];
  }
  return result;
}

/** Resample by linear interpolation: reading `step` samples per output sample. */
function resample(input: Float32Array, step: number): Float32Array {
  const outLength = Math.max(1, Math.floor(input.length / step));
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const pos = i * step;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = input[idx] ?? 0;
    const b = input[idx + 1] ?? a;
    out[i] = a + (b - a) * frac;
  }
  return out;
}

/** Shift one mono channel up by `ratio` while keeping its duration. */
export function pitchShiftChannel(channel: Float32Array, sampleRate: number, ratio: number): Float32Array {
  const stretched = timeStretch(channel, sampleRate, ratio);
  return resample(stretched, ratio);
}

/**
 * Returns a copy of `buffer` pitched up by `ratio` (1.26 is roughly +4 semitones,
 * about the gap between an adult and a young child's speaking voice) with the same
 * duration. Ratios at or below 1 are returned unchanged — a child's own recording
 * must never be processed.
 */
export function pitchShiftBuffer(ctx: BaseAudioContext, buffer: AudioBuffer, ratio: number): AudioBuffer {
  if (!Number.isFinite(ratio) || ratio < MIN_RATIO) return buffer;
  const safeRatio = Math.min(MAX_RATIO, ratio);

  const shifted = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);

  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const source = buffer.getChannelData(c);
    const processed = pitchShiftChannel(source, buffer.sampleRate, safeRatio);
    const target = shifted.getChannelData(c);
    target.set(processed.subarray(0, Math.min(processed.length, target.length)));
  }

  return shifted;
}

/** Semitones above the original voice, expressed as a playback ratio. */
export function semitonesToRatio(semitones: number): number {
  return Math.pow(2, semitones / 12);
}
