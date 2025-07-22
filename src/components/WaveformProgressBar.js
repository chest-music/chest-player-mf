import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { format } from '../utils/helpers';

export default function WaveformProgressBar({ 
  timeProgress, 
  duration, 
  audioRef, 
  open, 
  playlist,
  currentTrack 
}) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [containerReady, setContainerReady] = useState(false);
  const isSharedLink = !!playlist[0]?.token;

  // Verificar que el contenedor esté disponible
  useEffect(() => {
    const checkContainer = () => {
      if (waveformRef.current) {
        console.log('WaveformProgressBar: Container found!');
        setContainerReady(true);
      } else {
        console.log('WaveformProgressBar: Container not found, checking again...');
        setTimeout(checkContainer, 50);
      }
    };
    
    checkContainer();
  }, []);

  // Crear WaveSurfer cuando tanto el contenedor como el track estén listos
  useEffect(() => {
    if (!containerReady || !currentTrack?.url || !waveformRef.current) {
      console.log('WaveformProgressBar: Not ready yet', {
        containerReady,
        hasTrackUrl: !!currentTrack?.url,
        hasContainer: !!waveformRef.current
      });
      return;
    }

    console.log('WaveformProgressBar: Creating WaveSurfer instance', currentTrack.url);

    try {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#6B7280',
        progressColor: '#D4AF37',
        cursorColor: '#D4AF37',
        height: 24,
        normalize: true,
        backend: 'WebAudio',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        interact: !isSharedLink,
        hideScrollbar: true,
        fillParent: true
      });

      wavesurfer.current.load(currentTrack.url);

      wavesurfer.current.on('ready', () => {
        console.log('WaveformProgressBar: WaveSurfer ready');
        setIsReady(true);
      });

      wavesurfer.current.on('seek', (progress) => {
        if (!isSharedLink && audioRef.current) {
          const newTime = progress * duration;
          audioRef.current.currentTime = newTime;
        }
      });

      wavesurfer.current.on('click', (progress) => {
        if (!isSharedLink && audioRef.current) {
          const newTime = progress * duration;
          audioRef.current.currentTime = newTime;
        }
      });

    } catch (error) {
      console.error('WaveformProgressBar: Error creating WaveSurfer:', error);
      setIsReady(false);
    }

    return () => {
      if (wavesurfer.current) {
        try {
          wavesurfer.current.destroy();
        } catch (error) {
          console.error('Error destroying WaveSurfer:', error);
        }
      }
    };
  }, [containerReady, currentTrack?.url, isSharedLink]);

  // Sincronizar progreso con el audio element
  useEffect(() => {
    if (wavesurfer.current && isReady && duration > 0) {
      const progress = timeProgress / duration;
      wavesurfer.current.seekTo(progress);
    }
  }, [timeProgress, duration, isReady]);

  const waveformStyle = {
    opacity: isReady ? 1 : 0.5,
    transition: 'opacity 0.3s ease',
    cursor: isSharedLink ? 'default' : 'pointer'
  };

  // Fallback si no está listo
  if (!isReady && (!containerReady || !currentTrack?.url)) {
    return (
      <div className="w-full flex items-center gap-1.5 player-progressbar">
        <div className="text-sm">{format.time(timeProgress)}</div>
        <div className="flex-1 h-6 rounded-lg bg-neutral-black flex items-center justify-center">
          <span className="text-xs text-neutral-silver-300">Loading waveform...</span>
        </div>
        <div className="text-sm">{format.time(duration)}</div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center gap-1.5 player-progressbar">
      <div className="text-sm">{format.time(timeProgress)}</div>
      <div 
        ref={waveformRef} 
        className="flex-1 h-6 rounded-lg overflow-hidden bg-neutral-black"
        style={waveformStyle}
      />
      <div className="text-sm">{format.time(duration)}</div>
    </div>
  );
}