import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { authGuard } from '@core';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('spt-admin', './routes').then((m) => m.routes),
  },
  {
    path: 'portal',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('spt-portal', './routes').then((m) => m.routes),
  },
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
