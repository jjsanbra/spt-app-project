import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      loadRemoteModule('spt-users', './routes').then((m) => m.routes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
