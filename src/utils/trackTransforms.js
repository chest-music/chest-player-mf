// Utility functions to transform between different track formats
// Maintains compatibility between share repo and player formats

/**
 * Transform ShareTrack (from share repo) to ChestTrack (player format)
 * @param {import('../types/track').ShareTrack} shareTrack 
 * @param {string} token 
 * @returns {import('../types/track').ChestTrack}
 */
export function shareTrackToChestTrack(shareTrack, token = null) {
  return {
    id: token || generateTrackId(shareTrack),
    name: shareTrack.title,
    title: shareTrack.title, // Keep both for compatibility
    authors: shareTrack.authors,
    cover: shareTrack.cover_url,
    cover_url: shareTrack.cover_url, // Keep both for compatibility
    audio: shareTrack.audio_url,
    audio_url: shareTrack.audio_url, // Keep both for compatibility
    album: shareTrack.album,
    version_name: shareTrack.version_name,
    token: token,
    isPlaying: false,
    plays: 0,
    play_limit: null,
    type: 'shared'
  };
}

/**
 * Transform ChestTrack to ShareTrack format
 * @param {import('../types/track').ChestTrack} chestTrack 
 * @returns {import('../types/track').ShareTrack}
 */
export function chestTrackToShareTrack(chestTrack) {
  return {
    title: chestTrack.title || chestTrack.name,
    authors: chestTrack.authors || [],
    album: chestTrack.album || '',
    version_name: chestTrack.version_name || '',
    cover_url: chestTrack.cover_url || chestTrack.cover || 'https://cdn.chestmusic.com/cover-default.jpg',
    audio_url: chestTrack.audio_url || chestTrack.audio || ''
  };
}

/**
 * Generate SEO metadata from track data
 * @param {import('../types/track').ChestTrack} track 
 * @returns {import('../types/track').SEOMetadata}
 */
export function generateSEOMetadata(track) {
  const title = track.title || track.name;
  const authors = track.authors?.join(', ') || '';
  const coverUrl = track.cover_url || track.cover || 'https://cdn.chestmusic.com/cover-default.jpg';
  const audioUrl = track.audio_url || track.audio || '';

  return {
    title: `${capitalize(title)} - ${authors}`,
    description: 'Chest - El hogar de tus maquetas',
    author: authors,
    image: coverUrl,
    audio: audioUrl,
    type: 'music.song',
    musician: authors,
    album: track.album || ''
  };
}

/**
 * Generate social media metadata from track data
 * @param {import('../types/track').ChestTrack} track 
 * @returns {import('../types/track').SocialMetadata}
 */
export function generateSocialMetadata(track) {
  const title = track.title || track.name;
  const authors = track.authors?.join(', ') || '';
  const coverUrl = track.cover_url || track.cover || 'https://cdn.chestmusic.com/cover-default.jpg';
  const audioUrl = track.audio_url || track.audio || '';
  const fullTitle = `${capitalize(title)} - ${authors}`;
  const description = 'Chest - El hogar de tus maquetas';

  return {
    ogTitle: fullTitle,
    ogDescription: description,
    ogImage: coverUrl,
    ogAudio: audioUrl,
    ogType: 'music.song',
    twitterCard: 'summary_large_image',
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: coverUrl
  };
}

/**
 * Check if track has share-compatible data
 * @param {import('../types/track').ChestTrack} track 
 * @returns {boolean}
 */
export function isShareCompatible(track) {
  return !!(track.token && (track.audio_url || track.audio));
}

/**
 * Generate a track ID from share data
 * @param {import('../types/track').ShareTrack} shareTrack 
 * @returns {string}
 */
function generateTrackId(shareTrack) {
  return `share_${shareTrack.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
}

/**
 * Capitalize first letter of string
 * @param {string} str 
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}