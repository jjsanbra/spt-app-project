import { initFederation } from '@angular-architects/native-federation';

initFederation(
  {
    sptAdmin: 'http://localhost:4200/remoteEntry.json',
    sptPortal: 'http://localhost:4200/remoteEntry.json',
    sptUsers: 'http://localhost:4200/remoteEntry.json',
  },
  {
    hostRemoteEntry: { url: './remoteEntry.json' },
  },
)
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
