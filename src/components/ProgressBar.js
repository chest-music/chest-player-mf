import * as React from 'react';
import { format } from '../utils/helpers';

export default function ProgressBar({ timeProgress, duration, progressBarRef, audioRef, open, playlist }) {
  const isSharedLink = !!playlist[0]?.token;

  const handleProgressChange = () => {
    if (isSharedLink) return; // No permitir cambios si es un link compartido
    audioRef.current.currentTime = progressBarRef.current.value;
  }

  return (
    <>
      <div className='w-full flex items-center gap-1.5 player-progressbar'>
        <div className='text-sm'>{format.time(timeProgress)}</div>
        <input
          type='range'
          defaultValue={0}
          step={0.05}
          className={`bg-neutral-black rounded-lg h-1.5 appearance-none ${isSharedLink ? 'pointer-events-none' : ''}`}
          ref={progressBarRef}
          onChange={handleProgressChange}
        />
        <div className='text-sm'>{format.time(duration)}</div>
      </div>
    </>
  )
}
