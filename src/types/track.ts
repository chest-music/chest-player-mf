export interface ChestTrack {
  id: string;
  name: string;
  authors?: string[];
  cover?: string;
  audio?: string;
  type?: string;
  plays?: number;
  play_limit?: number;
  token?: string; // Para tracks compartidos
  isPlaying?: boolean;
  // Share compatibility fields
  title?: string; // Alternative to name for share compatibility
  cover_url?: string; // Alternative to cover for share compatibility
  audio_url?: string; // Alternative to audio for share compatibility
  album?: string; // Album information for SEO
  version_name?: string; // Version name for display
}

export interface TrackSource {
  url: string;
  cover_url: string;
  name: string;
  authors?: string[];
  type?: string;
  id: string;
  plays?: number;
  play_limit?: number;
}

export interface SharedTrackData {
  id: string;
  token: string;
  play_limit: number;
  plays: number;
}

export interface PlayLimitState {
  playCount: number;
  playLimit: number | null;
  isLimitReached: boolean;
  hasDecremented: boolean;
}

// Share repository compatibility interfaces
export interface ShareTrack {
  title: string;
  authors: string[];
  album: string;
  version_name: string;
  cover_url: string;
  audio_url: string;
}

// SEO and Meta tags interfaces
export interface SEOMetadata {
  title: string;
  description: string;
  author?: string;
  image?: string;
  audio?: string;
  type?: 'music.song' | 'website';
  musician?: string;
  album?: string;
}

export interface SocialMetadata {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogAudio?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}