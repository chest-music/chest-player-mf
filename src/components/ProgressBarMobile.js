import * as React from 'react';
import { classNames, format } from '../utils/helpers';

export default function ProgressBar({ timeProgress, duration, progressBarRef, audioRef, open, playlist }) {
  const isSharedLink = !!playlist[0]?.token;

  const handleProgressChange = () => {
    if (isSharedLink) return; // No permitir cambios si es un link compartido
    audioRef.current.currentTime = progressBarRef.current.value;
  }

  return (
    <>
      <div className={classNames({
        'w-full flex items-center player-progressbar': true,
        'flex-col gap-2': open,
        'gap-1.5': !open
      })}>
        {open && (
          <div className='grid grid-cols-2 w-full'>
            <div className='text-sm'>{format.time(timeProgress)}</div>
            <div className='text-sm text-right text-neutral-silver-200'>{format.time(duration)}</div>
          </div>
        )}
        <input
          type='range'
          defaultValue={0}
          step={0.05}
          className={classNames({
            'bg-neutral-black rounded-lg appearance-none': true,
            'h-1.5': open,
            'h-[3px]': !open,
            'pointer-events-none': isSharedLink
          })}
          ref={progressBarRef}
          onChange={handleProgressChange}
        />
      </div>
    </>
  )
}