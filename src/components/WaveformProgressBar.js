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
    if (!currentTrack?.url || !audioRef.current) return;

    // Wait for audio to have metadata loaded
    const initializeWaveform = () => {
      if (!waveformRef.current) {
        console.log('WaveformProgressBar: Container not ready');
        return;
      }

      if (!audioRef.current || !audioRef.current.src) {
        console.log('WaveformProgressBar: Audio not ready');
        return;
      }

      console.log('WaveformProgressBar: Initializing WaveSurfer with media element');

      try {
        // Clean up previous instance
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
        }

        // ✅ CORRECT - Use existing audio element instead of fetching URL
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
          fillParent: true,
          media: audioRef.current // Use the existing audio element that already works
        });

        wavesurfer.current.on('ready', () => {
          console.log('WaveformProgressBar: Ready!');
          setIsReady(true);
        });

        wavesurfer.current.on('seek', (progress) => {
          if (!isSharedLink && audioRef.current) {
            audioRef.current.currentTime = progress * duration;
          }
        });

      } catch (error) {
        console.error('WaveformProgressBar: Error:', error);
      }
    };

    // Check if audio already has metadata, if not wait for it
    if (audioRef.current.readyState >= 1) {
      // Audio metadata is already loaded
      const timer = setTimeout(initializeWaveform, 100);
      return () => clearTimeout(timer);
    } else {
      // Wait for audio metadata to load
      const handleLoadedMetadata = () => {
        setTimeout(initializeWaveform, 100);
      };

      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
        if (wavesurfer.current) {
          try {
            wavesurfer.current.destroy();
          } catch (error) {
            console.error('Error destroying WaveSurfer:', error);
          }
        }
      };
    }
  }, [currentTrack?.url, isSharedLink]);

  // Sincronizar progreso
  useEffect(() => {
    if (wavesurfer.current && isReady && duration > 0) {
      const progress = timeProgress / duration;
      try {
        wavesurfer.current.seekTo(progress);
      } catch (error) {
        // Ignorar errores de sincronización
      }
    }
  }, [timeProgress, duration, isReady]);

  return (
    <div className="w-full flex items-center gap-1.5 player-progressbar">
      <div className="text-sm">{format.time(timeProgress)}</div>
      <div 
        ref={waveformRef}
        className="flex-1 h-6 rounded-lg overflow-hidden bg-neutral-black"
        style={{
          opacity: isReady ? 1 : 0.3,
          transition: 'opacity 0.3s ease'
        }}
      >
        {!isReady && (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-neutral-silver-400">Loading...</span>
          </div>
        )}
      </div>
      <div className="text-sm">{format.time(duration)}</div>
    </div>
  );
}