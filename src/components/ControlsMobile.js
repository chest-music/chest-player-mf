/* shuffle button disabled */

import * as React from 'react';
const { useRef, useState, useCallback, useEffect } = React;

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
    playing: () => {}
  };
};

export default function ControlsMobile({
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
  const { play, playing } = getPlaylistActions();

  const repeat = useCallback(() => {
    if (!audioRef.current || !progressBarRef.current) return;

    try {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
  
      setTimeProgress(currentTime);
  
      // Additional null check before accessing progressBarRef.current.value
      if (progressBarRef.current) {
        progressBarRef.current.value = currentTime;
        
        progressBarRef.current.style.setProperty(
          '--range-progress',
          `${(progressBarRef.current.value / duration) * 100}%`
        );
      }
  
      playAnimationRef.current = requestAnimationFrame(repeat);
    } catch (error) {
      // Error in repeat - silently handle
      cancelAnimationFrame(playAnimationRef.current);
    }
  }, [audioRef, progressBarRef, setTimeProgress]);

  const togglePlayPause = (e) => {
    e.stopPropagation();
    play();
  }

  const toggleLoop = () => {
    setLoop(prev => !prev);
  }

  const skipForward = () => {
    audioRef.current.currentTime += 15
  }

  const skipBackward = () => {
    audioRef.current.currentTime -= 15;
  }

  useEffect(() => {
    if (!audioRef.current?.src) return;
    
    playAnimationRef.current = requestAnimationFrame(repeat);

    return () => {
      if (playAnimationRef.current) {
        cancelAnimationFrame(playAnimationRef.current);
      }
    };
  }, [repeat, audioRef.current?.src]);

  // Handle playlist play state changes for mobile autoplay
  useEffect(() => {
    if (playlist[0]?.isPlaying && audioRef.current) {
      let playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .catch(() => {
            // Mobile autoplay blocked - user gesture required
            audioRef.current.pause();
          });
      }
    } else if (!playlist[0]?.isPlaying && audioRef.current) {
      audioRef.current.pause();
    }

    playAnimationRef.current = requestAnimationFrame(repeat);
  }, [playlist[0]?.isPlaying, audioRef, repeat]);

  return (
    <>
      <div className='flex items-center'>
        {/* <button type='button' className='p-2 mr-2 disabled:opacity-30' disabled>
          <ShuffleIcon />
        </button>
        <button type='button' onClick={skipBackward} className='p-2 player-controls'>
          <PreviousIcon />
        </button> */}
        <button type='button' onClick={togglePlayPause} className='player-controls'>
          {playlist[0]?.isPlaying ?
            <PauseIcon width={40} height={40} /> :
            <PlayIcon width={40} height={40} />
          }
        </button>
        {/* <button type='button' onClick={skipForward} className='p-2 player-controls'>
          <NextIcon />
        </button>
        <button 
          type='button' 
          className={`p-2 ml-2 ${loop ? 'player-controls-active' : 'player-controls'}`} 
          onClick={toggleLoop}>
          <RepeatIcon />
        </button> */}
      </div>
    </>
  )
}