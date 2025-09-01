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