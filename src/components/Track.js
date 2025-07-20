import React, { useEffect, useCallback } from 'react';
import { playing as playingAction } from '../app/playlist';

export default function Track({
  currentTrack,
  audioRef,
  setDuration,
  progressBarRef,
  dispatch,
  playlist
}) {
  const isSharedLink = !!playlist[0]?.token;

  const handleTogglePlay = useCallback(() => {
    if (!currentTrack) return;

    dispatch(playingAction({
      ...currentTrack,
      isPlaying: !currentTrack.isPlaying
    }));
  }, [currentTrack, dispatch]);

  const onLoadedMetadata = () => {
    const seconds = audioRef.current.duration;

    setDuration(seconds);
    progressBarRef.current.max = seconds;
  }

  return (
    <div className='flex items-center'>
      <div className='flex gap-4 items-center'>
        <div 
          className='w-[52px] h-[52px] bg-cover rounded cursor-pointer' 
          style={{ backgroundImage: `url(${currentTrack.cover_url || 'https://cdn.chestmusic.com/cover-default.jpg'})` }}
          onClick={handleTogglePlay}
        />
        <div className='flex flex-col gap-0.5'>
          <div className='flex flex-col grow'>
            <div className='w-full whitespace-nowrap overflow-hidden relative'>
              <span className='text-sm text-white inline-block'>
                {currentTrack.name}
              </span>
            </div>
            <span className='text-sm text-neutral-silver-200'>
              {currentTrack.authors}
            </span>
            {isSharedLink && currentTrack.play_limit > 0 && (
              <span className='text-xs text-neutral-silver-300'>
                {currentTrack.play_limit - currentTrack.plays} reproducciones restantes
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}