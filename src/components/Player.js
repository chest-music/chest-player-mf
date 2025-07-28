import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useMediaQuery from '../hooks/useMediaQuery';
import { useModal } from '../hooks/useModal';

import ProgressBar from './ProgressBar';
import ProgressBarMobile from './ProgressBarMobile';
import WaveformProgressBar from './WaveformProgressBar';
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

export default function Player({ waveform = true }) {
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

  const audioRef = useRef();
  const progressBarRef = useRef();

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

  const onLoadedMetadata = () => {
    const seconds = audioRef.current.duration;
    setDuration(seconds);
    if (!waveform && progressBarRef.current) {
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
          cover_url: currentTrack.cover,
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
              cover_url: currentTrack.cover,
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
        console.error('Error updating play count:', error);
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
                    waveform,
                  }}
                />
                {waveform ? (
                  <WaveformProgressBar
                    {...{
                      timeProgress,
                      duration,
                      audioRef,
                      open,
                      playlist,
                      currentTrack: trackList,
                    }}
                  />
                ) : (
                  <ProgressBar
                    {...{
                      progressBarRef,
                      audioRef,
                      timeProgress,
                      duration,
                      playlist,
                    }}
                  />
                )}
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
                  <div className='flex flex-row min-w-0 w-full' onClick={toggleOpen}>
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
                  <div className='bg-neutral-silver-700 rounded-3xl mb-3 gap-5 flex flex-col'>
                    <div className='px-2 pt-2 flex flex-row justify-between'>
                      <button type='button' className='p-2.5' onClick={toggleOpen}>
                        <ChevronDownIcon className='h-6 w-6 text-white' />
                      </button>
                      {/* <button type='button' className='p-2.5' >
                        <EllipsisHorizontalIcon className='h-6 w-6 text-white' onClick={()=>console.log(trackList)} />
                      </button> */}
                    </div>
                    <TrackMobile
                      {...{
                        currentTrack: trackList,
                        audioRef,
                        setDuration,
                        progressBarRef,
                        open,
                        dispatch,
                        playlist,
                      }}
                    />
                  </div>
                )}
                <div className={`${open && 'bg-neutral-silver-600 px-5 pb-5 pt-4 rounded-3xl flex flex-col gap-1.5'}`}>
                  <div className={`${open && 'flex items-center justify-center gap-1.5'}`}>
                    {open && (
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
                          waveform,
                        }}
                      />
                    )}
                  </div>
                  {waveform ? (
                    <WaveformProgressBar
                      {...{
                        timeProgress,
                        duration,
                        audioRef,
                        open,
                        playlist,
                        currentTrack: trackList,
                      }}
                    />
                  ) : (
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
                  )}
                </div>
              </div>
              {open && <div className='absolute top-0 left-0 w-screen h-screen bg-neutral-black'></div>}
            </>
          )}
        </>
      )}
    </>
  );
}
