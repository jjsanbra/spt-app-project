import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/portal-home/portal-home.component').then(
        (m) => m.PortalHomeComponent,
      ),
  },
  {
    path: 'book',
    loadComponent: () =>
      import('./pages/bookings/bookings-grid.component').then(
        (m) => m.BookingsGridComponent,
      ),
  },
  {
    path: 'my-bookings',
    loadComponent: () =>
      import('./pages/bookings/my-bookings.component').then(
        (m) => m.MyBookingsComponent,
      ),
  },
  {
    path: 'open-matches',
    loadComponent: () =>
      import('./pages/open-matches/open-matches.component').then(
        (m) => m.OpenMatchesComponent,
      ),
  },
];
