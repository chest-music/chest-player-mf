// Utility functions for the player micro-frontend

export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const calculateProgress = (currentTime, duration) => {
  if (!duration || duration === 0) return 0;
  return Math.min((currentTime / duration) * 100, 100);
};

export const generatePlaylistId = () => {
  return `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const validateTrack = (track) => {
  if (!track || typeof track !== 'object') return false;
  
  const required = ['id', 'title', 'artist', 'src'];
  return required.every(field => track.hasOwnProperty(field) && track[field]);
};

export const sanitizeTrack = (track) => {
  if (!validateTrack(track)) {
    throw new Error('Invalid track object');
  }
  
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album || '',
    src: track.src,
    cover: track.cover || '',
    duration: track.duration || 0,
    genre: track.genre || '',
    year: track.year || null,
    // Custom fields for Chest Music
    playCount: track.playCount || 0,
    token: track.token || null,
    isShared: track.isShared || false,
    playLimit: track.playLimit || null
  };
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getNextTrackIndex = (currentIndex, playlistLength, isRepeat = false, isShuffle = false) => {
  if (playlistLength === 0) return -1;
  
  if (isShuffle) {
    // For shuffle, generate random index that's not the current one
    if (playlistLength === 1) return 0;
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * playlistLength);
    } while (nextIndex === currentIndex);
    return nextIndex;
  }
  
  const nextIndex = currentIndex + 1;
  
  if (nextIndex >= playlistLength) {
    return isRepeat ? 0 : -1;
  }
  
  return nextIndex;
};

export const getPreviousTrackIndex = (currentIndex, playlistLength, isRepeat = false) => {
  if (playlistLength === 0) return -1;
  
  const prevIndex = currentIndex - 1;
  
  if (prevIndex < 0) {
    return isRepeat ? playlistLength - 1 : -1;
  }
  
  return prevIndex;
};

export const detectMobileDevice = () => {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const loadAudioWithFallback = async (src, fallbacks = []) => {
  const tryLoad = (url) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => resolve(audio);
      audio.onerror = reject;
      audio.src = url;
    });
  };
  
  const sources = [src, ...fallbacks];
  
  for (const source of sources) {
    try {
      const audio = await tryLoad(source);
      return audio;
    } catch (error) {
      console.warn(`Failed to load audio from ${source}:`, error);
    }
  }
  
  throw new Error('All audio sources failed to load');
};

export const createAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    console.warn('Web Audio API not supported');
    return null;
  }
  
  try {
    return new AudioContext();
  } catch (error) {
    console.warn('Failed to create AudioContext:', error);
    return null;
  }
};

// Storage utilities for offline support
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const clearStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

// Player state persistence
export const STORAGE_KEYS = {
  PLAYER_STATE: 'chest_player_state',
  PLAYLIST: 'chest_player_playlist',
  VOLUME: 'chest_player_volume',
  PREFERENCES: 'chest_player_preferences'
};

export const savePlayerState = (state) => {
  const stateToSave = {
    volume: state.volume,
    isMuted: state.isMuted,
    isRepeat: state.isRepeat,
    isShuffle: state.isShuffle,
    currentIndex: state.currentIndex,
    timestamp: Date.now()
  };
  
  saveToStorage(STORAGE_KEYS.PLAYER_STATE, stateToSave);
};

export const loadPlayerState = () => {
  const state = loadFromStorage(STORAGE_KEYS.PLAYER_STATE);
  
  if (!state) return null;
  
  // Don't restore state if it's older than 24 hours
  const isStale = Date.now() - state.timestamp > 24 * 60 * 60 * 1000;
  
  if (isStale) {
    clearStorage(STORAGE_KEYS.PLAYER_STATE);
    return null;
  }
  
  return state;
};