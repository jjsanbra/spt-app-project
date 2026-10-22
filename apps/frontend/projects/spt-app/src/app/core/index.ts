// Modelos e interfaces generadas por Orval
export * from './api/model';

// Clientes y endpoints de red generados por Orval
export { AuthService as AuthApiService } from './api/endpoints/auth/auth.service';
export { HealthService } from './api/endpoints/health/health.service';
export { UsersService } from './api/endpoints/users/users.service';
export { FacilitiesService } from './api/endpoints/facilities/facilities.service';
export { PricingService } from './api/endpoints/pricing/pricing.service';
export { ClubsMembersService } from './api/endpoints/clubs-members/clubs-members.service';
export { ClubsSettingsService } from './api/endpoints/clubs-settings/clubs-settings.service';
export { BookingsService } from './api/endpoints/bookings/bookings.service';
export { NotificationsService } from './api/endpoints/notifications/notifications.service';
export {
  SuperadminClubsService,
  SuperadminClubsService as SuperAdminClubsService,
} from './api/endpoints/superadmin-clubs/superadmin-clubs.service';

// Servicios de infraestructura y UI
export * from './services/auth.service';
export * from './services/notification.service';
export * from './services/confirm-dialog.service';
export * from './services/realtime-notifications.service';
export * from './services/theme.service';

// Interceptores y Guards
export * from './interceptors/auth.interceptor';
export * from './guards/auth.guard';

// Mocks y generadores de datos ficticios generados por Orval
export * from './api/endpoints/auth/auth.faker';
export * from './api/endpoints/users/users.faker';
export * from './api/endpoints/facilities/facilities.faker';
export * from './api/endpoints/pricing/pricing.faker';
export * from './api/endpoints/bookings/bookings.faker';
export * from './api/endpoints/notifications/notifications.faker';
export * from './api/endpoints/superadmin-clubs/superadmin-clubs.faker';
