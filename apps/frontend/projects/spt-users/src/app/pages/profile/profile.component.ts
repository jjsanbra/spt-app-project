import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AuthService,
  ClubMembershipSummaryDto,
  UsersService,
  UserSummaryDto,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    CardModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    ToastModule,
    DividerModule,
  ],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  profileForm: FormGroup = this.fb.group({
    email: [{ value: '', disabled: true }],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phone: [''],
  });

  loading = false;

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.populateForm(user);
    }
  }

  private populateForm(user: UserSummaryDto): void {
    this.profileForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
    });
  }

  onSelectActiveClub(club: ClubMembershipSummaryDto): void {
    this.authService.setActiveClub(club);
    this.messageService.add({
      severity: 'info',
      summary: this.translate.instant('USERS.ACTIVE_CLUB'),
      detail: club.clubName,
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { firstName, lastName, phone } = this.profileForm.value;

    this.usersService
      .usersControllerUpdateProfile({
        firstName,
        lastName,
        phone: phone || undefined,
      })
      .subscribe({
        next: (updatedUser) => {
          this.loading = false;
          this.authService.setCurrentUser(updatedUser);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('APP.NAME'),
            detail: this.translate.instant('USERS.UPDATE_SUCCESS'),
          });
        },
        error: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERRORS.GENERIC'),
            detail: this.translate.instant('ERRORS.GENERIC'),
          });
        },
      });
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (role) {
      case 'OWNER':
        return 'danger';
      case 'ADMIN':
        return 'warn';
      case 'STAFF':
        return 'info';
      case 'MEMBER':
        return 'success';
      default:
        return 'secondary';
    }
  }
}
