# Ejemplo de Integración - @chest-music/player

### 1. Instalación

```bash
npm install git+ssh://git@github.com/cexar-io/chest-player-mf.git
npm install react react-dom react-redux @reduxjs/toolkit framer-motion @heroicons/react
```

### 2. Configuración del Store Redux

```javascript
// store/playlistSlice.js
import { createSlice } from '@reduxjs/toolkit';

const playlistSlice = createSlice({
  name: 'playlist',
  initialState: {
    playlist: [],
    playing: false
  },
  reducers: {
    reset: (state) => {
      state.playlist = [];
      state.playing = false;
    },
    play: (state) => {
      if (state.playlist.length > 0) {
        state.playlist[0].isPlaying = !state.playlist[0].isPlaying;
      }
    },
    next: (state) => {
      // Lógica para siguiente track
    },
    previous: (state) => {
      // Lógica para track anterior  
    },
    playing: (state, action) => {
      if (state.playlist.length > 0) {
        state.playlist[0] = { ...state.playlist[0], ...action.payload };
      }
    },
    setPlaylist: (state, action) => {
      state.playlist = action.payload;
    }
  }
});

export const { reset, play, next, previous, playing, setPlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;
```

### 3. API Hooks (RTK Query)

```javascript
// api/tracksApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const tracksApi = createApi({
  reducerPath: 'tracksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/tracks/',
  }),
  endpoints: (builder) => ({
    getTrackSource: builder.query({
      query: ({ id, session }) => ({
        url: `${id}/source`,
        headers: {
          'Authorization': `Bearer ${session}`
        }
      }),
    }),
    updateTrackPlay: builder.mutation({
      query: ({ id, anonymous, token }) => ({
        url: `${id}/play`,
        method: 'POST',
        body: { anonymous, token }
      }),
    }),
  }),
});

export const { 
  useLazyGetTrackSourceQuery, 
  useUpdateTrackPlayMutation 
} = tracksApi;
```

### 4. Player Actions

```javascript
// store/playerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    isOpen: false
  },
  reducers: {
    openPlayer: (state) => {
      state.isOpen = true;
    },
    closePlayer: (state) => {
      state.isOpen = false;
    }
  }
});

export const { openPlayer, closePlayer } = playerSlice.actions;
export default playerSlice.reducer;
```

### 5. Configuración del Store Principal

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import playlistReducer from './playlistSlice';
import playerReducer from './playerSlice';
import { tracksApi } from '../api/tracksApi';

export const store = configureStore({
  reducer: {
    playlist: playlistReducer,
    player: playerReducer,
    [tracksApi.reducerPath]: tracksApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tracksApi.middleware),
});
```

### 6. Componente Principal de la App

```javascript
// App.js
import React from 'react';
import { Provider } from 'react-redux';
import { PlayerProvider } from '@chest-music/player';
import '@chest-music/player/dist/index.css';
import { store } from './store';
import { 
  useLazyGetTrackSourceQuery, 
  useUpdateTrackPlayMutation 
} from './api/tracksApi';
import { reset, play, next, previous, playing } from './store/playlistSlice';
import { closePlayer, openPlayer } from './store/playerSlice';

function PlayerWrapper() {
  // Configurar las dependencias del player
  const playerDependencies = {
    apiHooks: {
      useLazyGetTrackSourceQuery,
      useUpdateTrackPlayMutation
    },
    playlistActions: {
      reset,
      play,
      next, 
      previous,
      playing
    },
    playerActions: {
      closePlayer,
      openPlayer
    }
  };

  return (
    <PlayerProvider 
      apiHooks={playerDependencies.apiHooks}
      playlistActions={playerDependencies.playlistActions}
      playerActions={playerDependencies.playerActions}
    />
  );
}

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <header>
          <h1>Mi App de Música</h1>
        </header>
        
        <main>
          {/* Tu contenido principal */}
        </main>
        
        {/* Player - siempre presente en la parte inferior */}
        <PlayerWrapper />
      </div>
    </Provider>
  );
}

export default App;
```

### 7. Reproducir un Track

```javascript
// components/TrackItem.js
import React from 'react';
import { useDispatch } from 'react-redux';
import { setPlaylist } from '../store/playlistSlice';

function TrackItem({ track }) {
  const dispatch = useDispatch();

  const handlePlay = () => {
    // Configurar el track para reproducir
    const trackData = {
      id: track.id,
      name: track.name,
      authors: track.artist,
      cover: track.cover_url,
      audio: track.audio_url, // opcional si usas getTrackSource
      isPlaying: true,
      plays: track.plays || 0,
      play_limit: track.play_limit || null,
      token: track.share_token || null
    };

    // Establecer como playlist actual
    dispatch(setPlaylist([trackData]));
  };

  return (
    <div className="track-item">
      <img src={track.cover_url} alt={track.name} />
      <div>
        <h3>{track.name}</h3>
        <p>{track.artist}</p>
      </div>
      <button onClick={handlePlay}>
        Reproducir
      </button>
    </div>
  );
}
```

### 8. CSS Global (opcional)

```css
/* styles/global.css */

/* Asegurar que el player se mantenga en la parte inferior */
.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding-bottom: 120px; /* Espacio para el player */
}

/* El player se posiciona fixed automáticamente */
```

### Modal de Límite de Reproducciones

```javascript
// components/PlayLimitModal.js
import { useModal } from '../hooks/useModal';

function PlayLimitModal() {
  const { isOpen, onClose } = useModal('PlayLimitModal');
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Límite de Reproducciones Alcanzado</h2>
        <p>Has alcanzado el límite de reproducciones para este track.</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
```

### Manejo de Sesiones

```javascript
// hooks/useAuth.js
import { useEffect } from 'react';

export function useAuth() {
  useEffect(() => {
    // Establecer session_id en localStorage
    const sessionId = getSessionFromAPI();
    localStorage.setItem('chestmusic_session_id', sessionId);
  }, []);
}
```

