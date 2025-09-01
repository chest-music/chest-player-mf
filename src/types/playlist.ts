import { ChestTrack } from './track';

export interface PlaylistState {
  playlist: ChestTrack[];
  playing?: boolean;
}

export interface PlaylistActions {
  reset: () => void;
  play: () => void;
  next?: () => void;
  previous?: () => void;
  playing?: () => void;
}

export interface PlayerState {
  isOpen?: boolean;
  currentTrack?: ChestTrack;
}

export interface PlayerActions {
  closePlayer: () => void;
  openPlayer: () => void;
}