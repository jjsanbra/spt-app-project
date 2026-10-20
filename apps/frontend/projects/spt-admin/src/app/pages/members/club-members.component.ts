import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ClubMemberResponseDto,
  ClubMemberResponseDtoRole as ClubRole,
  ClubsMembersService,
  ConfirmDialogService,
  NotificationService,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-club-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './club-members.component.html',
  styleUrls: ['./club-members.component.scss'],
})
export class ClubMembersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly membersService = inject(ClubsMembersService);
  private readonly notify = inject(NotificationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);

  members: ClubMemberResponseDto[] = [];
  loading = false;
  saving = false;

  // Modales
  displayInviteModal = false;
  displayRoleModal = false;
  selectedMember: ClubMemberResponseDto | null = null;

  // Filtros
  searchTerm = '';
  selectedRoleFilter: ClubRole | null = null;

  // Formulario de invitación
  inviteForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    role: [ClubRole.MEMBER, [Validators.required]],
    memberNumber: [''],
  });

  // Formulario de cambio de rol
  roleForm: FormGroup = this.fb.group({
    role: [ClubRole.MEMBER, [Validators.required]],
  });
  get roleOptions() {
    return [
      { label: this.translate.instant('ADMIN.MEMBERS.ROLE_OWNER'), value: ClubRole.OWNER },
      { label: this.translate.instant('ADMIN.MEMBERS.ROLE_ADMIN'), value: ClubRole.ADMIN },
      { label: this.translate.instant('ADMIN.MEMBERS.ROLE_STAFF'), value: ClubRole.STAFF },
      { label: this.translate.instant('ADMIN.MEMBERS.ROLE_MEMBER'), value: ClubRole.MEMBER },
    ];
  }

  get filterRoleOptions() {
    return [
      { label: this.translate.instant('ADMIN.MEMBERS.FILTER_ALL_ROLES'), value: null },
      ...this.roleOptions,
    ];
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading = true;
    this.membersService
      .clubsMembersControllerFindAll({
        role: this.selectedRoleFilter ?? undefined,
        search: this.searchTerm ? this.searchTerm.trim() : undefined,
      })
      .subscribe({
        next: (data) => {
          this.members = data;
          this.loading = false;
        },
        error: () => {
          this.notify.error('ERRORS.SERVER_ERROR');
          this.loading = false;
        },
      });
  }

  onSearchChange(): void {
    this.loadMembers();
  }

  onRoleFilterChange(event: any): void {
    this.selectedRoleFilter = event.value;
    this.loadMembers();
  }

  openInviteModal(): void {
    this.inviteForm.reset({
      email: '',
      role: ClubRole.MEMBER,
      memberNumber: '',
    });
    this.displayInviteModal = true;
  }

  closeInviteModal(): void {
    this.displayInviteModal = false;
  }

  submitInvite(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.inviteForm.value;

    this.membersService
      .clubsMembersControllerInvite({
        email: formValue.email.trim(),
        role: formValue.role,
        memberNumber: formValue.memberNumber ? formValue.memberNumber.trim() : undefined,
      })
      .subscribe({
        next: () => {
          this.notify.success('ADMIN.MEMBERS.SUCCESS_INVITE');
          this.saving = false;
          this.displayInviteModal = false;
          this.loadMembers();
        },
        error: (err) => {
          this.saving = false;
          if (err.status === 409) {
            this.notify.error('El usuario ya pertenece a este club');
          } else {
            this.notify.error('ERRORS.SERVER_ERROR');
          }
        },
      });
  }

  openRoleModal(member: ClubMemberResponseDto): void {
    this.selectedMember = member;
    this.roleForm.patchValue({
      role: member.role,
    });
    this.displayRoleModal = true;
  }

  closeRoleModal(): void {
    this.displayRoleModal = false;
    this.selectedMember = null;
  }

  submitRoleChange(): void {
    if (!this.selectedMember || this.roleForm.invalid) return;

    this.saving = true;
    const newRole = this.roleForm.value.role;

    this.membersService
      .clubsMembersControllerUpdateRole(this.selectedMember.id, { role: newRole })
      .subscribe({
        next: () => {
          this.notify.success('ADMIN.MEMBERS.SUCCESS_ROLE_UPDATE');
          this.saving = false;
          this.displayRoleModal = false;
          this.selectedMember = null;
          this.loadMembers();
        },
        error: (err) => {
          this.saving = false;
          if (err.status === 400) {
            this.notify.error('ADMIN.MEMBERS.ERROR_OWNER_PROTECTED');
          } else {
            this.notify.error('ERRORS.SERVER_ERROR');
          }
        },
      });
  }

  toggleMemberStatus(member: ClubMemberResponseDto): void {
    const newStatus = !member.isActive;

    if (!newStatus) {
      this.confirmService.confirm({
        headerKey: 'ADMIN.MEMBERS.CONFIRM_DEACTIVATE_TITLE',
        messageKey: 'ADMIN.MEMBERS.CONFIRM_DEACTIVATE_MSG',
        severity: 'warn',
        onAccept: () => this.applyStatusChange(member, newStatus),
      });
    } else {
      this.applyStatusChange(member, newStatus);
    }
  }

  private applyStatusChange(member: ClubMemberResponseDto, isActive: boolean): void {
    this.membersService
      .clubsMembersControllerUpdateStatus(member.id, { isActive })
      .subscribe({
        next: () => {
          this.notify.success('ADMIN.MEMBERS.SUCCESS_STATUS_UPDATE');
          this.loadMembers();
        },
        error: (err) => {
          if (err.status === 400) {
            this.notify.error('ADMIN.MEMBERS.ERROR_OWNER_PROTECTED');
          } else {
            this.notify.error('ERRORS.SERVER_ERROR');
          }
        },
      });
  }

  confirmRemoveMember(member: ClubMemberResponseDto): void {
    this.confirmService.confirmDelete({
      headerKey: 'ADMIN.MEMBERS.CONFIRM_DELETE_TITLE',
      messageKey: 'ADMIN.MEMBERS.CONFIRM_DELETE_MSG',
      onAccept: () => {
        this.membersService.clubsMembersControllerRemove(member.id).subscribe({
          next: () => {
            this.notify.success('ADMIN.MEMBERS.SUCCESS_DELETE');
            this.loadMembers();
          },
          error: (err) => {
            if (err.status === 400) {
              this.notify.error('ADMIN.MEMBERS.ERROR_OWNER_PROTECTED');
            } else {
              this.notify.error('ERRORS.SERVER_ERROR');
            }
          },
        });
      },
    });
  }

  getRoleSeverity(role: ClubRole): 'danger' | 'info' | 'warn' | 'secondary' {
    switch (role) {
      case ClubRole.OWNER:
        return 'danger';
      case ClubRole.ADMIN:
        return 'info';
      case ClubRole.STAFF:
        return 'warn';
      case ClubRole.MEMBER:
      default:
        return 'secondary';
    }
  }
}
