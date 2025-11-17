import { useState, useEffect, useRef } from 'react';
import { Sermon } from '@/types';
import { getMediaUrl } from '@/services/api';
import { useSermonPlayer } from '@/hooks/useSermonPlayer';

interface AudioPlayerProps {
  sermon: Sermon | null;
  onClose: () => void;
}

export default function AudioPlayer({ sermon, onClose }: AudioPlayerProps) {
  const { incrementPlayCount } = useSermonPlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [hasEnded, setHasEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (sermon && audioRef.current) {
      const audio = audioRef.current;
      audio.src = getMediaUrl(sermon.audio_url) || '';
      
      const savedPosition = localStorage.getItem(`sermon_${sermon.id}_position`);
      
      const handleLoadedMetadata = () => {
        if (savedPosition) {
          audio.currentTime = parseFloat(savedPosition);
        }
        audio.play();
        setIsPlaying(true);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.load();
      if (sermon.id) {
        incrementPlayCount(sermon.id);
      }
    }
  }, [sermon]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (sermon) {
        localStorage.setItem(`sermon_${sermon.id}_position`, audio.currentTime.toString());
      }
    };
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setHasEnded(true);
      if (sermon) {
        localStorage.removeItem(`sermon_${sermon.id}_position`);
      }
    };
    const handleError = () => {
      setIsPlaying(false);
      setError('Connection lost. Trying to reconnect...');
      retryWithBackoff();
    };
    const handleStalled = () => {
      setError('Connection lost. Trying to reconnect...');
    };
    const handleCanPlay = () => {
      setError(null);
      setRetryCount(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('canplay', handleCanPlay);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [sermon]);

  const retryWithBackoff = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    retryTimeoutRef.current = window.setTimeout(() => {
      if (audioRef.current && sermon) {
        const currentPos = audioRef.current.currentTime;
        audioRef.current.load();
        audioRef.current.currentTime = currentPos;
        audioRef.current.play().then(() => {
          setError(null);
          setIsPlaying(true);
          setRetryCount(0);
        }).catch(() => {
          setRetryCount(prev => prev + 1);
          if (retryCount < 5) {
            retryWithBackoff();
          } else {
            setError('Unable to reconnect. Please check your connection.');
          }
        });
      }
    }, delay);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (hasEnded) {
        audioRef.current.currentTime = 0;
        setHasEnded(false);
      }
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && sermon) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, hasEnded, sermon]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sermon) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <audio ref={audioRef} />
      <div className="max-w-7xl mx-auto px-4 py-3">
        {error && (
          <div className="mb-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="ri-error-warning-line text-yellow-600"></i>
              <span className="text-sm text-yellow-800">{error}</span>
            </div>
            {retryCount > 0 && retryCount < 5 && (
              <span className="text-xs text-yellow-600">Retry {retryCount}/5</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4 flex-1">
            {sermon.thumbnail_url ? (
              <img 
                src={getMediaUrl(sermon.thumbnail_url) || ''}
                alt={sermon.title}
                className="w-12 h-12 rounded object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {sermon.title.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{sermon.title}</h4>
              <p className="text-xs text-gray-500 truncate">{sermon.speaker}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => skip(-10)} className="p-2 text-gray-600 hover:text-gray-900">
            <i className="ri-replay-10-line text-xl"></i>
          </button>
          <button onClick={togglePlay} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700">
            <i className={`${hasEnded ? 'ri-restart-line' : isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} text-xl`}></i>
          </button>
          <button onClick={() => skip(10)} className="p-2 text-gray-600 hover:text-gray-900">
            <i className="ri-forward-10-line text-xl"></i>
          </button>

          <div className="flex-1 flex items-center space-x-3">
            <span className="text-xs text-gray-500 w-10">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(currentTime / duration) * 100}%, #E5E7EB ${(currentTime / duration) * 100}%, #E5E7EB 100%)`
              }}
            />
            <span className="text-xs text-gray-500 w-10">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <i className="ri-volume-up-line text-gray-600"></i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
