import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ActivityLogItemDto,
  ActivityLogItemDtoAction,
  ActivityLogsControllerFindClubLogsParams,
  ActivityLogsService,
  AuthService,
  NotificationService,
  PageHeaderComponent,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

export interface CategoryOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    PageHeaderComponent,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    DividerModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TooltipModule,
  ],
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss'],
})
export class ActivityLogsComponent implements OnInit {
  private readonly activityLogsService = inject(ActivityLogsService);
  private readonly authService = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  logs: ActivityLogItemDto[] = [];
  totalRecords = 0;
  loading = false;
  page = 1;
  rows = 20;

  selectedCategory = 'ALL';
  dateRange: Date[] | null = null;
  searchTerm = '';

  selectedLog: ActivityLogItemDto | null = null;
  displayModal = false;

  get categoryOptions(): CategoryOption[] {
    return [
      { label: this.translate.instant('ADMIN.LOGS.CATEGORY_ALL'), value: 'ALL' },
      { label: this.translate.instant('ADMIN.LOGS.CATEGORY_BOOKINGS'), value: 'Booking' },
      { label: this.translate.instant('ADMIN.LOGS.CATEGORY_FACILITIES'), value: 'Facility' },
      { label: this.translate.instant('ADMIN.LOGS.CATEGORY_PRICING'), value: 'PricingRule' },
      { label: this.translate.instant('ADMIN.LOGS.CATEGORY_MEMBERS'), value: 'ClubMembership' },
      { label: this.translate.instant('ADMIN.LOGS.CATEGORY_AUTH'), value: 'User' },
    ];
  }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
    this.loadLogs();
  }

  loadLogs(event?: TableLazyLoadEvent): void {
    const club = this.authService.activeClub();
    if (!club) {
      this.logs = [];
      this.totalRecords = 0;
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    if (event) {
      const first = event.first ?? 0;
      const eventRows = event.rows ?? this.rows;
      this.rows = eventRows;
      this.page = Math.floor(first / eventRows) + 1;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const params: ActivityLogsControllerFindClubLogsParams = {
      page: this.page,
      limit: this.rows,
    };

    if (this.selectedCategory !== 'ALL') {
      params.entityType = this.selectedCategory;
    }

    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      params.search = this.searchTerm.trim();
    }

    if (this.dateRange && this.dateRange[0]) {
      params.startDate = this.dateRange[0].toISOString();
      if (this.dateRange[1]) {
        params.endDate = this.dateRange[1].toISOString();
      }
    }

    this.activityLogsService
      .activityLogsControllerFindClubLogs(club.clubId, params)
      .subscribe({
        next: (res) => {
          this.logs = res.data;
          this.totalRecords = res.total;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.notify.error('ERRORS.NETWORK');
          this.cdr.markForCheck();
        },
      });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadLogs();
  }

  clearFilters(): void {
    this.selectedCategory = 'ALL';
    this.dateRange = null;
    this.searchTerm = '';
    this.page = 1;
    this.loadLogs();
  }

  openDetail(log: ActivityLogItemDto): void {
    this.selectedLog = log;
    this.displayModal = true;
    this.cdr.markForCheck();
  }

  copyJson(): void {
    if (!this.selectedLog?.metadata || !navigator?.clipboard) return;
    const jsonStr = JSON.stringify(this.selectedLog.metadata, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      this.notify.info('ADMIN.LOGS.COPIED');
    });
  }

  exportCsv(): void {
    if (this.logs.length === 0) return;

    const headers = [
      'Fecha',
      'Usuario',
      'Email',
      'Accion',
      'Entidad',
      'Resumen',
      'IP',
    ];

    const rows = this.logs.map((log) => [
      `"${new Date(log.createdAt).toLocaleString('es-ES')}"`,
      `"${log.user?.fullName || 'Sistema'}"`,
      `"${log.user?.email || '-'}"`,
      `"${log.action}"`,
      `"${log.entityType}"`,
      `"${log.summary.replace(/"/g, '""')}"`,
      `"${log.ipAddress || '-'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_actividad_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getActionSeverity(action: ActivityLogItemDtoAction): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (action.includes('CREATED') || action.includes('SUCCESS') || action.includes('TOPUP')) {
      return 'success';
    }
    if (action.includes('UPDATED') || action.includes('MODIFIED') || action.includes('ROLE')) {
      return 'warn';
    }
    if (action.includes('DELETED') || action.includes('CANCELLED') || action.includes('FAILED')) {
      return 'danger';
    }
    return 'info';
  }
}
