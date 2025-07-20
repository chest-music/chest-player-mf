# @chest-music/player

Paquete NPM independiente que contiene todos los componentes del Player.

## 📦 Instalación

```bash
npm install git+ssh://git@github.com/cexar-io/chest-player-mf.git
```

O usando pnpm:

```bash
pnpm add git+ssh://git@github.com/cexar-io/chest-player-mf.git
```

### Dependencias Peer

Asegúrate de tener instaladas las siguientes dependencias en tu proyecto principal:

```bash
npm install react react-dom react-redux @reduxjs/toolkit framer-motion @heroicons/react
```

## Uso

### 1. Importar el componente

```javascript
import { PlayerProvider } from '@chest-music/player';
import '@chest-music/player/dist/index.css';
```

### 2. Configurar las dependencias

El player requiere que proveas ciertas dependencias de tu app principal a través del componente `PlayerProvider`:

```javascript
import { PlayerProvider } from '@chest-music/player';
import { useGetTrackSourceQuery, useUpdateTrackPlayMutation } from './api/tracks';
import { reset, play, next, previous, playing } from './store/playlist';
import { closePlayer, openPlayer } from './store/player';

function App() {
  // Configurar las dependencias que necesita el player
  const playerDependencies = {
    apiHooks: {
      useLazyGetTrackSourceQuery: useGetTrackSourceQuery,
      useUpdateTrackPlayMutation: useUpdateTrackPlayMutation
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
    <div className="App">
      {/* Tu app content */}
      
      {/* Player component */}
      <PlayerProvider 
        apiHooks={playerDependencies.apiHooks}
        playlistActions={playerDependencies.playlistActions}
        playerActions={playerDependencies.playerActions}
      />
    </div>
  );
}
```

### 3. Estructura del Store Redux Requerida

El player espera que tu store Redux tenga una estructura específica para el estado de la playlist:

```javascript
// Estado esperado en store.playlist
{
  playlist: [
    {
      id: "track-id",
      name: "Track Name",
      authors: "Artist Name",
      cover: "cover-url",
      audio: "audio-url", // opcional si usas getTrackSource
      isPlaying: true,
      plays: 0,
      play_limit: 10,
      token: "shared-token" // para tracks compartidos
    }
  ],
  playing: true
}
```

## 🔧 API de Dependencias

### apiHooks

- `useLazyGetTrackSourceQuery`: Hook para obtener la URL de audio de un track
- `useUpdateTrackPlayMutation`: Hook para actualizar el contador de reproducciones


## 📄 Estructura del Proyecto

```
src/
├── components/           # Componentes del player
│   ├── Player.js        # Componente principal
│   ├── PlayerProvider.js # Wrapper con inyección de dependencias
│   ├── Controls.js      # Controles de reproducción
│   ├── Track.js         # Info del track
│   └── ...
├── hooks/               # Hooks personalizados
├── styles/              # Estilos CSS
├── utils/               # Utilidades
└── assets/              # Iconos SVG
```

##  Notas

1. **Dependencias**: El paquete usa peer dependencies para evitar duplicados de React/Redux
2. **Estado Redux**: Debe mantener la estructura esperada en `store.playlist`
3. **Inyección de Dependencias**: Todas las acciones de Redux se inyectan via props
4. **Sesiones**: El player accede automáticamente a localStorage para sesiones
5. **Builds**: El paquete incluye builds tanto CommonJS como ES Modules
