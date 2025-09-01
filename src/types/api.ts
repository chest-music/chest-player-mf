import { ChestTrack } from './track';

// Request/Response types para las APIs
export interface GetTrackSourceRequest {
  id: string;
  session?: string;
}

export interface GetTrackSourceResponse {
  url: string;
}

export interface UpdateTrackPlayRequest {
  id: string;
  anonymous?: boolean;
  token?: string;
}

export interface UpdateTrackPlayResponse {
  success: boolean;
  plays?: number;
}

// Hook types based on RTK Query
export type UseLazyGetTrackSourceQuery = () => [
  (request: GetTrackSourceRequest) => Promise<{ data?: GetTrackSourceResponse }>,
  {
    data?: GetTrackSourceResponse;
    error?: any;
    isLoading: boolean;
  }
];

export type UseUpdateTrackPlayMutation = () => [
  (request: UpdateTrackPlayRequest) => Promise<{ data?: UpdateTrackPlayResponse }>,
  {
    data?: UpdateTrackPlayResponse;
    error?: any;
    isLoading: boolean;
  }
];

// Dependency injection types
export interface ApiHooks {
  useLazyGetTrackSourceQuery: UseLazyGetTrackSourceQuery;
  useUpdateTrackPlayMutation: UseUpdateTrackPlayMutation;
}

// Redux props that are injected
export interface ReduxProps {
  dispatch: any;
  playlist: ChestTrack[];
  playerState?: any;
}