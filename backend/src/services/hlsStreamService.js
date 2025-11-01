import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HLS_STREAM } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STREAM_BASE_PATH = path.join(__dirname, '../../uploads/streams');

class HLSStreamService {
  constructor() {
    this.activeStreams = new Map();
    if (!fs.existsSync(STREAM_BASE_PATH)) {
      fs.mkdirSync(STREAM_BASE_PATH, { recursive: true });
    }
  }

  startStream(streamId) {
    const streamPath = path.join(STREAM_BASE_PATH, streamId);
    if (!fs.existsSync(streamPath)) {
      fs.mkdirSync(streamPath, { recursive: true });
    }

    this.activeStreams.set(streamId, {
      segmentIndex: 0,
      segments: [],
      startTime: Date.now()
    });

    const playlistPath = path.join(streamPath, 'playlist.m3u8');
    const initialPlaylist = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      `#EXT-X-TARGETDURATION:${HLS_STREAM.SEGMENT_DURATION}`,
      '#EXT-X-MEDIA-SEQUENCE:0',
      ''
    ].join('\n');
    fs.writeFileSync(playlistPath, initialPlaylist);

    console.log(`Stream ${streamId} started, playlist created at ${playlistPath}`);

    return {
      streamUrl: `/uploads/streams/${streamId}/playlist.m3u8`,
      uploadUrl: `/livestreams/${streamId}/upload-chunk`
    };
  }

  async addChunk(streamId, audioBuffer) {
    const streamData = this.activeStreams.get(streamId);
    if (!streamData) {
      throw new Error('Stream not active');
    }

    const segmentIndex = streamData.segmentIndex++;
    const segmentFilename = `segment${segmentIndex}.ts`;
    const segmentPath = path.join(STREAM_BASE_PATH, streamId, segmentFilename);

    await fs.promises.writeFile(segmentPath, audioBuffer);

    streamData.segments.push({
      filename: segmentFilename,
      duration: HLS_STREAM.SEGMENT_DURATION,
      index: segmentIndex
    });

    if (streamData.segments.length > HLS_STREAM.MAX_SEGMENTS) {
      const oldSegment = streamData.segments.shift();
      const oldPath = path.join(STREAM_BASE_PATH, streamId, oldSegment.filename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    this.generatePlaylist(streamId);
  }

  generatePlaylist(streamId) {
    const streamData = this.activeStreams.get(streamId);
    if (!streamData) return;

    const playlistContent = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      `#EXT-X-TARGETDURATION:${HLS_STREAM.SEGMENT_DURATION}`,
      '#EXT-X-MEDIA-SEQUENCE:' + (streamData.segmentIndex - streamData.segments.length),
      ''
    ];

    streamData.segments.forEach(segment => {
      playlistContent.push(`#EXTINF:${segment.duration.toFixed(3)},`);
      playlistContent.push(segment.filename);
    });

    const playlistPath = path.join(STREAM_BASE_PATH, streamId, 'playlist.m3u8');
    fs.writeFileSync(playlistPath, playlistContent.join('\n'));
  }

  endStream(streamId) {
    const streamData = this.activeStreams.get(streamId);
    if (!streamData) return;

    const playlistPath = path.join(STREAM_BASE_PATH, streamId, 'playlist.m3u8');
    if (fs.existsSync(playlistPath)) {
      let content = fs.readFileSync(playlistPath, 'utf8');
      content += '\n#EXT-X-ENDLIST';
      fs.writeFileSync(playlistPath, content);
    }

    this.activeStreams.delete(streamId);

    setTimeout(() => {
      this.cleanupStream(streamId);
    }, HLS_STREAM.CLEANUP_DELAY);
  }

  cleanupStream(streamId) {
    const streamPath = path.join(STREAM_BASE_PATH, streamId);
    if (fs.existsSync(streamPath)) {
      fs.rmSync(streamPath, { recursive: true, force: true });
    }
  }
}

export default new HLSStreamService();
