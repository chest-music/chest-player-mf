// Main exports
export { default as Player } from './components/Player';
export { default as PlayerProvider } from './components/PlayerProvider';

// Individual components for advanced usage
export { default as Controls } from './components/Controls';
export { default as ControlsMobile } from './components/ControlsMobile';
export { default as Track } from './components/Track';
export { default as TrackMobile } from './components/TrackMobile';
export { default as ProgressBar } from './components/ProgressBar';
export { default as ProgressBarMobile } from './components/ProgressBarMobile';
export { default as WaveformProgressBar } from './components/WaveformProgressBar';
export { default as VolumeControls } from './components/VolumeControls';

// Hooks
export { useModal } from './hooks/useModal';
export { default as useMediaQuery } from './hooks/useMediaQuery';

// CSS - This will be extracted during build
import './styles/player.css';