import { initFederation } from '@angular-architects/native-federation';

initFederation(
  {
    'spt-admin': 'http://localhost:4201/remoteEntry.json',
    'spt-portal': 'http://localhost:4202/remoteEntry.json',
    'spt-users': 'http://localhost:4203/remoteEntry.json',
  },
  {
    hostRemoteEntry: { url: './remoteEntry.json' },
  },
)
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
