import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'facilities',
    loadComponent: () =>
      import('./pages/facilities/facilities-list.component').then(
        (m) => m.FacilitiesListComponent,
      ),
  },
  {
    path: 'facilities/:id/blocks',
    loadComponent: () =>
      import('./pages/facilities/facility-blocks.component').then(
        (m) => m.FacilityBlocksComponent,
      ),
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./pages/pricing/pricing-list.component').then(
        (m) => m.PricingListComponent,
      ),
  },
];
