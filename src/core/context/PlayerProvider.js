import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import useAudioPlayer from '../hooks/useAudioPlayer';

// Player Context
const PlayerContext = createContext(null);

// Initial state
const initialState = {
  playlist: [],
  currentIndex: 0,
  isRepeat: false,
  isShuffle: false,
  isPlayerOpen: false,
  // Shared link support
  playCount: 0,
  playLimit: null,
  hasDecremented: false,
  // Play tracking
  lastPlayPosition: 0,
  significantPlayTime: false,
  hasStartedFromBeginning: false,
  // UI State
  loop: false
};

// Reducer
const playerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload,
        currentIndex: 0
      };
    
    case 'ADD_TO_PLAYLIST':
      return {
        ...state,
        playlist: [...state.playlist, action.payload]
      };
    
    case 'REMOVE_FROM_PLAYLIST':
      const newPlaylist = state.playlist.filter((_, index) => index !== action.payload);
      return {
        ...state,
        playlist: newPlaylist,
        currentIndex: state.currentIndex >= action.payload && state.currentIndex > 0 
          ? state.currentIndex - 1 
          : state.currentIndex
      };
    
    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        currentIndex: action.payload
      };
    
    case 'NEXT_TRACK':
      let nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.playlist.length) {
        nextIndex = state.isRepeat ? 0 : state.currentIndex;
      }
      return {
        ...state,
        currentIndex: nextIndex
      };
    
    case 'PREVIOUS_TRACK':
      let prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.isRepeat ? state.playlist.length - 1 : 0;
      }
      return {
        ...state,
        currentIndex: prevIndex
      };
    
    case 'TOGGLE_REPEAT':
      return {
        ...state,
        isRepeat: !state.isRepeat
      };
    
    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        isShuffle: !state.isShuffle
      };
    
    case 'TOGGLE_PLAYER':
      return {
        ...state,
        isPlayerOpen: !state.isPlayerOpen
      };
    
    case 'SET_PLAYER_OPEN':
      return {
        ...state,
        isPlayerOpen: action.payload
      };
    
    case 'SET_PLAY_COUNT':
      return {
        ...state,
        playCount: action.payload
      };
    
    case 'SET_PLAY_LIMIT':
      return {
        ...state,
        playLimit: action.payload
      };
    
    case 'DECREMENT_PLAY_COUNT':
      return {
        ...state,
        playCount: Math.max(0, state.playCount - 1),
        hasDecremented: true
      };
    
    case 'SET_LAST_PLAY_POSITION':
      return {
        ...state,
        lastPlayPosition: action.payload
      };
    
    case 'SET_SIGNIFICANT_PLAY_TIME':
      return {
        ...state,
        significantPlayTime: action.payload
      };
    
    case 'SET_HAS_STARTED_FROM_BEGINNING':
      return {
        ...state,
        hasStartedFromBeginning: action.payload
      };
    
    case 'RESET_PLAY_TRACKING':
      return {
        ...state,
        lastPlayPosition: 0,
        significantPlayTime: false,
        hasStartedFromBeginning: false,
        hasDecremented: false
      };
    
    case 'TOGGLE_LOOP':
      return {
        ...state,
        loop: !state.loop
      };
    
    default:
      return state;
  }
};

