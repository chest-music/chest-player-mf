import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import Player from './Player';
import { SharedLinkPage } from './share';
import { useSEOMetadata, useShareMetadata } from '../hooks/useSEOMetadata';
import { shareTrackToChestTrack } from '../utils/trackTransforms';

/**
 * Enhanced Player component with Share capabilities
 * Combines the existing player with SEO-optimized shared link display
 * @param {Object} props
 * @param {import('../types/track').ShareTrack} [props.shareTrack] - Share format track data
 * @param {import('../types/track').ChestTrack} [props.track] - Player format track data  
 * @param {string} [props.token] - Share token
 * @param {boolean} [props.showSharePage] - Whether to show the share page layout
 * @param {boolean} [props.showBanner] - Whether to show promotional banner
 * @param {boolean} [props.enableSEO] - Whether to enable SEO metadata updates
 * @param {string} [props.baseUrl] - Base URL for share links
 * @param {Object} [props.playerProps] - Additional props to pass to Player component
 * @param {Function} [props.onTrackLoad] - Callback when track is loaded
 * @param {Function} [props.onPlayTrack] - Callback when track play is triggered
 */
export default function PlayerWithShare({
  shareTrack = null,
  track = null,
  token = null,
  showSharePage = false,
  showBanner = true,
  enableSEO = true,
  baseUrl = '',
  playerProps = {},
  onTrackLoad = null,
  onPlayTrack = null
}) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  // Transform shareTrack to ChestTrack format if needed
  useEffect(() => {
    if (shareTrack && token) {
      const transformedTrack = shareTrackToChestTrack(shareTrack, token);
      setCurrentTrack(transformedTrack);
      if (onTrackLoad) {
        onTrackLoad(transformedTrack);
      }
    } else if (track) {
      setCurrentTrack(track);
      if (onTrackLoad) {
        onTrackLoad(track);
      }
    }
  }, [shareTrack, track, token, onTrackLoad]);

  // Initialize SEO metadata
  const seoData = useSEOMetadata(currentTrack, { enabled: enableSEO });
  const shareData = useShareMetadata(currentTrack, baseUrl);

  // Handle play track from share page
  const handlePlayTrack = useCallback((trackToPlay) => {
    setIsPlayerVisible(true);
    if (onPlayTrack) {
      onPlayTrack(trackToPlay);
    }
  }, [onPlayTrack]);

  // Get dependencies from global scope (same as existing Player component)
  const getDependencies = () => {
    if (typeof window !== 'undefined' && window.__CHEST_PLAYER_DEPS__) {
      return window.__CHEST_PLAYER_DEPS__;
    }
    throw new Error('ChestPlayer: Dependencies not provided. Make sure to use PlayerProvider.');
  };

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-thunder-bold mb-2">Cargando track...</h2>
          <p className="text-neutral-silver-200">Preparando la reproducción</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chest-player-with-share">
      {showSharePage && (
        <SharedLinkPage
          track={currentTrack}
          showBanner={showBanner}
          showPlayer={isPlayerVisible}
          PlayerComponent={Player}
          playerProps={playerProps}
          onPlayTrack={handlePlayTrack}
        />
      )}
      
      {/* Always render Player for functionality, but conditionally show it */}
      <div className={showSharePage && !isPlayerVisible ? 'hidden' : ''}>
        <Player {...playerProps} />
      </div>
      
      {/* Development helper - show SEO data in development */}
      {process.env.NODE_ENV === 'development' && seoData && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-xs z-50">
          <h4 className="font-bold mb-2">SEO Debug Info:</h4>
          <p><strong>Title:</strong> {seoData.title}</p>
          <p><strong>Share URL:</strong> {shareData?.url}</p>
          <p><strong>Token:</strong> {currentTrack.token}</p>
        </div>
      )}
    </div>
  );
}