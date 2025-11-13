# Production Streaming Setup

## Problem with Browser Streaming

Browser → Backend → Icecast approach has issues:
- WebM format incompatible with Icecast
- Database timeouts on long streams
- Unreliable for 5+ hour streams

## Recommended Solution: Use OBS Studio

### Setup (One-time)

1. **Download OBS Studio** (free)
   - https://obsproject.com/download

2. **Configure OBS for Icecast:**
   - Settings → Stream
   - Service: Custom
   - Server: `icecast://localhost:8001/live`
   - Stream Key: `source:churchsource123`

3. **Audio Settings:**
   - Settings → Audio
   - Sample Rate: 44.1 kHz
   - Channels: Stereo
   - Select your microphone

4. **Output Settings:**
   - Settings → Output
   - Output Mode: Advanced
   - Audio Encoder: MP3 or AAC
   - Bitrate: 128 kbps

### To Stream

1. Open OBS
2. Click "Start Streaming"
3. Members can listen at: http://localhost:8001/live
4. Stream for 5+ hours without issues

## Alternative: Butt (Broadcast Using This Tool)

Simpler than OBS, designed for Icecast:

1. Download: https://danielnoethen.de/butt/
2. Settings:
   - Server: localhost
   - Port: 8001
   - Password: churchsource123
   - Mountpoint: /live
3. Click "Play" to start streaming

## For Your Church Website

Keep the current UI but add instructions:

**Admin Dashboard:**
- Show "Use OBS Studio to stream" message
- Display stream URL: `icecast://localhost:8001/live`
- Display password: `churchsource123`
- Remove "Go Live" button or make it informational

**Member Dashboard:**
- Keep current player (works fine for listening)
- Shows "Live" when OBS is streaming

## Why This Works

- OBS/Butt handle MP3 encoding properly
- Direct connection to Icecast (no backend relay)
- Stable for 5+ hour streams
- Professional audio quality
- No database connection issues
