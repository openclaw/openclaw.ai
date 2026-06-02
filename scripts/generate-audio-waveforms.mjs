import { spawnSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const audioDir = join(process.cwd(), 'public/audio/blog');
const sampleRate = 8_000;
const peakCount = 260;

function decodeAudio(file) {
  const result = spawnSync('ffmpeg', [
    '-v', 'error',
    '-i', file,
    '-ac', '1',
    '-ar', String(sampleRate),
    '-f', 'f32le',
    '-',
  ], { encoding: null, maxBuffer: 512 * 1024 * 1024 });

  if (result.status !== 0) {
    throw new Error(result.stderr?.toString() || `ffmpeg failed for ${file}`);
  }

  return new Float32Array(result.stdout.buffer, result.stdout.byteOffset, result.stdout.byteLength / Float32Array.BYTES_PER_ELEMENT);
}

function buildPeaks(samples) {
  const bucketSize = Math.max(1, Math.floor(samples.length / peakCount));
  const peaks = [];
  let loudest = 0;

  for (let bucket = 0; bucket < peakCount; bucket += 1) {
    const start = bucket * bucketSize;
    const end = bucket === peakCount - 1 ? samples.length : Math.min(samples.length, start + bucketSize);
    let sum = 0;

    for (let index = start; index < end; index += 1) {
      const value = samples[index] ?? 0;
      sum += value * value;
    }

    const rms = Math.sqrt(sum / Math.max(1, end - start));
    peaks.push(rms);
    loudest = Math.max(loudest, rms);
  }

  return peaks.map((peak) => {
    const normalized = loudest > 0 ? peak / loudest : 0;
    return Number(Math.max(0.08, normalized).toFixed(3));
  });
}

for (const fileName of readdirSync(audioDir).filter((name) => name.endsWith('.mp3')).sort()) {
  const file = join(audioDir, fileName);
  const samples = decodeAudio(file);
  const peaks = buildPeaks(samples);
  const output = join(audioDir, fileName.replace(/\.mp3$/, '.waveform.json'));
  writeFileSync(output, `${JSON.stringify({ version: 1, peaks })}\n`);
  console.log(`wrote ${output}`);
}
