import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Development standalone app
import DevApp from './DevApp';

// This is only used for standalone development
// In production, components are imported via Module Federation
if (process.env.NODE_ENV === 'development') {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <DevApp />
    </React.StrictMode>
  );
}

// Module Federation exports
export { default as Player } from './components/Player';
export { default as PlayerProvider } from './core/context/PlayerProvider';
export { default as useAudioPlayer } from './core/hooks/useAudioPlayer';
export { default as PlayerWeb } from './components/skins/PlayerWeb';
export { default as PlayerMobile } from './components/skins/PlayerMobile';
export * from './core/utils';

console.log('🏴‍☠️ Chest Player MF loaded successfully!');