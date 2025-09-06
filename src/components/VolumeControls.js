import * as React from 'react';
const { useEffect, useRef, useState } = React;
import { 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon, 
  ChevronDownIcon } from '@heroicons/react/24/outline';
// Get playlist actions from injected dependencies
const getPlaylistActions = () => {
  if (typeof window !== 'undefined' && window.__CHEST_PLAYER_DEPS__?.playlistActions) {
    return window.__CHEST_PLAYER_DEPS__.playlistActions;
  }
  return {
    reset: () => console.log('Reset action not injected')
  };
};

export default function VolumeControls({ audioRef, dispatch }) {
  const [volume, setVolume] = useState(50);
  const [prevVolume, setPrevVolume] = useState(0);
  const { reset } = getPlaylistActions();
  
  const volumeRef = useRef();

  const toggleMuted = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume);
    }
  }

  const handleClose = () => {
    reset()
  }

  useEffect(() => {
    volumeRef.current.style.setProperty(
      '--range-progress',
      `${volumeRef.current.value}%`
    );

    if (audioRef) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, audioRef]);

  return (
    <>
      <div className='flex items-center justify-end player-volume'>
        <button type='button' className='p-2' onClick={toggleMuted}>
          {volume === 0 ?
            <SpeakerXMarkIcon className='h-6 w-6 text-neutral-silver-200' /> :
            <SpeakerWaveIcon className='h-6 w-6 text-neutral-silver-200' />
          }
        </button>
        <input
          ref={volumeRef}
          type='range'
          value={volume}
          min={0}
          max={100}
          className='bg-neutral-black rounded-lg h-1.5 appearance-none mr-4'
          onChange={(e) => { setVolume(parseInt(e.target.value)) }} />
        <button type='button' className='p-2 test' onClick={handleClose}>
          <ChevronDownIcon className='h-6 w-6 text-white' />
        </button>
      </div>
    </>
  )
}