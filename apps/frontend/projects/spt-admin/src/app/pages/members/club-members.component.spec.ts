import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ClubMemberResponseDto,
  ClubMemberResponseDtoRole as ClubRole,
  ClubsMembersService,
  ConfirmDialogService,
  NotificationService,
} from '@core';
import { of, throwError } from 'rxjs';
import { ClubMembersComponent } from './club-members.component';

describe('ClubMembersComponent', () => {
  let component: ClubMembersComponent;
  let fixture: ComponentFixture<ClubMembersComponent>;
  let mockMembersService: any;
  let mockNotify: any;
  let mockConfirm: any;

  const mockMember: ClubMemberResponseDto = {
    id: 'mem-1',
    userId: 'user-1',
    clubId: 'club-1',
    role: ClubRole.MEMBER,
    walletBalance: 25.0,
    memberNumber: 'SOC-001' as any,
    isActive: true,
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-20T10:00:00.000Z',
    user: {
      id: 'user-1',
      email: 'socio@club.com',
      firstName: 'Laura',
      lastName: 'Gómez',
      phone: null,
      avatarUrl: null,
    },
  };

  beforeEach(async () => {
    mockMembersService = {
      clubsMembersControllerFindAll: vi.fn().mockReturnValue(of([mockMember])),
      clubsMembersControllerInvite: vi.fn().mockReturnValue(of(mockMember)),
      clubsMembersControllerUpdateRole: vi.fn().mockReturnValue(of({ ...mockMember, role: ClubRole.ADMIN })),
      clubsMembersControllerUpdateStatus: vi.fn().mockReturnValue(of({ ...mockMember, isActive: false })),
      clubsMembersControllerRemove: vi.fn().mockReturnValue(of({ success: true, message: 'OK' })),
    };

    mockNotify = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    mockConfirm = {
      confirm: vi.fn(),
      confirmDelete: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ClubMembersComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService(),
        { provide: ClubsMembersService, useValue: mockMembersService },
        { provide: NotificationService, useValue: mockNotify },
        { provide: ConfirmDialogService, useValue: mockConfirm },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar miembros en ngOnInit', () => {
    expect(component).toBeTruthy();
    expect(mockMembersService.clubsMembersControllerFindAll).toHaveBeenCalled();
    expect(component.members.length).toBe(1);
    expect(component.members[0].user.firstName).toBe('Laura');
  });

  it('debe abrir y cerrar la modal de invitación limpiando el formulario', () => {
    component.openInviteModal();
    expect(component.displayInviteModal).toBe(true);

    component.closeInviteModal();
    expect(component.displayInviteModal).toBe(false);
  });

  it('debe invitar un nuevo socio con éxito y recargar lista', () => {
    component.openInviteModal();
    component.inviteForm.setValue({
      email: 'nuevo@club.com',
      role: ClubRole.MEMBER,
      memberNumber: 'SOC-002',
    });

    component.submitInvite();

    expect(mockMembersService.clubsMembersControllerInvite).toHaveBeenCalledWith({
      email: 'nuevo@club.com',
      role: ClubRole.MEMBER,
      memberNumber: 'SOC-002',
    });
    expect(mockNotify.success).toHaveBeenCalledWith('ADMIN.MEMBERS.SUCCESS_INVITE');
    expect(component.displayInviteModal).toBe(false);
  });

  it('debe abrir modal de rol y modificarlo correctamente', () => {
    component.openRoleModal(mockMember);
    expect(component.displayRoleModal).toBe(true);
    expect(component.selectedMember?.id).toBe(mockMember.id);

    component.roleForm.patchValue({ role: ClubRole.ADMIN });
    component.submitRoleChange();

    expect(mockMembersService.clubsMembersControllerUpdateRole).toHaveBeenCalledWith(
      mockMember.id,
      { role: ClubRole.ADMIN },
    );
    expect(mockNotify.success).toHaveBeenCalledWith('ADMIN.MEMBERS.SUCCESS_ROLE_UPDATE');
    expect(component.displayRoleModal).toBe(false);
  });

  it('debe manejar error al intentar degradar al último OWNER', () => {
    mockMembersService.clubsMembersControllerUpdateRole.mockReturnValue(
      throwError(() => ({ status: 400 })),
    );

    component.openRoleModal({ ...mockMember, role: ClubRole.OWNER });
    component.roleForm.patchValue({ role: ClubRole.ADMIN });
    component.submitRoleChange();

    expect(mockNotify.error).toHaveBeenCalledWith('ADMIN.MEMBERS.ERROR_OWNER_PROTECTED');
  });

  it('debe solicitar confirmación al dar de baja una membresía', () => {
    component.confirmRemoveMember(mockMember);

    expect(mockConfirm.confirmDelete).toHaveBeenCalled();
  });
});
