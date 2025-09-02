import * as React from 'react';
const { useState, useEffect } = React;
import { capitalize } from '../../utils/capitalize';
import SharedLinkBanner from './SharedLinkBanner';
import useMediaQuery from '../../hooks/useMediaQuery';

/**
 * SharedLinkPage component - displays shared track with SEO optimization
 * Adapted from share repository for embedding in apps
 * @param {Object} props
 * @param {import('../../types/track').ChestTrack} props.track - Track data
 * @param {boolean} [props.showBanner] - Whether to show promotional banner
 * @param {boolean} [props.showPlayer] - Whether to show embedded player
 * @param {React.ComponentType} [props.PlayerComponent] - Player component to embed
 * @param {Object} [props.playerProps] - Props to pass to player component
 * @param {Function} [props.onPlayTrack] - Callback when track is played
 */
export default function SharedLinkPage({
  track,
  showBanner = true,
  showPlayer = false,
  PlayerComponent = null,
  playerProps = {},
  onPlayTrack = null
}) {
  const [displayBanner, setDisplayBanner] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Prevent hydration error
  useEffect(() => {
    setDisplayBanner(true);
  }, []);

  const handlePlayClick = () => {
    if (onPlayTrack && typeof onPlayTrack === 'function') {
      onPlayTrack(track);
    }
  };

  if (!track) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-thunder-bold mb-4">Track no encontrado</h2>
          <p className="text-neutral-silver-200">El enlace compartido no es válido o ha expirado.</p>
        </div>
      </div>
    );
  }

  const trackTitle = track.title || track.name;
  const trackAuthors = track.authors?.join(', ') || '';
  const trackCover = track.cover_url || track.cover || 'https://cdn.chestmusic.com/cover-default.jpg';
  const trackAlbum = track.album || '';
  const trackVersion = track.version_name || '';

  return (
    <main className="min-h-screen w-full relative">
      {/* Desktop Layout */}
      <div className="hidden lg:block lg:container mx-auto px-4 pt-[50px]">
        <div className="lg:pt-[60px] lg:pb-[40px] flex lg:gap-x-12 items-center">
          <div>
            <img
              src={trackCover}
              className="lg:w-[220px] lg:h-[220px] lg:rounded-lg object-cover"
              alt={`Cover for ${trackTitle}`}
            />
          </div>
          <div className="flex flex-col">
            <div className="lg:mb-6">
              <p className="text-left text-neutral-silver-200 text-base flex items-center gap-2">
                {trackAlbum}
                {trackAlbum && trackVersion && (
                  <>
                    <img
                      src="/assets/images/icon-rectangle.png"
                      alt="separator"
                      className="h-[3px]"
                    />
                    {trackVersion}
                  </>
                )}
              </p>
            </div>
            <div className="lg:mb-3">
              <h2 className="lg:text-[76px] leading-[68px] font-thunder-bold">
                {trackTitle}
              </h2>
            </div>
            <div className="lg:mb-6">
              <p className="text-left lg:text-[22px] capitalize">
                {trackAuthors}
              </p>
            </div>
            
            {/* Play button for desktop */}
            {onPlayTrack && (
              <div className="lg:mb-4">
                <button
                  onClick={handlePlayClick}
                  className="btn btn-primary py-3 px-8 bg-brand-gold text-neutral-black font-semibold rounded-lg hover:bg-brand-gold-hover transition-colors"
                >
                  ▶ Reproducir
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Embedded Player for desktop */}
        {showPlayer && PlayerComponent && (
          <div className="lg:mb-8">
            <PlayerComponent {...playerProps} />
          </div>
        )}
        
        {/* Banner for desktop */}
        {displayBanner && showBanner && <SharedLinkBanner isMobile={false} />}
      </div>

      {/* Mobile Layout */}
      <div className="p-3 h-screen bg-neutral-black lg:hidden pt-[50px]">
        <div className="w-full h-[510px] bg-neutral-silver-700 rounded-3xl py-2">
          <div className="mb-5 py-2 pt-4">
            <p className="font-semibold text-center text-neutral-silver-200">
              {trackAlbum} {trackVersion && `• ${trackVersion}`}
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={trackCover}
              alt={`Cover for ${trackTitle}`}
              className="w-[286px] h-[286px] rounded-md object-cover"
            />
          </div>
          <div className="h-[160px] rounded-[20px] px-5 py-2 w-full bg-custom-opacity flex flex-col justify-center items-center">
            <h5 className="uppercase font-thunder-bold text-[36px] leading-[32px] text-center">
              {trackTitle}
            </h5>
            <p className="text-base text-neutral-silver-200 capitalize text-center mb-4">
              {trackAuthors}
            </p>
            
            {/* Play button for mobile */}
            {onPlayTrack && (
              <button
                onClick={handlePlayClick}
                className="btn btn-primary py-2 px-6 bg-brand-gold text-neutral-black font-semibold rounded-lg hover:bg-brand-gold-hover transition-colors"
              >
                ▶ Reproducir
              </button>
            )}
          </div>
        </div>
        
        {/* Embedded Player for mobile */}
        {showPlayer && PlayerComponent && (
          <div className="mt-4">
            <PlayerComponent {...playerProps} />
          </div>
        )}
        
        {/* Banner for mobile */}
        {displayBanner && showBanner && <SharedLinkBanner isMobile={true} />}
      </div>
    </main>
  );
}