import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/portal-home/portal-home.component').then(
        (m) => m.PortalHomeComponent,
      ),
  },
];
