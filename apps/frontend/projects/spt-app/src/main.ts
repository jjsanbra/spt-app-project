import 'zone.js';
import { initFederation } from '@angular-architects/native-federation';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0');

const isPreEnv = typeof window !== 'undefined' && window.location.hostname.includes('-pre');

const remoteAdmin = isLocalhost
  ? 'http://localhost:4201/remoteEntry.json'
  : isPreEnv
    ? 'https://spt-mfe-admin-pre.onrender.com/remoteEntry.json'
    : 'https://spt-mfe-admin.onrender.com/remoteEntry.json';

const remotePortal = isLocalhost
  ? 'http://localhost:4202/remoteEntry.json'
  : isPreEnv
    ? 'https://spt-mfe-portal-pre.onrender.com/remoteEntry.json'
    : 'https://spt-mfe-portal.onrender.com/remoteEntry.json';

const remoteUsers = isLocalhost
  ? 'http://localhost:4203/remoteEntry.json'
  : isPreEnv
    ? 'https://spt-mfe-users-pre.onrender.com/remoteEntry.json'
    : 'https://spt-mfe-users.onrender.com/remoteEntry.json';

initFederation(
  {
    'spt-admin': remoteAdmin,
    'spt-portal': remotePortal,
    'spt-users': remoteUsers,
  },
  {
    hostRemoteEntry: { url: './remoteEntry.json' },
  },
)
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
