import * as React from 'react';
const { useEffect, useRef, useState, useCallback } = React;
import { motion } from 'framer-motion';
import useMediaQuery from '../hooks/useMediaQuery';
import { useModal } from '../hooks/useModal';

import ProgressBar from './ProgressBar';
import ProgressBarMobile from './ProgressBarMobile';
import Controls from './Controls';
import ControlsMobile from './ControlsMobile';
import VolumeControls from './VolumeControls';
import Track from './Track';
import TrackMobile from './TrackMobile';

import { ChevronDownIcon } from '@heroicons/react/24/outline';

// These will be injected by the parent app
import '../styles/player.css';

// Get injected dependencies from parent app
const getDependencies = () => {
  if (typeof window !== 'undefined' && window.__CHEST_PLAYER_DEPS__) {
    return window.__CHEST_PLAYER_DEPS__;
  }
  throw new Error('ChestPlayer: Dependencies not provided. Make sure to use PlayerProvider.');
};

export default function Player() {
  const deps = getDependencies();
  const { 
    useLazyGetTrackSourceQuery, 
    useUpdateTrackPlayMutation 
  } = deps.apiHooks;
  const { reset, play } = deps.playlistActions;
  const { closePlayer, openPlayer } = deps.playerActions;
  const { dispatch, playlist, playerState } = deps.reduxProps;
  const [isCounted, setIsCounted] = useState(false);
  const [getTrackSource, getResult] = useLazyGetTrackSourceQuery();
  const [updateTrackPlay, updateResult] = useUpdateTrackPlayMutation();
  const { onOpen: openLimitModal } = useModal('PlayLimitModal');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [loop, setLoop] = useState(false);
  const [timeProgress, setTimeProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackList, setTrackList] = useState();
  const [open, setOpen] = useState(false);
  const [lastPlayed, setLastPlayed] = useState();
  const [playCount, setPlayCount] = useState(0);
  const [playLimit, setPlayLimit] = useState(null);
  const [hasEnded, setHasEnded] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [hasDecremented, setHasDecremented] = useState(false);
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);

  const audioRef = useRef();
  const progressBarRef = useRef();
  const mobilePlayerRef = useRef();

  const isSharedLink = !!playlist[0]?.token;

  const [playStartTime, setPlayStartTime] = useState(null);
  const [hasStartedFromBeginning, setHasStartedFromBeginning] = useState(false);
  const MINIMUM_PLAY_PERCENTAGE = 15;

  const [lastPlayPosition, setLastPlayPosition] = useState(0);
  const [significantPlayTime, setSignificantPlayTime] = useState(false);
  const SIGNIFICANT_PLAY_PERCENTAGE = 15;

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  // Touch handlers for mini player swipe-to-close (horizontal)
  const handleMiniTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setIsSwiping(false);
    setSwipeDistance(0);
  };

  const handleMiniTouchMove = (e) => {
    if (!touchStart) return;
    
    const currentTouch = e.touches[0].clientX;
    const distance = currentTouch - touchStart;
    
    setIsSwiping(true);
    setSwipeDistance(distance);
    
    // Update CSS custom property for animation
    if (mobilePlayerRef.current) {
      mobilePlayerRef.current.style.setProperty('--swipe-distance', `${distance}px`);
    }
  };

  const handleMiniTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const swipeDistanceEnd = Math.abs(touchStart - touchEnd);

    // Reset swipe state
    setIsSwiping(false);
    setSwipeDistance(0);
    
    // Reset CSS custom property
    if (mobilePlayerRef.current) {
      mobilePlayerRef.current.style.setProperty('--swipe-distance', '0px');
    }

    // If swipe > threshold, close player completely
    if (swipeDistanceEnd > 100) {
      dispatch(closePlayer());
    }
    
    setTouchStart(0);
  };

  // Touch handlers for expanded player swipe-to-close (vertical up)
  const [expandedTouchStart, setExpandedTouchStart] = useState(0);
  const [expandedIsSwiping, setExpandedIsSwiping] = useState(false);
  const expandedPlayerRef = useRef();

  const handleExpandedTouchStart = (e) => {
    setExpandedTouchStart(e.touches[0].clientY);
    setExpandedIsSwiping(true);
    if (expandedPlayerRef.current) {
      expandedPlayerRef.current.style.transition = 'none';
    }
  };

  const handleExpandedTouchMove = (e) => {
    if (!expandedTouchStart || !expandedIsSwiping) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - expandedTouchStart; // Downward swipe
    
    // Only allow downward swipe (deltaY positive)
    if (deltaY > 0 && expandedPlayerRef.current) {
      expandedPlayerRef.current.style.transform = `translateY(${deltaY}px)`;
      expandedPlayerRef.current.style.opacity = Math.max(0.3, 1 - (deltaY / 300));
    }
  };

  const handleExpandedTouchEnd = (e) => {
    if (!expandedTouchStart || !expandedIsSwiping) return;
    
    const touchEnd = e.changedTouches[0].clientY;
    const deltaY = touchEnd - expandedTouchStart; // Downward swipe
    
    if (expandedPlayerRef.current) {
      expandedPlayerRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      
      // If swiped down more than 150px, close the player
      if (deltaY > 150) {
        expandedPlayerRef.current.style.transform = 'translateY(100vh)';
        expandedPlayerRef.current.style.opacity = '0';
        
        setTimeout(() => {
          setOpen(false);
          if (expandedPlayerRef.current) {
            expandedPlayerRef.current.style.transform = 'translateY(0)';
            expandedPlayerRef.current.style.opacity = '1';
            expandedPlayerRef.current.style.transition = '';
          }
        }, 300);
      } else {
        // Snap back to original position
        expandedPlayerRef.current.style.transform = 'translateY(0)';
        expandedPlayerRef.current.style.opacity = '1';
        
        setTimeout(() => {
          if (expandedPlayerRef.current) {
            expandedPlayerRef.current.style.transition = '';
          }
        }, 300);
      }
    }
    
    setExpandedTouchStart(0);
    setExpandedIsSwiping(false);
  };


  const onLoadedMetadata = () => {
    const seconds = audioRef.current.duration;
    setDuration(seconds);
    if (progressBarRef.current) {
      progressBarRef.current.max = seconds;
    }
  };


  const checkPlayLimit = () => {
    if (isSharedLink && playLimit !== null && playCount >= playLimit) {
      openLimitModal();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (open) {
      dispatch(openPlayer());
    } else {
      dispatch(closePlayer());
    }
  }, [open]);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    let track = trackList;
    let currentTrack = playlist && playlist[0];

    if (currentTrack) {
      if (typeof track === 'object') {
        if (track.id === currentTrack.id) return;
      }
      setIsCounted(false);
      setPlayCount(currentTrack.plays || 0);
      setPlayLimit(currentTrack.play_limit || null);
      setHasDecremented(false);

      if (currentTrack.audio) {
        setTrackList({
          url: currentTrack.audio,
          cover_url: currentTrack.cover || 'https://cdn.chestmusic.com/cover-default.jpg',
          name: currentTrack.name,
          authors: currentTrack.authors,
          type: currentTrack.type,
          id: currentTrack.id,
          plays: currentTrack.plays,
          play_limit: currentTrack.play_limit,
        });
      } else {
        const session = localStorage.getItem('chestmusic_session_id');
        getTrackSource({ id: currentTrack.id, session }).then(({ data }) => {
          if (data) {
            setTrackList({
              url: data.url,
              cover_url: currentTrack.cover || 'https://cdn.chestmusic.com/cover-default.jpg',
              name: currentTrack.name,
              authors: currentTrack.authors,
              type: currentTrack.type,
              id: currentTrack.id,
              plays: currentTrack.plays,
              play_limit: currentTrack.play_limit,
            });
          }
        });
      }
    }
  }, [playlist, getResult]);

  useEffect(() => {
    if (!trackList) {
      setLastPlayed('');
    } else {
      if (lastPlayed !== trackList.id) {
        setLastPlayed(trackList.id);
      }
    }
  }, [trackList]);

  const getCurrentPlayCount = useCallback(() => {
    if (isSharedLink && trackList?.id && playlist[0]?.token) {
      const storageKey = `plays_${trackList.id}_${playlist[0].token}`;
      const storedCount = localStorage.getItem(storageKey);
      return storedCount ? parseInt(storedCount) : 0;
    }
    return 0;
  }, [isSharedLink, trackList?.id, playlist[0]?.token]);

  useEffect(() => {
    if (isSharedLink && trackList?.id && playlist[0]?.token) {
      // Usar el contador del backend al cargar
      setPlayCount(trackList.plays || 0);

      // Solo marcamos como límite alcanzado si hemos superado el límite
      if ((trackList.plays || 0) > (playlist[0]?.play_limit || 0)) {
        setIsLimitReached(true);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    }
  }, [isSharedLink, trackList?.id, playlist[0]?.token, trackList?.plays]);

  const handlePlayAttempt = () => {
    if (isSharedLink) {
      const currentPlayLimit = playlist[0]?.play_limit;
      if (currentPlayLimit) {
        if (playCount > currentPlayLimit || (playCount >= currentPlayLimit && hasDecremented)) {
          audioRef.current?.pause();
          openLimitModal();
          return false;
        }
      }
    }
    return true;
  };

  const decrementPlayCount = async () => {
    if (isSharedLink && !isLimitReached) {
      try {
        // Actualizar el backend
        await updateTrackPlay({
          id: trackList.id,
          anonymous: true,
          token: playlist[0].token,
        });

        // Actualizar el estado local
        const newPlayCount = playCount + 1;
        setPlayCount(newPlayCount);

        // Solo marcamos como límite alcanzado si hemos superado el límite
        // esto permite que la última reproducción se complete
        if (newPlayCount > playLimit) {
          setIsLimitReached(true);
          openLimitModal();
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
      } catch (error) {
        // Error updating play count - silently handle
      }
    }
  };

  const shouldCountAsNewPlay = (currentTime, previousTime) => {
    if (!duration) return false;

    const significantTime = duration * (SIGNIFICANT_PLAY_PERCENTAGE / 100);
    const isNearStart = currentTime < significantTime;
    const hasJumpedBack = previousTime > currentTime;
    const wasSignificantlyAhead = previousTime > significantTime;

    return hasJumpedBack && isNearStart && (significantPlayTime || wasSignificantlyAhead);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const previousTime = lastPlayPosition;

    if (currentTime > duration * (SIGNIFICANT_PLAY_PERCENTAGE / 100)) {
      setSignificantPlayTime(true);
    }

    setLastPlayPosition(currentTime);
    setTimeProgress(currentTime);
  };

  const handlePlay = () => {
    if (!handlePlayAttempt()) {
      audioRef.current?.pause();
      return;
    }

    const currentTime = audioRef.current?.currentTime || 0;

    if (currentTime < duration * (SIGNIFICANT_PLAY_PERCENTAGE / 100) && !hasDecremented) {
      setSignificantPlayTime(false);
      decrementPlayCount();
      setHasDecremented(true);
    }
  };

  const handleTrackEnd = () => {
    setHasEnded(true);
    setSignificantPlayTime(false);
    setLastPlayPosition(0);
    setHasDecremented(false);
  };

  useEffect(() => {
    if (trackList && playlist[0]?.isPlaying) {
      if (!handlePlayAttempt()) {
        dispatch(play());
        return;
      }
      
      // Actually start audio playback
      if (audioRef.current) {
        let playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .catch(error => {
              // Handle autoplay policy restrictions on mobile
              // Autoplay blocked - user gesture required
            });
        }
      }
    }
  }, [trackList, playlist[0]?.isPlaying]);

  useEffect(() => {
    if (playlist[0]?.id !== lastPlayed) {
      setHasEnded(false);
      setSignificantPlayTime(false);
      setLastPlayPosition(0);
      setHasDecremented(false);
    }
  }, [playlist[0]?.id]);

  return (
    <>
      {trackList && playlist.length > 0 && (
        <>
          <audio
            src={trackList.url}
            ref={audioRef}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={handleTrackEnd}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
          />
          {isSharedLink && playLimit !== null && playLimit > 0 && (
            <div className='fixed bottom-[102px] right-0 left-0 inset-x-0 max-w-max mx-auto z-50'>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className='px-6 py-3 bg-neutral-silver-600 rounded-t-xl'
              >
                <span className='text-brand-gold'>{Math.max(0, playLimit - playCount)}</span> of {playLimit} plays
                remaining
              </motion.div>
            </div>
          )}
          {!isMobile ? (
            <motion.div
              className='audio-player'
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{
                height: 0,
                transition: { delay: 0.7, duration: 1, ease: 'easeIn' },
              }}
            >
              <Track
                {...{
                  currentTrack: trackList,
                  audioRef,
                  setDuration,
                  progressBarRef,
                  dispatch,
                  playlist,
                }}
              />
              <div className='grow flex flex-col items-center justify-center gap-1.5'>
                <Controls
                  {...{
                    audioRef,
                    progressBarRef,
                    duration,
                    setTimeProgress,
                    setLoop,
                    loop,
                    dispatch,
                    playlist,
                  }}
                />
                <ProgressBar
                  {...{
                    progressBarRef,
                    audioRef,
                    timeProgress,
                    duration,
                    playlist,
                  }}
                />
              </div>
              <VolumeControls
                {...{
                  audioRef,
                  dispatch,
                }}
              />
            </motion.div>
          ) : (
            <>
              <div className={`${open ? 'audio-player-mobile-open' : 'audio-player-mobile'}`}>
                {!open ? (
                  <div 
                    ref={mobilePlayerRef}
                    className={`flex flex-row min-w-0 w-full ${isSwiping ? 'swiping' : ''}`}
                    onClick={toggleOpen}
                    onTouchStart={handleMiniTouchStart}
                    onTouchMove={handleMiniTouchMove}
                    onTouchEnd={handleMiniTouchEnd}
                  >
                    <TrackMobile
                      {...{
                        currentTrack: trackList,
                        audioRef,
                        setDuration,
                        progressBarRef,
                        dispatch,
                        playlist,
                      }}
                    />
                    <ControlsMobile
                      {...{
                        audioRef,
                        progressBarRef,
                        duration,
                        setTimeProgress,
                        setLoop,
                        loop,
                        dispatch,
                        playlist,
                      }}
                    />
                  </div>
                ) : (
                  <div className='fixed inset-0 z-50 flex items-center justify-center'>
                    {/* Transparent overlay at 60% */}
                    <div 
                      className='absolute top-0 left-0 w-screen h-screen'
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    ></div>
                    
                    {/* Player container */}
                    <div 
                      ref={expandedPlayerRef}
                      className='relative z-50 backdrop-blur-md rounded-2xl m-4 flex flex-col w-full max-w-sm bg-black'
          
                      onTouchStart={handleExpandedTouchStart}
                      onTouchMove={handleExpandedTouchMove}
                      onTouchEnd={handleExpandedTouchEnd}
                    >
                      {/* Close button */}
                      <div className='absolute top-4 right-4 z-60'>
                        <button 
                          type='button' 
                          className='p-2 test' 
                          onClick={toggleOpen}
                        >
                          <ChevronDownIcon className='h-6 w-6 text-white' />
                        </button>
                      </div>
                      
                      {/* Main content container */}
                      <div className='flex flex-col items-center justify-center px-4 py-4'>
                          {/* Title */}
                          <div className='text-center mb-2'>
                            <span className='font-thunder-bold text-white text-center block' style={{fontSize: '32px', lineHeight: '1.1'}}>
                              {trackList.name}
                            </span>
                          </div>
                          
                          {/* Artist */}
                          <div className='text-center mb-4'>
                            <span className='text-neutral-silver-200' style={{fontSize: '16px'}}>
                              {trackList?.authors?.join(', ')}
                            </span>
                          </div>
                          
                          {/* Cover */}
                          <div className='mb-8 w-full px-4'>
                            <div
                              className='w-full shadow-2xl max-w-sm mx-auto'
                              style={{ 
                                aspectRatio: '1',
                                minHeight: '200px',
                                backgroundImage: `url(${trackList.cover_url || 'https://cdn.chestmusic.com/cover-default.jpg'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                borderRadius: '11px'
                              }}>
                            </div>
                          </div>
                          
                          {/* Progress Bar Container */}
                          <div className='w-full px-4 mb-4'>
                            <ProgressBarMobile
                              {...{
                                progressBarRef,
                                audioRef,
                                timeProgress,
                                duration,
                                open,
                                playlist,
                              }}
                            />
                          </div>
                          
                          {/* Controls with mobile expanded layout */}
                          <Controls
                            {...{
                              audioRef,
                              progressBarRef,
                              duration,
                              setTimeProgress,
                              setLoop,
                              loop,
                              dispatch,
                              playlist,
                              mobileExpanded: true
                            }}
                          />
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
