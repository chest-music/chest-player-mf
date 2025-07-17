import React, { createContext, useContext, useReducer, useCallback } from 'react';
import useAudioPlayer from '../hooks/useAudioPlayer';

// Player Context
const PlayerContext = createContext(null);

// Initial state
const initialState = {
  playlist: [],
  currentIndex: 0,
  isRepeat: false,
  isShuffle: false,
  isPlayerOpen: false
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
    
    default:
      return state;
  }
};

// Provider component
const PlayerProvider = ({ children, initialPlaylist = [] }) => {
  const [state, dispatch] = useReducer(playerReducer, {
    ...initialState,
    playlist: initialPlaylist
  });

  const currentTrack = state.playlist[state.currentIndex] || null;
  const audioPlayer = useAudioPlayer(currentTrack);

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

  // Handle track changes
  React.useEffect(() => {
    if (currentTrack) {
      audioPlayer.loadTrack(currentTrack);
    }
  }, [currentTrack, audioPlayer]);

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
    setPlayerOpen
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