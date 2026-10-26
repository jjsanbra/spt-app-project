import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  BookingsService,
  ConfirmDialogService,
  NotificationService,
  OpenMatchResponseDto,
  OpenMatchResponseDtoSportType as SportType,
  PageHeaderComponent,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-open-matches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    CurrencyPipe,
    DatePipe,
    PageHeaderComponent,
    ButtonModule,
    SelectModule,
    TagModule,
  ],
  templateUrl: './open-matches.component.html',
  styleUrls: ['./open-matches.component.scss'],
})
export class OpenMatchesComponent implements OnInit {
  private readonly bookingsService = inject(BookingsService);
  private readonly notify = inject(NotificationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  matches: OpenMatchResponseDto[] = [];
  loading = false;
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedSport: SportType | 'ALL' = 'ALL';

  get sportOptions() {
    return [
      { label: this.translate.instant('PORTAL.OPEN_MATCHES.FILTER_ALL_SPORTS'), value: 'ALL' },
      { label: this.translate.instant('SPORTS.PADEL'), value: SportType.PADEL },
      { label: this.translate.instant('SPORTS.TENNIS'), value: SportType.TENNIS },
      { label: this.translate.instant('SPORTS.FUTSAL'), value: SportType.FUTSAL },
      { label: this.translate.instant('SPORTS.BASKETBALL'), value: SportType.BASKETBALL },
      { label: this.translate.instant('SPORTS.PICKLEBALL'), value: SportType.PICKLEBALL },
      { label: this.translate.instant('SPORTS.SQUASH'), value: SportType.SQUASH },
      { label: this.translate.instant('SPORTS.BADMINTON'), value: SportType.BADMINTON },
      { label: this.translate.instant('SPORTS.VOLLEYBALL'), value: SportType.VOLLEYBALL },
      { label: this.translate.instant('SPORTS.BEACH_VOLLEY'), value: SportType.BEACH_VOLLEY },
      { label: this.translate.instant('SPORTS.FRONTON'), value: SportType.FRONTON },
      { label: this.translate.instant('SPORTS.INDOOR_FRONTON'), value: SportType.INDOOR_FRONTON },
      { label: this.translate.instant('SPORTS.HANDBALL'), value: SportType.HANDBALL },
      { label: this.translate.instant('SPORTS.TABLE_TENNIS'), value: SportType.TABLE_TENNIS },
      { label: this.translate.instant('SPORTS.CLIMBING_WALL'), value: SportType.CLIMBING_WALL },
    ];
  }

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const sportParam = this.selectedSport === 'ALL' ? undefined : (this.selectedSport as SportType);

    this.bookingsService
      .bookingsControllerFindOpenMatches({
        date: this.selectedDate,
        sportType: sportParam as any,
      })
      .subscribe({
        next: (data) => {
          this.matches = data;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.notify.error('ERRORS.SERVER_ERROR');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  setQuickDate(offsetDays: number): void {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    this.selectedDate = target.toISOString().split('T')[0];
    this.loadMatches();
  }

  onSportChange(): void {
    this.loadMatches();
  }

  confirmJoinMatch(match: OpenMatchResponseDto): void {
    const dateFormatted = new Date(match.startTime).toLocaleDateString();
    const timeFormatted = new Date(match.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const priceFormatted = `${match.pricePerPlayer.toFixed(2)} €`;

    this.confirmService.confirm({
      headerKey: 'PORTAL.OPEN_MATCHES.CONFIRM_JOIN_TITLE',
      messageKey: 'PORTAL.OPEN_MATCHES.CONFIRM_JOIN_MSG',
      messageParams: {
        facility: match.facilityName,
        date: dateFormatted,
        time: timeFormatted,
        price: priceFormatted,
      },
      severity: 'primary',
      onAccept: () => {
        this.bookingsService.bookingsControllerJoinOpenMatch(match.id).subscribe({
          next: () => {
            this.notify.success('PORTAL.OPEN_MATCHES.SUCCESS_JOIN');
            this.loadMatches();
            this.cdr.markForCheck();
          },
          error: (err) => {
            if (err?.status === 409) {
              this.notify.warn('PORTAL.OPEN_MATCHES.FULL_MATCH');
            } else {
              this.notify.error('ERRORS.SERVER_ERROR');
            }
            this.cdr.markForCheck();
          },
        });
      },
    });
  }

  confirmLeaveMatch(match: OpenMatchResponseDto): void {
    this.confirmService.confirm({
      headerKey: 'PORTAL.OPEN_MATCHES.CONFIRM_LEAVE_TITLE',
      messageKey: 'PORTAL.OPEN_MATCHES.CONFIRM_LEAVE_MSG',
      severity: 'danger',
      onAccept: () => {
        this.bookingsService.bookingsControllerLeaveOpenMatch(match.id).subscribe({
          next: () => {
            this.notify.success('PORTAL.OPEN_MATCHES.SUCCESS_LEAVE');
            this.loadMatches();
            this.cdr.markForCheck();
          },
          error: () => {
            this.notify.error('ERRORS.SERVER_ERROR');
            this.cdr.markForCheck();
          },
        });
      },
    });
  }

  getEmptySlotsCount(match: OpenMatchResponseDto): number[] {
    const emptyCount = Math.max(0, match.maxPlayers - match.occupiedSlots);
    return Array.from({ length: emptyCount }, (_, i) => i);
  }
}
