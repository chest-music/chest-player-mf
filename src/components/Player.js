import React from 'react';
import { usePlayer } from '../core/context/PlayerProvider';
import PlayerWeb from './skins/PlayerWeb';
import PlayerMobile from './skins/PlayerMobile';

const Player = ({ skin = 'auto' }) => {
  const { currentTrack, isPlayerOpen } = usePlayer();

  // Determine which skin to use
  const isMobile = skin === 'mobile' || (skin === 'auto' && window.innerWidth <= 768);

  // Don't render if no track is loaded
  if (!currentTrack) {
    return null;
  }

  return (
    <div className="chest-player-mf">
      {isMobile ? <PlayerMobile /> : <PlayerWeb />}
    </div>
  );
};

export default Player;