# 🏴‍☠️ Chest Player MF

audio player micro-frontend Chest Music, built with React and Webpack 5 Module Federation.


## Architecture

```
chest-player-mf/
├── src/
│   ├── core/                    # Core functionality
│   │   ├── hooks/              # Custom hooks (useAudioPlayer)
│   │   ├── context/            # React context (PlayerProvider)
│   │   └── utils/              # Utility functions
│   ├── components/             # UI Components
│   │   ├── Player.js           # Main player component
│   │   ├── base/               # Base components
│   │   ├── skins/              # Web/Mobile variants
│   │   └── shared/             # Shared components
│   └── services/               # API integration
├── webpack.config.js           # Module Federation config
├── public/                     # Static assets
└── dist/                       # Built assets
```

## Module Federation Exports

The micro-frontend exposes the following modules:

- `./Player` - Main player component
- `./PlayerProvider` - React context provider
- `./useAudioPlayer` - Audio player hook
- `./PlayerWeb` - Desktop skin
- `./PlayerMobile` - Mobile skin
- `./playerUtils` - Utility functions

## Development

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Start Storybook
npm run storybook
```

### Development Server

The development server runs on `http://localhost:3001` and includes:

- Hot module replacement
- CORS headers for cross-origin requests
- Standalone development mode with mock data

## Integration

### Web Application (Host)

```javascript
// webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        'chest-player-mf': 'chestPlayerMF@https://cdn.chestmusic.com/player-mf/remoteEntry.js'
      }
    })
  ]
};
```

```jsx
// App.js
import React, { Suspense } from 'react';

const PlayerProvider = React.lazy(() => import('chest-player-mf/PlayerProvider'));
const Player = React.lazy(() => import('chest-player-mf/Player'));

function App() {
  const playlist = [
    {
      id: '1',
      title: 'Song Title',
      artist: 'Artist Name',
      src: 'https://example.com/song.mp3',
      cover: 'https://example.com/cover.jpg'
    }
  ];

  return (
    <Suspense fallback={<div>Loading player...</div>}>
      <PlayerProvider initialPlaylist={playlist}>
        <div className=\"app\">
          {/* Your app content */}
          <Player skin=\"web\" />
        </div>
      </PlayerProvider>
    </Suspense>
  );
}
```

### Capacitor Mobile App

```javascript
// capacitor.config.ts
export default {
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};
```

```jsx
// MobileApp.js
import React, { Suspense } from 'react';

const PlayerProvider = React.lazy(() => 
  import('chest-player-mf/PlayerProvider').catch(() => 
    import('./fallback/PlayerProvider') // Local fallback
  )
);

const Player = React.lazy(() => 
  import('chest-player-mf/Player').catch(() => 
    import('./fallback/Player') // Local fallback
  )
);

function MobileApp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerProvider>
        <Player skin=\"mobile\" />
      </PlayerProvider>
    </Suspense>
  );
}
```


