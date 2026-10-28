import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AuthService,
  NotificationService,
  PageHeaderComponent,
  UsersService,
  UserSummaryDto,
} from '@core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    AvatarModule,
    CardModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
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

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user && this.profileForm.pristine) {
        this.populateForm(user);
        this.cdr.markForCheck();
      }
    });
  }

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
}
