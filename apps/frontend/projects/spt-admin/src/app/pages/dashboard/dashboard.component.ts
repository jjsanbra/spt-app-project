import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  AuthService,
  ClubDashboardResponseDto,
  ClubsDashboardService,
  SuperAdminClubsService,
  SuperadminOverviewResponseDto,
  ThemeService,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { MeterGroupModule } from 'primeng/metergroup';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    TagModule,
    ButtonModule,
    ChartModule,
    MeterGroupModule,
    ProgressBarModule,
    SelectModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly clubsDashboardService = inject(ClubsDashboardService);
  private readonly superAdminClubsService = inject(SuperAdminClubsService);
  private readonly themeService = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal<boolean>(true);
  readonly dashboardData = signal<ClubDashboardResponseDto | null>(null);
  readonly superadminOverview = signal<SuperadminOverviewResponseDto | null>(null);
  readonly clubOptions = signal<{ label: string; value: string }[]>([]);
  readonly selectedClubId = signal<string>('');

  trendChartData: any;
  trendChartOptions: any;
  sportChartData: any;
  sportChartOptions: any;
  sportMeters: any[] = [];

  constructor() {
    effect(() => {
      // Reacciona al cambio de tema para actualizar colores de gráficas
      const isDark = this.themeService.isDark();
      const data = this.dashboardData();
      if (data) {
        this.buildChartConfigs(data, isDark);
      }
    });
  }

  ngOnInit(): void {
    this.initDashboard();
  }

  initDashboard(): void {
    this.loading.set(true);

    if (this.authService.isSuperAdmin()) {
      this.loadSuperadminData();
    } else {
      this.loadClubDashboard();
    }
  }

  loadSuperadminData(): void {
    this.superAdminClubsService.superAdminClubsControllerGetOverview().subscribe({
      next: (overview) => {
        this.superadminOverview.set(overview);
        this.cdr.markForCheck();
      },
    });

    this.superAdminClubsService.superAdminClubsControllerFindAll().subscribe({
      next: (res) => {
        const options = (res.items || []).map((c) => ({
          label: c.name,
          value: c.id,
        }));
        this.clubOptions.set(options);

        // Si ya hay un club activo o el primero de la lista
        const activeId = this.authService.activeClub()?.clubId || (options.length > 0 ? options[0].value : '');
        this.selectedClubId.set(activeId);

        if (activeId) {
          this.loadClubDashboard(activeId);
        } else {
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  loadClubDashboard(overrideClubId?: string): void {
    const clubId = overrideClubId || this.authService.activeClub()?.clubId;

    if (!clubId) {
      this.loading.set(false);
      this.cdr.markForCheck();
      return;
    }

    if (this.authService.canViewFinancials()) {
      this.clubsDashboardService.clubDashboardControllerGetDashboard().subscribe({
        next: (data) => {
          this.dashboardData.set(data);
          this.buildChartConfigs(data, this.themeService.isDark());
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading.set(false);
          this.cdr.markForCheck();
        },
      });
    } else {
      // Rol Staff: Carga operativa
      this.clubsDashboardService.clubDashboardControllerGetOperationalDashboard().subscribe({
        next: (res) => {
          this.dashboardData.set({
            today: res.today,
            month: {
              totalRevenue: 0,
              revenueGrowthPercent: 0,
              occupancyPercent: 0,
              averageTicketPrice: 0,
              newMembersCount: 0,
            },
            revenueBySport: [],
            occupancyTrend: [],
          });
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading.set(false);
          this.cdr.markForCheck();
        },
      });
    }
  }

  onClubChange(clubId: string): void {
    this.selectedClubId.set(clubId);
    this.loading.set(true);
    this.loadClubDashboard(clubId);
  }

  private buildChartConfigs(data: ClubDashboardResponseDto, isDark: boolean): void {
    const textColor = isDark ? '#F1F5F9' : '#0F172A';
    const textMuted = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const primaryColor = '#FF2D78';
    const primaryGlow = isDark ? 'rgba(255, 45, 120, 0.25)' : 'rgba(255, 45, 120, 0.15)';

    // 1. Gráfico de Tendencia de Ocupación (Líneas / Área)
    const trendLabels = (data.occupancyTrend || []).map((t) => t.label);
    const trendValues = (data.occupancyTrend || []).map((t) => t.occupancyPercent);

    this.trendChartData = {
      labels: trendLabels,
      datasets: [
        {
          label: '% Ocupación',
          data: trendValues,
          fill: true,
          borderColor: primaryColor,
          backgroundColor: primaryGlow,
          tension: 0.35,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#FFFFFF',
          pointHoverRadius: 6,
          borderWidth: 2.5,
        },
      ],
    };

    this.trendChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 2.2,
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
          padding: 10,
          boxPadding: 4,
          usePointStyle: true,
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
          min: 0,
          max: 100,
          ticks: {
            color: textMuted,
            font: { size: 11 },
            callback: (val: any) => `${val}%`,
          },
          grid: {
            color: gridColor,
          },
        },
      },
    };

    // 2. Gráfico de Ingresos por Deporte (Donut)
    const sports = data.revenueBySport || [];
    const sportColors = ['#FF2D78', '#00D26A', '#6366F1', '#F59E0B', '#06B6D4'];

    this.sportChartData = {
      labels: sports.map((s) => s.label),
      datasets: [
        {
          data: sports.map((s) => s.amount),
          backgroundColor: sportColors.slice(0, sports.length),
          borderColor: isDark ? '#141326' : '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };

    this.sportChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            usePointStyle: true,
            boxWidth: 8,
            font: { size: 12 },
          },
        },
      },
      cutout: '70%',
    };

    // 3. MeterGroup ligero para cuota por deporte
    this.sportMeters = sports.map((s, idx) => ({
      label: s.label,
      value: s.percent,
      color: sportColors[idx % sportColors.length],
    }));
  }
}
