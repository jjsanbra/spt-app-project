import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

export interface ConfirmActionOptions {
  headerKey?: string;
  messageKey: string;
  messageParams?: Record<string, unknown>;
  icon?: string;
  acceptLabelKey?: string;
  rejectLabelKey?: string;
  severity?: 'primary' | 'danger' | 'warn' | 'secondary';
  onAccept: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
}

export interface ConfirmDeleteOptions {
  headerKey?: string;
  messageKey?: string;
  messageParams?: Record<string, unknown>;
  acceptLabelKey?: string;
  rejectLabelKey?: string;
  onAccept: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);

  /**
   * Diálogo modal de confirmación para acciones críticas / destructivas (borrado)
   */
  confirmDelete(options: ConfirmDeleteOptions): void {
    const header = this.translate.instant(
      options.headerKey || 'COMMON.CONFIRM_DELETE_TITLE'
    );
    const message = this.translate.instant(
      options.messageKey || 'COMMON.CONFIRM_DELETE_MSG',
      options.messageParams
    );
    const acceptLabel = this.translate.instant(
      options.acceptLabelKey || 'COMMON.DELETE'
    );
    const rejectLabel = this.translate.instant(
      options.rejectLabelKey || 'COMMON.CANCEL'
    );

    this.confirmationService.confirm({
      header,
      message,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel,
      rejectLabel,
      acceptButtonProps: {
        severity: 'danger',
      },
      rejectButtonProps: {
        severity: 'secondary',
        text: true,
      },
      accept: () => {
        options.onAccept();
      },
      reject: () => {
        options.onReject?.();
      },
    });
  }

  /**
   * Diálogo modal de confirmación genérico para cualquier acción interactiva
   */
  confirm(options: ConfirmActionOptions): void {
    const header = options.headerKey
      ? this.translate.instant(options.headerKey)
      : this.translate.instant('COMMON.CONFIRM_TITLE');
    const message = this.translate.instant(options.messageKey, options.messageParams);
    const acceptLabel = this.translate.instant(
      options.acceptLabelKey || 'COMMON.ACCEPT'
    );
    const rejectLabel = this.translate.instant(
      options.rejectLabelKey || 'COMMON.CANCEL'
    );

    this.confirmationService.confirm({
      header,
      message,
      icon: options.icon || 'pi pi-info-circle',
      acceptLabel,
      rejectLabel,
      acceptButtonProps: {
        severity: options.severity || 'primary',
      },
      rejectButtonProps: {
        severity: 'secondary',
        text: true,
      },
      accept: () => {
        options.onAccept();
      },
      reject: () => {
        options.onReject?.();
      },
    });
  }

  /**
   * Cierra el diálogo activo si está abierto
   */
  close(): void {
    this.confirmationService.close();
  }
}