// Provider component
const PlayerProvider = ({ 
  children, 
  initialPlaylist = [],
  onPlayLimitReached,
  onTrackPlay,
  onAPIError,
  apiConfig = {}
}) => {
  const [state, dispatch] = useReducer(playerReducer, {
    ...initialState,
    playlist: initialPlaylist
  });

  const currentTrack = state.playlist[state.currentIndex] || null;
  const audioPlayer = useAudioPlayer(currentTrack);
  
  // Constants for play tracking
  const SIGNIFICANT_PLAY_PERCENTAGE = 15;
  const MINIMUM_PLAY_PERCENTAGE = 15;
  
  // Track if this is a shared link
  const isSharedLink = !!currentTrack?.token;

  // Actions
  const setPlaylist = useCallback((playlist) => {
    dispatch({ type: 'SET_PLAYLIST', payload: playlist });
  }, []);

  const addToPlaylist = useCallback((track) => {
    dispatch({ type: 'ADD_TO_PLAYLIST', payload: track });
  }, []);

  const removeFromPlaylist = useCallback((index) => {
    dispatch({ type: 'REMOVE_FROM_PLAYLIST', payload: index });
  }, []);

  const playTrack = useCallback((index) => {
    dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
    audioPlayer.play();
  }, [audioPlayer]);

  const nextTrack = useCallback(() => {
    dispatch({ type: 'NEXT_TRACK' });
  }, []);

  const previousTrack = useCallback(() => {
    dispatch({ type: 'PREVIOUS_TRACK' });
  }, []);

  const toggleRepeat = useCallback(() => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  }, []);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  }, []);

  const togglePlayer = useCallback(() => {
    dispatch({ type: 'TOGGLE_PLAYER' });
  }, []);

  const setPlayerOpen = useCallback((isOpen) => {
    dispatch({ type: 'SET_PLAYER_OPEN', payload: isOpen });
  }, []);

  const toggleLoop = useCallback(() => {
    dispatch({ type: 'TOGGLE_LOOP' });
  }, []);

  // Original play function - just toggles isPlaying like Redux version
  const play = useCallback(() => {
    if (currentTrack) {
      audioPlayer.togglePlay();
    }
  }, [currentTrack, audioPlayer]);

  // Advanced play tracking functions
  const checkPlayLimit = useCallback(() => {
    if (isSharedLink && state.playLimit !== null && state.playCount >= state.playLimit) {
      if (onPlayLimitReached) {
        onPlayLimitReached();
      }
      audioPlayer.pause();
      return true;
    }
    return false;
  }, [isSharedLink, state.playLimit, state.playCount, onPlayLimitReached, audioPlayer]);

  const decrementPlayCount = useCallback(async () => {
    if (isSharedLink && state.playCount > 0 && !state.hasDecremented) {
      dispatch({ type: 'DECREMENT_PLAY_COUNT' });
      
      // Call API if callback provided
      if (onTrackPlay && currentTrack) {
        try {
          await onTrackPlay(currentTrack, 'decrement');
        } catch (error) {
          if (onAPIError) {
            onAPIError(error);
          }
        }
      }
    }
  }, [isSharedLink, state.playCount, state.hasDecremented, onTrackPlay, currentTrack, onAPIError]);

  const shouldCountAsNewPlay = useCallback((currentTime, previousTime) => {
    if (!audioPlayer.duration) return false;

    const significantTime = audioPlayer.duration * (SIGNIFICANT_PLAY_PERCENTAGE / 100);
    const isNearStart = currentTime < significantTime;
    const hasJumpedBack = previousTime > currentTime;
    const wasSignificantlyAhead = previousTime > significantTime;

    return hasJumpedBack && isNearStart && (state.significantPlayTime || wasSignificantlyAhead);
  }, [audioPlayer.duration, state.significantPlayTime, SIGNIFICANT_PLAY_PERCENTAGE]);

  const updatePlayCount = useCallback(async () => {
    if (currentTrack && onTrackPlay) {
      try {
        await onTrackPlay(currentTrack, 'increment');
      } catch (error) {
        if (onAPIError) {
          onAPIError(error);
        }
      }
    }
  }, [currentTrack, onTrackPlay, onAPIError]);

  // Enhanced play function with limit checking
  const playWithLimitCheck = useCallback(() => {
    if (checkPlayLimit()) {
      return false;
    }
    
    const currentTime = audioPlayer.currentTime || 0;
    
    if (currentTime < audioPlayer.duration * (SIGNIFICANT_PLAY_PERCENTAGE / 100) && !state.hasDecremented) {
      dispatch({ type: 'SET_SIGNIFICANT_PLAY_TIME', payload: false });
      decrementPlayCount();
    }
    
    audioPlayer.play();
    return true;
  }, [checkPlayLimit, audioPlayer, state.hasDecremented, decrementPlayCount, SIGNIFICANT_PLAY_PERCENTAGE]);

  // Handle track changes and initialization
  React.useEffect(() => {
    if (currentTrack) {
      audioPlayer.loadTrack(currentTrack);
      
      // Initialize track-specific data
      dispatch({ type: 'SET_PLAY_COUNT', payload: currentTrack.plays || 0 });
      dispatch({ type: 'SET_PLAY_LIMIT', payload: currentTrack.play_limit || null });
      dispatch({ type: 'RESET_PLAY_TRACKING' });
    }
  }, [currentTrack, audioPlayer]);

  // Handle time tracking and play counting
  React.useEffect(() => {
    if (!audioPlayer.duration) return;

    const currentTime = audioPlayer.currentTime;
    const previousTime = state.lastPlayPosition;

    // Check if we've reached significant play time
    if (currentTime > audioPlayer.duration * (SIGNIFICANT_PLAY_PERCENTAGE / 100)) {
      dispatch({ type: 'SET_SIGNIFICANT_PLAY_TIME', payload: true });
    }

    // Check for new play (rewind detection)
    if (shouldCountAsNewPlay(currentTime, previousTime)) {
      updatePlayCount();
    }

    // Update position
    dispatch({ type: 'SET_LAST_PLAY_POSITION', payload: currentTime });
  }, [audioPlayer.currentTime, audioPlayer.duration, state.lastPlayPosition, shouldCountAsNewPlay, updatePlayCount, SIGNIFICANT_PLAY_PERCENTAGE]);

  // Auto-play next track on end
  React.useEffect(() => {
    if (audioPlayer.currentTime >= audioPlayer.duration && audioPlayer.duration > 0) {
      if (state.isRepeat) {
        audioPlayer.seek(0);
        audioPlayer.play();
      } else {
        nextTrack();
      }
    }
  }, [audioPlayer.currentTime, audioPlayer.duration, state.isRepeat, nextTrack]);

  const value = {
    // State
    ...state,
    currentTrack,
    isSharedLink,
    
    // Audio player
    ...audioPlayer,
    
    // Actions
    setPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    playTrack,
    nextTrack,
    previousTrack,
    toggleRepeat,
    toggleShuffle,
    togglePlayer,
    setPlayerOpen,
    toggleLoop,
    play,
    
    // Advanced functions
    checkPlayLimit,
    decrementPlayCount,
    shouldCountAsNewPlay,
    updatePlayCount,
    playWithLimitCheck,
    
    // Constants
    SIGNIFICANT_PLAY_PERCENTAGE,
    MINIMUM_PLAY_PERCENTAGE
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook to use player context
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export default PlayerProvider;