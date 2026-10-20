import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  AuthService,
  UserSummaryDto,
  getAuthControllerGetMeResponseMock,
} from '@core';
import { AdminDashboardComponent } from './dashboard.component';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let authServiceMock: any;

  const mockAdminUser: UserSummaryDto = getAuthControllerGetMeResponseMock({
    id: 'admin-user-1',
    email: 'admin@centralpadel.local',
    firstName: 'Carlos',
    lastName: 'Director',
    isSuperAdmin: false,
    memberships: [
      {
        clubId: 'club-central',
        clubName: 'Club Deportivo Central Pádel & Tenis',
        clubSlug: 'central-padel',
        role: 'ADMIN',
        walletBalance: 0,
      },
    ],
  });

  const currentUserSignal = signal<UserSummaryDto | null>(mockAdminUser);
  const isSuperAdminSignal = signal<boolean>(false);

  beforeEach(async () => {
    currentUserSignal.set(mockAdminUser);
    isSuperAdminSignal.set(false);

    authServiceMock = {
      currentUser: currentUserSignal,
      isSuperAdmin: isSuperAdminSignal,
    };

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el nombre y apellido del usuario autenticado', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nameEl = compiled.querySelector('.user-fullname');
    expect(nameEl?.textContent).toContain('Carlos Director');
  });

  it('no debe mostrar el badge de Superadmin si el usuario es solo Admin de club', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tag = compiled.querySelector('p-tag');
    expect(tag).toBeNull();
  });

  it('debe mostrar el badge de Superadmin si isSuperAdmin es true', async () => {
    const superAdminUser = getAuthControllerGetMeResponseMock({
      id: 'superadmin-1',
      email: 'superadmin@spt-app.local',
      firstName: 'Super',
      lastName: 'Admin',
      isSuperAdmin: true,
      memberships: [],
    });

    currentUserSignal.set(superAdminUser);
    isSuperAdminSignal.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const tag = compiled.querySelector('p-tag');
    expect(tag).toBeTruthy();
  });
});
