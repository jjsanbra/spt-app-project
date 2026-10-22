import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-portal-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, ButtonModule],
  templateUrl: './portal-home.component.html',
  styleUrls: ['./portal-home.component.scss'],
})
export class PortalHomeComponent {
  readonly authService = inject(AuthService);
}
