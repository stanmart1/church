import { useState, useEffect } from 'react';

interface StreamControlsProps {
  isLive: boolean;
  onToggleLive: (live: boolean) => void;
  loading?: boolean;
  currentStreamId?: string | null;
  onAudioLevelChange?: (level: number) => void;
  selectedInputDevice?: string;
  selectedOutputDevice?: string;
  shouldResumeAudio?: boolean;
  uploadUrl?: string;
}

function ShareStreamModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const streamUrl = `${window.location.origin}/live/stream`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(streamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-bold mb-4">Share Stream</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Stream URL</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={streamUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StreamControls({ isLive, onToggleLive, loading, onAudioLevelChange, selectedInputDevice, selectedOutputDevice, shouldResumeAudio, uploadUrl }: StreamControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [inputGain, setInputGain] = useState(65);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioSettings, setAudioSettings] = useState({
    bitrate: 128000,
    sampleRate: 44100,
    channels: 2,
    codec: 'audio/webm;codecs=opus'
  });

  useEffect(() => {
    if (shouldResumeAudio && isLive && !audioContext) {
      initializeAudio();
    }
  }, [shouldResumeAudio, isLive]);

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: selectedInputDevice ? {
          deviceId: { exact: selectedInputDevice },
          sampleRate: audioSettings.sampleRate,
          channelCount: audioSettings.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } : {
          sampleRate: audioSettings.sampleRate,
          channelCount: audioSettings.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });
      
      const ctx = new AudioContext({ sampleRate: audioSettings.sampleRate });
      const source = ctx.createMediaStreamSource(stream);
      const gain = ctx.createGain();
      gain.gain.value = inputGain / 100;
      source.connect(gain);
      
      const dest = ctx.createMediaStreamDestination();
      gain.connect(dest);
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      gain.connect(analyser);
      
      if (selectedOutputDevice && 'setSinkId' in AudioContext.prototype) {
        try {
          await (ctx as any).setSinkId(selectedOutputDevice);
        } catch (error) {
          console.error('Error setting output device:', error);
        }
      }
      
      gain.connect(ctx.destination);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        onAudioLevelChange?.(average);
        if (ctx.state === 'running') {
          requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();
      
      setAudioContext(ctx);
      setGainNode(gain);
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  };

  const handleGoLive = async () => {
    if (!isLive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: selectedInputDevice ? {
            deviceId: { exact: selectedInputDevice },
            sampleRate: audioSettings.sampleRate,
            channelCount: audioSettings.channels,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false
          } : {
            sampleRate: audioSettings.sampleRate,
            channelCount: audioSettings.channels,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false
          }
        });
        
        const ctx = new AudioContext({ sampleRate: audioSettings.sampleRate });
        const source = ctx.createMediaStreamSource(stream);
        const gain = ctx.createGain();
        gain.gain.value = inputGain / 100;
        source.connect(gain);
        
        const dest = ctx.createMediaStreamDestination();
        gain.connect(dest);
        
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        gain.connect(analyser);
        
        if (selectedOutputDevice && 'setSinkId' in AudioContext.prototype) {
          try {
            await (ctx as any).setSinkId(selectedOutputDevice);
          } catch (error) {
            console.error('Error setting output device:', error);
          }
        }
        
        gain.connect(ctx.destination);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          onAudioLevelChange?.(average);
          if (ctx.state === 'running') {
            requestAnimationFrame(updateLevel);
          }
        };
        updateLevel();
        
        setAudioContext(ctx);
        setGainNode(gain);

        if (uploadUrl) {
          console.log('Starting MediaRecorder with uploadUrl:', uploadUrl);
          const recorder = new MediaRecorder(dest.stream, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 128000
          });

          recorder.ondataavailable = async (event) => {
            if (event.data.size > 0) {
              try {
                const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
                const url = uploadUrl.startsWith('/api') 
                  ? `${baseUrl}${uploadUrl}` 
                  : `${baseUrl}/api${uploadUrl}`;
                const response = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/octet-stream' },
                  body: event.data
                });
                if (!response.ok) console.error('Upload failed:', response.status);
              } catch (error) {
                console.error('Error uploading chunk:', error);
              }
            }
          };

          recorder.start(4000);
          setMediaRecorder(recorder);
        } else {
          console.error('No uploadUrl provided!');
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone');
        return;
      }
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setMediaRecorder(null);
      }
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
        setGainNode(null);
      }
    }
    onToggleLive(!isLive);
  };

  const handleMuteToggle = () => {
    if (gainNode) {
      if (isMuted) {
        gainNode.gain.value = inputGain / 100;
      } else {
        gainNode.gain.value = 0;
      }
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="p-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoLive}
              disabled={loading}
              className={`flex items-center px-6 py-3 rounded-lg font-medium cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                isLive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <i className={`${isLive ? 'ri-stop-circle-line' : 'ri-mic-line'} mr-2 text-lg`}></i>
              {loading ? 'Processing...' : isLive ? 'Stop Stream' : 'Go Live'}
            </button>
            
            {isLive && (
              <>
                <button
                  onClick={handleMuteToggle}
                  className={`relative p-3 rounded-lg cursor-pointer ${
                    isMuted 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {!isMuted && audioLevel > 10 && (
                    <div className="absolute inset-0 rounded-lg border-2 border-green-500 animate-pulse"></div>
                  )}
                  <div className="w-5 h-5 flex items-center justify-center relative z-10">
                    <i className={isMuted ? 'ri-mic-off-line' : 'ri-mic-line'}></i>
                  </div>
                </button>
                
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-xs text-gray-600">Gain</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputGain}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setInputGain(val);
                      if (gainNode && !isMuted) {
                        gainNode.gain.value = val / 100;
                      }
                    }}
                    className="w-16"
                  />
                  <span className="text-xs text-gray-500 w-8">{inputGain}%</span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {isLive && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Broadcasting</span>
              </div>
            )}
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Stream Settings"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-settings-3-line"></i>
              </div>
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Share Stream"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-share-line"></i>
              </div>
            </button>
          </div>
        </div>
      </div>
      

      <ShareStreamModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
      <StreamSettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        settings={audioSettings}
        onSave={setAudioSettings}
        isLive={isLive}
      />
    </div>
  );
}

