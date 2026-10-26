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
    path: 'facilities/blocks',
    loadComponent: () =>
      import('./pages/facilities/facility-blocks.component').then(
        (m) => m.FacilityBlocksComponent,
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
  {
    path: 'members',
    loadComponent: () =>
      import('./pages/members/club-members.component').then(
        (m) => m.ClubMembersComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/club-settings.component').then(
        (m) => m.ClubSettingsComponent,
      ),
  },
  {
    path: 'activity-logs',
    loadComponent: () =>
      import('./pages/activity-logs/activity-logs.component').then(
        (m) => m.ActivityLogsComponent,
      ),
  },
  {
    path: 'superadmin/clubs',
    loadComponent: () =>
      import('./pages/superadmin/clubs/superadmin-clubs.component').then(
        (m) => m.SuperAdminClubsComponent,
      ),
  },
];

