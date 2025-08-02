const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

/**
 * Fetch ranked clips for an event, order them by rank and merge the best ones
 * until the combined duration reaches at least `targetDuration`.
 *
 * The function makes a network call to `/events/:eventId/clips` which is
 * expected to return an array of objects with the following shape:
 * `{ url: string, duration: number, rank: number }`.
 *
 * Merging is performed using `ffmpeg` via the concat demuxer. The resulting
 * file is stored in the OS temporary directory and the function resolves with
 * a `file://` URL pointing to the merged video.
 *
 * @param {string|number} eventId - Identifier of the event to fetch clips for.
 * @param {number} targetDuration - Minimum total duration in seconds.
 * @param {object} [deps] - Optional dependency overrides (used for testing).
 * @param {Function} [deps.fetch] - Alternative implementation of fetch.
 * @param {Function} [deps.spawn] - Alternative implementation of spawn.
 * @returns {Promise<string>} - URL of the generated highlight video.
 */
async function generateHighlights(eventId, targetDuration, deps = {}) {
  const fetchFn = deps.fetch || fetch;
  const spawnFn = deps.spawn || spawn;

  // 1. Fetch ranked clips for the event
  const response = await fetchFn(`https://api.example.com/events/${eventId}/clips`);
  const clips = await response.json();

  if (!Array.isArray(clips)) {
    throw new Error('Invalid response from clips endpoint');
  }

  // 2. Sort clips by rank (highest first) and accumulate duration
  const sorted = clips.sort((a, b) => b.rank - a.rank);
  const selected = [];
  let total = 0;
  for (const clip of sorted) {
    selected.push(clip);
    total += Number(clip.duration) || 0;
    if (total >= targetDuration) break;
  }

  if (selected.length === 0) {
    throw new Error('No clips available to generate highlights');
  }

  // 3. Merge selected clips using ffmpeg
  // ffmpeg concat demuxer requires a text file with list of videos
  const listFile = path.join(os.tmpdir(), `highlights-${Date.now()}.txt`);
  const listContent = selected.map(c => `file '${c.url}'`).join('\n');
  await fs.promises.writeFile(listFile, listContent);

  const outputFile = path.join(os.tmpdir(), `highlights-${Date.now()}.mp4`);

  await new Promise((resolve, reject) => {
    const ff = spawnFn('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', outputFile], {
      stdio: 'ignore'
    });
    ff.on('error', reject);
    ff.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

  return `file://${outputFile}`;
}

module.exports = { generateHighlights };