interface StreamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    bitrate: number;
    sampleRate: number;
    channels: number;
    codec: string;
  };
  onSave: (settings: any) => void;
  isLive: boolean;
}

function StreamSettingsModal({ isOpen, onClose, settings, onSave, isLive }: StreamSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-bold mb-4">Stream Settings</h3>
          {isLive && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <i className="ri-alert-line mr-1"></i>
                Settings cannot be changed while streaming is active
              </p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bitrate</label>
              <select
                value={localSettings.bitrate}
                onChange={(e) => setLocalSettings({ ...localSettings, bitrate: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isLive}
              >
                <option value="64000">64 kbps</option>
                <option value="96000">96 kbps</option>
                <option value="128000">128 kbps</option>
                <option value="192000">192 kbps</option>
                <option value="256000">256 kbps</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sample Rate</label>
              <select
                value={localSettings.sampleRate}
                onChange={(e) => setLocalSettings({ ...localSettings, sampleRate: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isLive}
              >
                <option value="22050">22.05 kHz</option>
                <option value="44100">44.1 kHz</option>
                <option value="48000">48 kHz</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
              <select
                value={localSettings.channels}
                onChange={(e) => setLocalSettings({ ...localSettings, channels: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isLive}
              >
                <option value="1">Mono</option>
                <option value="2">Stereo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Codec</label>
              <select
                value={localSettings.codec}
                onChange={(e) => setLocalSettings({ ...localSettings, codec: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isLive}
              >
                <option value="audio/webm;codecs=opus">Opus (WebM)</option>
                <option value="audio/mp4">AAC (MP4)</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={isLive}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
