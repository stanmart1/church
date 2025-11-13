# Icecast Audio Streaming Setup

## Quick Start

### 1. Start Icecast Server

```bash
docker-compose up -d icecast
```

Icecast will be available at: http://localhost:8000

### 2. Verify Icecast is Running

```bash
curl http://localhost:8000/status.xsl
```

Or visit http://localhost:8000 in your browser.

### 3. Admin Access

- **Admin URL**: http://localhost:8000/admin/
- **Username**: admin
- **Password**: churchadmin123

### 4. Stream Configuration

- **Mount Point**: /live
- **Stream URL**: http://localhost:8000/live
- **Source Password**: churchsource123

## How It Works

### Admin Broadcasting

1. Admin clicks "Go Live" in dashboard
2. Browser captures microphone audio
3. Audio is processed with Web Audio API (gain, monitoring)
4. **Note**: Currently audio stays in browser - needs source client implementation

### Members Listening

1. Members open livestream tab
2. Audio player connects to: http://localhost:8000/live
3. Plays audio stream directly from Icecast

## Next Steps for Full Functionality

To complete the audio streaming pipeline, you need to implement one of these:

### Option 1: Browser-to-Icecast (Recommended for simplicity)

Use a library like `icecast-metadata-js` or implement WebSocket relay:

```typescript
// In StreamControls.tsx
const mediaRecorder = new MediaRecorder(dest.stream, {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: audioSettings.bitrate
});

mediaRecorder.ondataavailable = async (event) => {
  if (event.data.size > 0) {
    // Send to backend relay endpoint
    await fetch(`${API_URL}/livestreams/relay-audio`, {
      method: 'POST',
      body: event.data
    });
  }
};

mediaRecorder.start(1000); // Send chunks every second
```

### Option 2: Backend Relay Service

Add endpoint in `livestreams.py`:

```python
@router.post("/{livestream_id}/relay-audio")
async def relay_audio(livestream_id: str, request: Request):
    audio_data = await request.body()
    # Forward to Icecast using requests with PUT
    # to http://source:churchsource123@localhost:8000/live
```

### Option 3: Use OBS/Butt (Broadcast Using This Tool)

For production, use dedicated streaming software:
- **OBS Studio**: Free, powerful, supports Icecast
- **Butt**: Lightweight, designed for Icecast streaming

Configure OBS to stream to:
- Server: localhost:8000
- Mount: /live
- Password: churchsource123

## Testing

### Test with VLC or ffmpeg

Stream a test audio file:

```bash
ffmpeg -re -i test.mp3 -codec:a libmp3lame -b:a 128k \
  -f mp3 icecast://source:churchsource123@localhost:8000/live
```

### Listen to stream:

```bash
vlc http://localhost:8000/live
```

Or open in browser: http://localhost:8000/live

## Configuration

### Environment Variables

Add to `backend/.env`:

```env
ICECAST_HOST=localhost
ICECAST_PORT=8000
ICECAST_SOURCE_PASSWORD=churchsource123
ICECAST_ADMIN_USER=admin
ICECAST_ADMIN_PASSWORD=churchadmin123
```

### Production Settings

For production, update `icecast-config/icecast.xml`:

1. Change passwords
2. Set proper hostname
3. Enable HTTPS (use reverse proxy like Nginx)
4. Adjust client limits based on expected audience

## Troubleshooting

### Icecast not starting

```bash
docker-compose logs icecast
```

### Can't connect to stream

1. Check Icecast is running: `docker ps`
2. Verify port 8000 is accessible
3. Check CORS headers in icecast.xml

### No audio playing

1. Verify source is connected (check http://localhost:8000/admin/)
2. Check browser console for errors
3. Test with VLC to isolate issue

## Security Notes

- Change default passwords in production
- Use HTTPS for production (reverse proxy)
- Restrict admin access by IP if possible
- Monitor listener counts and bandwidth
