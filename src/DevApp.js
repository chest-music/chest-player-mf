import React from 'react';
import PlayerProvider from './core/context/PlayerProvider';
import Player from './components/Player';

// Mock data for development
const mockTrack = {
  id: 'dev-track-1',
  title: 'Sample Track',
  artist: 'Dev Artist',
  album: 'Development Album',
  duration: 180,
  src: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
  cover: 'https://via.placeholder.com/300x300/f59e0b/000000?text=🏴‍☠️'
};

const mockPlaylist = [
  mockTrack,
  {
    ...mockTrack,
    id: 'dev-track-2',
    title: 'Another Track',
    artist: 'Another Artist'
  }
];

function DevApp() {
  return (
    <div className="dev-container">
      <div className="dev-header">
        <h1>🏴‍☠️ Chest Player MF</h1>
        <p>Development Environment - Module Federation Ready</p>
      </div>
      
      <PlayerProvider initialPlaylist={mockPlaylist}>
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: '80px',
          background: '#000',
          borderTop: '1px solid #374151'
        }}>
          <Player />
        </div>
      </PlayerProvider>
    </div>
  );
}

export default DevApp;