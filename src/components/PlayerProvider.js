import React from 'react';
import Player from './Player';

/**
 * PlayerProvider - Wrapper component that provides the Player with necessary dependencies
 * 
 * This component expects the following props to be injected by the parent application:
 * - apiHooks: { useLazyGetTrackSourceQuery, useUpdateTrackPlayMutation }
 * - playlistActions: { reset, play, next, previous, playing }
 * - playerActions: { closePlayer, openPlayer }
 * - reduxProps: { dispatch, playlist, playerState } - Redux state and dispatch from parent
 * 
 * The parent app is responsible for providing these dependencies through Redux store.
 */
const PlayerProvider = ({ 
  apiHooks,
  playlistActions, 
  playerActions,
  reduxProps,
  ...playerProps 
}) => {
  // Store these in a context or global scope for the Player component to access
  if (typeof window !== 'undefined') {
    window.__CHEST_PLAYER_DEPS__ = {
      apiHooks,
      playlistActions,
      playerActions,
      reduxProps
    };
  }

  return <Player {...playerProps} />;
};

export default PlayerProvider;