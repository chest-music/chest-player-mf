import React from 'react';
import { usePlayer } from '../../core/context/PlayerProvider';

const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const NextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
  </svg>
);

const PreviousIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
  </svg>
);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PlayerMobile = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    playlist,
    currentIndex,
    isPlayerOpen,
    togglePlayer
  } = usePlayer();

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    seek(newTime);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isPlayerOpen) {
    // Mini player
    return (
      <div 
        onClick={togglePlayer}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: 'var(--player-bg)',
          color: 'var(--player-text)',
          borderTop: '1px solid var(--player-border)',
          height: '80px',
          cursor: 'pointer'
        }}
      >
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
        
        <div style={{ flex: 1, minWidth: 0 }}>
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

        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          style={{
            padding: '8px',
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
      </div>
    );
  }

  // Full player
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--player-bg)',
      color: 'var(--player-text)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--player-border)'
      }}>
        <button
          onClick={togglePlayer}
          style={{
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: 'var(--player-text)',
            fontSize: '14px'
          }}
        >
          ▼ Close
        </button>
        <div style={{ fontSize: '16px', fontWeight: '600' }}>
          Now Playing
        </div>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* Track Art */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <img
          src={currentTrack.cover || 'https://via.placeholder.com/300x300/374151/9ca3af?text=🎵'}
          alt={currentTrack.title}
          style={{
            width: '280px',
            height: '280px',
            borderRadius: '8px',
            objectFit: 'cover',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}
        />
      </div>

      {/* Track Info */}
      <div style={{
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px'
        }}>
          {currentTrack.title}
        </div>
        <div style={{
          fontSize: '18px',
          color: '#9ca3af',
          marginBottom: '24px'
        }}>
          {currentTrack.artist}
        </div>

        {/* Progress Bar */}
        <div style={{
          marginBottom: '16px'
        }}>
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleProgressChange}
            style={{
              width: '100%',
              height: '6px',
              background: `linear-gradient(to right, var(--player-accent) 0%, var(--player-accent) ${progressPercentage}%, var(--player-border) ${progressPercentage}%, var(--player-border) 100%)`
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#9ca3af',
            marginTop: '8px'
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <button
            onClick={previousTrack}
            disabled={currentIndex === 0}
            style={{
              padding: '12px',
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
              padding: '16px',
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
              padding: '12px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: currentIndex >= playlist.length - 1 ? '#6b7280' : 'var(--player-text)',
              cursor: currentIndex >= playlist.length - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <NextIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerMobile;