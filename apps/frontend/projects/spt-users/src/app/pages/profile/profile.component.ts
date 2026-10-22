import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AuthService,
  ClubMembershipSummaryDto,
  NotificationService,
  UsersService,
  UserSummaryDto,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    InputTextModule,
    ButtonModule,
    TagModule,
    DividerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly notify = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

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
    this.notify.info(club.clubName, 'USERS.ACTIVE_CLUB');
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();
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
          this.notify.success('USERS.UPDATE_SUCCESS', 'APP.NAME');
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.notify.error('ERRORS.GENERIC', 'ERRORS.GENERIC');
          this.cdr.markForCheck();
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
