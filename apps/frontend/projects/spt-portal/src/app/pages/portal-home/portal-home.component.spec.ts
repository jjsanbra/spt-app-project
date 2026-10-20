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
import { PortalHomeComponent } from './portal-home.component';

describe('PortalHomeComponent', () => {
  let component: PortalHomeComponent;
  let fixture: ComponentFixture<PortalHomeComponent>;
  let authServiceMock: any;

  const mockPlayerUser: UserSummaryDto = getAuthControllerGetMeResponseMock({
    id: 'player-user-1',
    email: 'socio@spt-app.local',
    firstName: 'Marcos',
    lastName: 'Gómez',
    isSuperAdmin: false,
    memberships: [
      {
        clubId: 'club-central',
        clubName: 'Club Deportivo Central Pádel & Tenis',
        clubSlug: 'central-padel',
        role: 'MEMBER',
        memberNumber: 'SOC-001',
        walletBalance: 50.0,
      },
    ],
  });

  const currentUserSignal = signal<UserSummaryDto | null>(mockPlayerUser);

  beforeEach(async () => {
    currentUserSignal.set(mockPlayerUser);

    authServiceMock = {
      currentUser: currentUserSignal,
    };

    await TestBed.configureTestingModule({
      imports: [PortalHomeComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortalHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el saludo con el nombre de pila del usuario', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitleEl = compiled.querySelector('.welcome-subtitle');
    expect(subtitleEl?.textContent).toContain('Marcos');
  });

  it('debe renderizar el botón de acceso rápido al perfil', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttonEl = compiled.querySelector('button[pButton]');
    expect(buttonEl).toBeTruthy();
  });
});
