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
  const isSharedLink = !!playlist[0]?.token;

  useEffect(() => {
    if (!waveformRef.current || !currentTrack?.url) return;

    // Crear instancia de WaveSurfer
    try {
      wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#6B7280', // Neutral gray for unwaved portion
      progressColor: '#D4AF37', // Brand gold color
      cursorColor: '#D4AF37', // Brand gold for cursor
      height: 24,
      normalize: true,
      backend: 'WebAudio',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      interact: !isSharedLink, // Disable interaction for shared links
      hideScrollbar: true,
      fillParent: true
    });

    // Cargar el audio
    if (currentTrack?.url) {
      wavesurfer.current.load(currentTrack.url);
    }

    // Event listeners
    wavesurfer.current.on('ready', () => {
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
      console.error('Error creating WaveSurfer:', error);
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
  }, [currentTrack?.url, isSharedLink]);

  // Sincronizar progreso con el audio element
  useEffect(() => {
    if (wavesurfer.current && isReady && duration > 0) {
      const progress = timeProgress / duration;
      wavesurfer.current.seekTo(progress);
    }
  }, [timeProgress, duration, isReady]);

  // Estilo personalizado para el contenedor
  const waveformStyle = {
    opacity: isReady ? 1 : 0.5,
    transition: 'opacity 0.3s ease',
    cursor: isSharedLink ? 'default' : 'pointer'
  };

  // Fallback a la barra normal si wavesurfer falla
  if (!isReady && wavesurfer.current === null) {
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