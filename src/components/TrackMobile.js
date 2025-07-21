import React from 'react';

export default function TrackMobile({
  currentTrack,
  audioRef,
  setDuration,
  progressBarRef,
  open
}) {
  // const onLoadedMetadata = () => {
  //   const seconds = audioRef.current.duration;

  //   setDuration(seconds);
  //   progressBarRef.current.max = seconds;
  // }

  return (
    <>
      {/* <audio
        src={currentTrack.url}
        ref={audioRef}
        onLoadedMetadata={onLoadedMetadata}
      /> */}
      {open ? (
        <div>
          <div>
            <div className='flex gap-3 items-center justify-center -mb-2'>
              <div
                className='w-[286px] h-[286px] bg-cover rounded'
                style={{ backgroundImage: `url(${currentTrack.cover_url})` }}>
              </div>
            </div>
            <div
              className='rounded-3xl px-5 pt-2 backdrop-blur-xl flex flex-col gap-1 items-center justify-center h-[160px]'
              style={{ background: 'rgba(67, 71, 79, 0.30)' }}>
              <span className='font-thunder-bold text-4xl uppercase !text-center'>
                {currentTrack.name}
              </span>
              <span className='text-neutral-silver-200'>
                {currentTrack?.authors?.join(', ')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex items-center grow min-w-0'>
          <div className='flex gap-3 items-center min-w-0 flex-1'>
            <div
              className='w-10 h-10 bg-cover rounded min-w-[40px] flex-shrink-0'
              style={{ backgroundImage: `url(${currentTrack.cover_url})` }}>
            </div>
            <div className='flex flex-col min-w-0 flex-1'>
              <div className='w-full truncate'>
                <span className='text-sm text-white truncate'>
                  {currentTrack.name}
                </span>
              </div>
              <span className='text-sm text-neutral-silver-200 truncate'>
                {currentTrack?.authors?.join(', ')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}