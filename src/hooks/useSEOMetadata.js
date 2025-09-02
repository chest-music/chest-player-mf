import { useEffect, useMemo } from 'react';
import { generateSEOMetadata, generateSocialMetadata } from '../utils/trackTransforms';

/**
 * Hook for managing SEO metadata dynamically
 * Updates document head with track information for better social sharing
 * @param {import('../types/track').ChestTrack} track - Track data
 * @param {Object} options - SEO options
 * @param {boolean} [options.enabled=true] - Whether to enable SEO updates
 * @param {string} [options.baseTitle] - Base title for the page
 * @param {string} [options.baseDescription] - Base description
 * @param {string} [options.siteName] - Site name for OpenGraph
 * @returns {Object} SEO metadata object
 */
export function useSEOMetadata(track, options = {}) {
  const {
    enabled = true,
    baseTitle = '',
    baseDescription = 'Chest - El hogar de tus maquetas',
    siteName = 'Chest Music'
  } = options;

  const seoData = useMemo(() => {
    if (!track || !enabled) return null;

    const seoMetadata = generateSEOMetadata(track);
    const socialMetadata = generateSocialMetadata(track);

    return {
      ...seoMetadata,
      ...socialMetadata,
      siteName,
      baseTitle,
      baseDescription
    };
  }, [track, enabled, baseTitle, baseDescription, siteName]);

  useEffect(() => {
    if (!seoData || typeof document === 'undefined') return;

    // Store original meta tags to restore later
    const originalTags = new Map();

    const updateMetaTag = (property, content, useProperty = false) => {
      if (!content) return;

      const selector = useProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let tag = document.querySelector(selector);

      if (!tag) {
        tag = document.createElement('meta');
        if (useProperty) {
          tag.setAttribute('property', property);
        } else {
          tag.setAttribute('name', property);
        }
        document.head.appendChild(tag);
        originalTags.set(property, null); // Mark as new tag
      } else {
        originalTags.set(property, tag.getAttribute('content')); // Store original content
      }

      tag.setAttribute('content', content);
    };

    // Update document title
    const originalTitle = document.title;
    if (seoData.title) {
      document.title = seoData.title;
    }

    // Update basic meta tags
    updateMetaTag('description', seoData.description);
    updateMetaTag('author', seoData.author);

    // Update OpenGraph tags
    updateMetaTag('og:title', seoData.ogTitle, true);
    updateMetaTag('og:description', seoData.ogDescription, true);
    updateMetaTag('og:image', seoData.ogImage, true);
    updateMetaTag('og:type', seoData.ogType, true);
    updateMetaTag('og:site_name', siteName, true);

    // Music-specific OpenGraph tags
    if (seoData.ogAudio) {
      updateMetaTag('og:audio', seoData.ogAudio, true);
      updateMetaTag('og:audio:type', 'audio/mpeg', true);
    }
    if (seoData.musician) {
      updateMetaTag('music:musician', seoData.musician, true);
    }
    if (seoData.album) {
      updateMetaTag('music:album', seoData.album, true);
    }

    // Update Twitter Card tags
    updateMetaTag('twitter:card', seoData.twitterCard);
    updateMetaTag('twitter:title', seoData.twitterTitle);
    updateMetaTag('twitter:description', seoData.twitterDescription);
    updateMetaTag('twitter:image', seoData.twitterImage);

    // Cleanup function to restore original tags
    return () => {
      document.title = originalTitle;

      originalTags.forEach((originalContent, property) => {
        const selector = property.startsWith('og:') || property.startsWith('music:') 
          ? `meta[property="${property}"]` 
          : `meta[name="${property}"]`;
        const tag = document.querySelector(selector);

        if (tag) {
          if (originalContent === null) {
            // Remove tag that didn't exist before
            tag.remove();
          } else {
            // Restore original content
            tag.setAttribute('content', originalContent);
          }
        }
      });
    };
  }, [seoData]);

  return seoData;
}

/**
 * Hook for generating share URLs and metadata
 * @param {import('../types/track').ChestTrack} track - Track data
 * @param {string} [baseUrl] - Base URL for sharing
 * @returns {Object} Share utilities
 */
export function useShareMetadata(track, baseUrl = '') {
  const seoData = useSEOMetadata(track, { enabled: false }); // Get metadata without DOM updates

  const shareData = useMemo(() => {
    if (!track || !seoData) return null;

    const shareUrl = track.token ? `${baseUrl}/shared-link/${track.token}` : '';
    const shareText = `Escucha "${seoData.title}" en Chest Music`;

    return {
      url: shareUrl,
      title: seoData.title,
      text: shareText,
      image: seoData.ogImage,
      
      // Social platform specific URLs
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      
      // Native sharing (if supported)
      canShare: typeof navigator !== 'undefined' && navigator.share,
      nativeShare: () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
          return navigator.share({
            title: seoData.title,
            text: shareText,
            url: shareUrl,
          });
        }
        return Promise.reject(new Error('Native sharing not supported'));
      }
    };
  }, [track, seoData, baseUrl]);

  return shareData;
}