/* shuffle button disabled */

import React, { useRef, useCallback, useEffect } from 'react';

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
    play: () => {},
    next: () => {},
    previous: () => {},
    playing: () => {}
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
  playlist
}) {
  const playAnimationRef = useRef();
  const { play, next, previous } = getPlaylistActions();

  const repeat = useCallback(() => {
    if (audioRef.current) {
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
    dispatch(play())
  }
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Solo manejar la barra espaciadora si no estamos en un input o textarea
      if (event.keyCode === 32 && 
          event.target.tagName !== 'INPUT' && 
          event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();  
        dispatch(play())
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  const toggleLoop = () => {
    setLoop(prev => !prev);
  }

  const skipForward = () => {
    if (playlist[0]?.token) {
      // Si estamos en la página compartida, no hacemos nada
      return;
    }
    // Cambiar al siguiente tema
    dispatch(next());
  }

  const skipBackward = () => {
    if (playlist[0]?.token) {
  
      return;
    }

    dispatch(previous());
  }

  const handleTrackEnd = () => {
    if (playlist[0]?.token) {
     
      return;
    }

    if (playlist.length > 1) {
      // Si hay más temas, pasamos al siguiente
      dispatch(next());
    } else {
      // Si no hay más temas:
      // 1. Reiniciamos el tiempo a 0
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      // 2. Actualizamos el estado para mostrar el ícono de play
      const currentTrack = playlist[0];
      dispatch(playing({
        ...currentTrack,
        isPlaying: false
      }));
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
          .catch(error => {
            console.log(error);
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

  return (
    <>
      <div className='flex items-center'>
        <button type='button' className='p-2 mr-2 disabled:opacity-30' disabled>
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