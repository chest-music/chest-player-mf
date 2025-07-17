import React from 'react';
import { usePlayer } from '../../core/context/PlayerProvider';

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const NextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
  </svg>
);

const PreviousIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
  </svg>
);

const VolumeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PlayerWeb = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    changeVolume,
    toggleMute,
    playlist,
    currentIndex
  } = usePlayer();

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    seek(newTime);
  };

  const handleVolumeChange = (e) => {
    changeVolume(e.target.value / 100);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 20px',
      backgroundColor: 'var(--player-bg)',
      color: 'var(--player-text)',
      borderTop: '1px solid var(--player-border)',
      height: '80px'
    }}>
      {/* Track Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '250px'
      }}>
        <img
          src={currentTrack.cover || 'https://via.placeholder.com/48x48/374151/9ca3af?text=🎵'}
          alt={currentTrack.title}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '4px',
            objectFit: 'cover'
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: '600',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentTrack.title}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentTrack.artist}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={previousTrack}
            disabled={currentIndex === 0}
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: currentIndex === 0 ? '#6b7280' : 'var(--player-text)',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <PreviousIcon />
          </button>

          <button
            onClick={togglePlay}
            style={{
              padding: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--player-accent)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            onClick={nextTrack}
            disabled={currentIndex >= playlist.length - 1}
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: currentIndex >= playlist.length - 1 ? '#6b7280' : 'var(--player-text)',
              cursor: currentIndex >= playlist.length - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <NextIcon />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          maxWidth: '500px'
        }}>
          <span style={{ fontSize: '12px', color: '#9ca3af', minWidth: '40px' }}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleProgressChange}
            style={{
              flex: 1,
              height: '4px',
              background: `linear-gradient(to right, var(--player-accent) 0%, var(--player-accent) ${progressPercentage}%, var(--player-border) ${progressPercentage}%, var(--player-border) 100%)`
            }}
          />
          <span style={{ fontSize: '12px', color: '#9ca3af', minWidth: '40px' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '120px'
      }}>
        <button
          onClick={toggleMute}
          style={{
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: isMuted ? '#6b7280' : 'var(--player-text)'
          }}
        >
          <VolumeIcon />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume * 100}
          onChange={handleVolumeChange}
          style={{
            width: '80px',
            height: '4px'
          }}
        />
      </div>
    </div>
  );
};

export default PlayerWeb;