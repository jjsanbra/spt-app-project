import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService, ThemeService, UserDashboardResponseDto, UsersService } from '@core';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-portal-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, ButtonModule, TagModule, ChartModule],
  templateUrl: './portal-home.component.html',
  styleUrls: ['./portal-home.component.scss'],
})
export class PortalHomeComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly themeService = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal<boolean>(true);
  readonly dashboardData = signal<UserDashboardResponseDto | null>(null);

  activityChartData: any;
  activityChartOptions: any;

  constructor() {
    effect(() => {
      const isDark = this.themeService.isDark();
      const data = this.dashboardData();
      if (data) {
        this.buildChartConfig(data, isDark);
      }
    });
  }

  ngOnInit(): void {
    this.loadUserDashboard();
  }

  loadUserDashboard(): void {
    this.loading.set(true);
    this.usersService.usersControllerGetDashboard().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.buildChartConfig(data, this.themeService.isDark());
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private buildChartConfig(data: UserDashboardResponseDto, isDark: boolean): void {
    const textColor = isDark ? '#F1F5F9' : '#0F172A';
    const textMuted = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const primaryColor = '#FF2D78';

    const history = data.activityHistory || [];

    this.activityChartData = {
      labels: history.map((h) => h.month),
      datasets: [
        {
          label: 'Partidos',
          data: history.map((h) => h.matchesCount),
          backgroundColor: primaryColor,
          borderRadius: 6,
          barThickness: 24,
        },
      ],
    };

    this.activityChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDark ? '#334155' : '#E2E8F0',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: {
            color: textMuted,
            font: { size: 11 },
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: textMuted,
            font: { size: 11 },
          },
          grid: {
            color: gridColor,
          },
        },
      },
    };
  }
}
