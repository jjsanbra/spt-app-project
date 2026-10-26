import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ActivityLogItemDto,
  ActivityLogsControllerFindMyLogsParams,
  ActivityLogsService,
  NotificationService,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

export interface UserCategoryFilter {
  label: string;
  value: string;
}

@Component({
  selector: 'app-user-activity',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    TranslatePipe,
    CardModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    DividerModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
  ],
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
})
export class UserActivityComponent implements OnInit {
  private readonly activityLogsService = inject(ActivityLogsService);
  private readonly notify = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  logs: ActivityLogItemDto[] = [];
  totalRecords = 0;
  loading = false;
  page = 1;
  rows = 15;

  selectedCategory = 'ALL';
  searchTerm = '';

  selectedLog: ActivityLogItemDto | null = null;
  displayModal = false;

  get categoryOptions(): UserCategoryFilter[] {
    return [
      { label: this.translate.instant('PORTAL.ACTIVITY.FILTER_ALL'), value: 'ALL' },
      { label: this.translate.instant('PORTAL.ACTIVITY.FILTER_BOOKINGS'), value: 'Booking' },
      { label: this.translate.instant('PORTAL.ACTIVITY.FILTER_WALLET'), value: 'ClubMembership' },
      { label: this.translate.instant('PORTAL.ACTIVITY.FILTER_SECURITY'), value: 'User' },
    ];
  }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
    this.loadLogs();
  }

  loadLogs(event?: TableLazyLoadEvent): void {
    if (event) {
      const first = event.first ?? 0;
      const eventRows = event.rows ?? this.rows;
      this.rows = eventRows;
      this.page = Math.floor(first / eventRows) + 1;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const params: ActivityLogsControllerFindMyLogsParams = {
      page: this.page,
      limit: this.rows,
    };

    if (this.selectedCategory !== 'ALL') {
      params.entityType = this.selectedCategory;
    }

    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      params.search = this.searchTerm.trim();
    }

    this.activityLogsService.activityLogsControllerFindMyLogs(params).subscribe({
      next: (res) => {
        this.logs = res.data;
        this.totalRecords = res.total;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.notify.error('ERRORS.SERVER_ERROR');
        this.cdr.markForCheck();
      },
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadLogs();
  }

  openDetail(log: ActivityLogItemDto): void {
    this.selectedLog = log;
    this.displayModal = true;
    this.cdr.markForCheck();
  }

  getActionSeverity(action: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (action.includes('CREATED') || action.includes('SUCCESS')) return 'success';
    if (action.includes('CANCELLED') || action.includes('FAILED')) return 'danger';
    if (action.includes('UPDATED')) return 'warn';
    return 'info';
  }
}
