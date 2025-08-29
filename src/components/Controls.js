/* shuffle button disabled */

import * as React from 'react';
const { useRef, useCallback, useEffect } = React;

import RepeatIcon from '../assets/images/icon-repeat.svg';
import NextIcon from '../assets/images/icon-next.svg';
import PreviousIcon from '../assets/images/icon-previous.svg';
import ShuffleIcon from '../assets/images/icon-shuffle.svg';
import PlayIcon from '../assets/images/icon-play.svg';
import PauseIcon from '../assets/images/icon-pause.svg';

// Get playlist actions from injected dependencies
const getPlaylistActions = () => {
  if (typeof window !== 'undefined' && window.__CHEST_PLAYER_DEPS__?.playlistActions) {
    return window.__CHEST_PLAYER_DEPS__.playlistActions;
  }
  return {
    play: () => console.log('Play action not injected'),
    next: () => console.log('Next action not injected'),
    previous: () => console.log('Previous action not injected'),
    playing: () => console.log('Playing action not injected'),
    toggleShuffle: () => console.log('ToggleShuffle action not injected')
  };
};

// Get playlist state from injected dependencies
const getPlaylistState = () => {
  if (typeof window !== 'undefined' && window.__CHEST_PLAYER_DEPS__?.reduxProps?.playlistState) {
    return window.__CHEST_PLAYER_DEPS__.reduxProps.playlistState;
  }
  return {
    shuffle: false,
    context: 'my-chest'
  };
};

export default function Controls({
  audioRef,
  progressBarRef,
  duration,
  setTimeProgress,
  setLoop,
  loop,
  dispatch,
  playlist,
  mobileExpanded = false
}) {
  const playAnimationRef = useRef();
  const { play, next, previous, playing, toggleShuffle } = getPlaylistActions();
  const playlistState = getPlaylistState();

  const repeat = useCallback(() => {
    if (audioRef.current && progressBarRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
  
      setTimeProgress(currentTime);
  
      progressBarRef.current.value = currentTime;
      
      progressBarRef.current.style.setProperty(
        '--range-progress',
        `${(progressBarRef.current.value / duration) * 100}%`
      );
        
      playAnimationRef.current = requestAnimationFrame(repeat);
    }
  }, [audioRef, duration, progressBarRef, setTimeProgress]);

  const togglePlayPause = () => {
    play()
  }
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Solo manejar la barra espaciadora si no estamos en un input o textarea
      if (event.keyCode === 32 && 
          event.target.tagName !== 'INPUT' && 
          event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        play();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [play]);

  const toggleLoop = () => {
    setLoop(prev => !prev);
  }

  const skipForward = () => {
    next();
  }

  const skipBackward = () => {
    previous();
  }

  const handleToggleShuffle = () => {
    toggleShuffle();
  }

  const handleTrackEnd = () => {
    if (playlist[0]?.token) {
     
      return;
    }

    if (playlist.length > 1) {
      // Si hay más temas, pasamos al siguiente
      next();
    } else {
      // Si no hay más temas:
      // 1. Reiniciamos el tiempo a 0
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      // 2. Actualizamos el estado para mostrar el ícono de play
      const currentTrack = playlist[0];
      playing({
        ...currentTrack,
        isPlaying: false
      });
    }
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleTrackEnd);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleTrackEnd);
      }
    };
  }, [audioRef.current, playlist]);

  useEffect(() => {
    if (playlist[0]?.isPlaying) {
      let playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .catch(() => {
            audioRef.current.pause();
          })
      }
    } else {
      audioRef.current.pause();
    }

    if (loop) {
      audioRef.current.loop = true;
    } else {
      audioRef.current.loop = false;
    }

    playAnimationRef.current = requestAnimationFrame(repeat);

  }, [loop, audioRef, repeat, playlist]);

  if (mobileExpanded) {
    return (
      <div className='w-full px-4 flex items-center justify-between'>
        {/* Shuffle (Left) */}
        <button 
          type='button' 
          className={`${playlistState.shuffle ? 'text-brand-gold' : 'text-neutral-silver-200 hover:text-white'}`}
          onClick={handleToggleShuffle}
        >
          <ShuffleIcon width={20} height={20} />
        </button>
        
        {/* Center controls (Previous, Play/Pause, Next) */}
        <div className='flex items-center gap-6'>
          <button type='button' onClick={skipBackward} className='text-neutral-silver-200 hover:text-white'>
            <PreviousIcon width={24} height={24} />
          </button>
          
          <button type='button' onClick={togglePlayPause} className='text-white hover:scale-105 transition-transform'>
            {playlist[0]?.isPlaying ?
              <PauseIcon width={34} height={34} /> :
              <PlayIcon width={34} height={34} />
            }
          </button>
          
          <button type='button' onClick={skipForward} className='text-neutral-silver-200 hover:text-white'>
            <NextIcon width={24} height={24} />
          </button>
        </div>
        
        {/* Repeat (Right) */}
        <button
          type='button'
          className={`${loop ? 'text-white' : 'text-neutral-silver-200 hover:text-white'}`}
          onClick={toggleLoop}>
          <RepeatIcon width={20} height={20} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className='flex items-center'>
        <button 
          type='button' 
          className={`p-2 mr-2 ${playlistState.shuffle ? 'player-controls-active' : 'player-controls'}`}
          onClick={handleToggleShuffle}
        >
          <ShuffleIcon />
        </button>
        <button type='button' onClick={skipBackward} className='p-2 player-controls'>
          <PreviousIcon />
        </button>
        <button type='button' onClick={togglePlayPause} className='player-controls'>
          {playlist[0]?.isPlaying ?
            <PauseIcon width={40} height={40} /> :
            <PlayIcon width={40} height={40} />
          }
        </button>
        <button type='button' onClick={skipForward} className='p-2 player-controls'>
          <NextIcon />
        </button>
        <button
          type='button'
          className={`p-2 ml-2 ${loop ? 'player-controls-active' : 'player-controls'}`}
          onClick={toggleLoop}>
          <RepeatIcon />
        </button>
      </div>
    </>
  )
}