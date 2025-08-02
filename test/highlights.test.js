const assert = require('assert');
const { EventEmitter } = require('events');
const { generateHighlights } = require('../src/highlights');

(async () => {
  // Mock fetch returning predefined clips
  const clips = [
    { url: 'b.mp4', duration: 6, rank: 3 },
    { url: 'a.mp4', duration: 4, rank: 2 },
    { url: 'c.mp4', duration: 3, rank: 1 },
  ];
  const fetchMock = async () => ({ json: async () => clips });

  // Mock spawn to emulate successful ffmpeg execution
  const spawnMock = () => {
    const emitter = new EventEmitter();
    process.nextTick(() => emitter.emit('close', 0));
    return emitter;
  };

  const url = await generateHighlights('event1', 8, { fetch: fetchMock, spawn: spawnMock });
  assert.ok(url.startsWith('file://'), 'Should return a file URL');
})();
