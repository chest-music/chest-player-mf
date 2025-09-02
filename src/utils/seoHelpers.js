/**
 * SEO Helper utilities for better search engine optimization
 * and social media sharing
 */

/**
 * Generate structured data (JSON-LD) for music tracks
 * @param {import('../types/track').ChestTrack} track 
 * @returns {Object} Structured data object
 */
export function generateMusicStructuredData(track) {
  if (!track) return null;

  const trackTitle = track.title || track.name;
  const trackAuthors = track.authors?.join(', ') || '';
  const trackCover = track.cover_url || track.cover || 'https://cdn.chestmusic.com/cover-default.jpg';
  const trackAudio = track.audio_url || track.audio || '';

  return {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "name": trackTitle,
    "byArtist": {
      "@type": "MusicGroup",
      "name": trackAuthors
    },
    "inAlbum": track.album ? {
      "@type": "MusicAlbum",
      "name": track.album
    } : undefined,
    "image": trackCover,
    "audio": trackAudio ? {
      "@type": "AudioObject",
      "contentUrl": trackAudio,
      "encodingFormat": "audio/mpeg"
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "Chest Music",
      "url": "https://chestmusic.com"
    },
    "potentialAction": {
      "@type": "ListenAction",
      "target": trackAudio
    }
  };
}

/**
 * Inject structured data into document head
 * @param {Object} structuredData 
 * @returns {Function} Cleanup function
 */
export function injectStructuredData(structuredData) {
  if (typeof document === 'undefined' || !structuredData) {
    return () => {};
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  script.id = 'chest-music-structured-data';

  // Remove existing structured data if present
  const existing = document.getElementById('chest-music-structured-data');
  if (existing) {
    existing.remove();
  }

  document.head.appendChild(script);

  return () => {
    const scriptToRemove = document.getElementById('chest-music-structured-data');
    if (scriptToRemove) {
      scriptToRemove.remove();
    }
  };
}

/**
 * Generate meta tags as HTML string for SSR
 * @param {import('../types/track').ChestTrack} track 
 * @param {Object} options 
 * @returns {string} HTML string with meta tags
 */
export function generateMetaTagsHTML(track, options = {}) {
  if (!track) return '';

  const {
    baseUrl = '',
    siteName = 'Chest Music',
    description = 'Chest - El hogar de tus maquetas'
  } = options;

  const trackTitle = track.title || track.name;
  const trackAuthors = track.authors?.join(', ') || '';
  const trackCover = track.cover_url || track.cover || 'https://cdn.chestmusic.com/cover-default.jpg';
  const trackAudio = track.audio_url || track.audio || '';
  const fullTitle = `${trackTitle} - ${trackAuthors}`;
  const shareUrl = track.token ? `${baseUrl}/shared-link/${track.token}` : '';

  const metaTags = [
    `<title>${fullTitle}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="author" content="${trackAuthors}" />`,
    
    // OpenGraph tags
    `<meta property="og:type" content="music.song" />`,
    `<meta property="og:title" content="${fullTitle}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${trackCover}" />`,
    `<meta property="og:site_name" content="${siteName}" />`,
    shareUrl ? `<meta property="og:url" content="${shareUrl}" />` : '',
    
    // Music specific OpenGraph
    `<meta property="music:musician" content="${trackAuthors}" />`,
    track.album ? `<meta property="music:album" content="${track.album}" />` : '',
    trackAudio ? `<meta property="og:audio" content="${trackAudio}" />` : '',
    trackAudio ? `<meta property="og:audio:type" content="audio/mpeg" />` : '',
    
    // Twitter Card tags
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${fullTitle}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${trackCover}" />`,
    
    // Additional SEO tags
    `<meta name="robots" content="index, follow" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
    `<link rel="canonical" href="${shareUrl}" />`
  ].filter(Boolean);

  return metaTags.join('\n');
}

/**
 * Check if the current environment supports dynamic meta updates
 * @returns {boolean}
 */
export function canUpdateMetaTags() {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

/**
 * Get current page URL for sharing
 * @returns {string}
 */
export function getCurrentShareUrl() {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

/**
 * Copy text to clipboard
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  if (typeof navigator === 'undefined') return false;

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Validate track data for SEO completeness
 * @param {import('../types/track').ChestTrack} track 
 * @returns {Object} Validation result
 */
export function validateTrackSEO(track) {
  const issues = [];
  const warnings = [];

  if (!track) {
    issues.push('Track data is missing');
    return { valid: false, issues, warnings };
  }

  // Required fields
  if (!track.name && !track.title) {
    issues.push('Track name/title is required');
  }
  
  if (!track.authors || track.authors.length === 0) {
    warnings.push('Track authors are missing - affects SEO');
  }

  if (!track.cover && !track.cover_url) {
    warnings.push('Track cover image is missing - affects social sharing');
  }

  if (!track.audio && !track.audio_url) {
    issues.push('Track audio URL is required');
  }

  // Token validation for shared tracks
  if (track.token && track.token.length < 10) {
    warnings.push('Share token appears to be too short');
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    score: Math.max(0, 100 - (issues.length * 25) - (warnings.length * 10))
  };
}