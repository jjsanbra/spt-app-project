import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

export interface NotificationOptions {
  detailKey: string;
  summaryKey?: string;
  params?: Record<string, unknown>;
  life?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  /**
   * Notificación de éxito (verde)
   * @param detailKey Clave i18n o texto del mensaje
   * @param summaryKey Clave i18n del título (opcional, por defecto COMMON.SUCCESS)
   * @param params Parámetros dinámicos para la interpolación de traducción
   * @param life Duración en ms (por defecto 4000ms)
   */
  success(
    detailKey: string,
    summaryKey: string = 'COMMON.SUCCESS',
    params?: Record<string, unknown>,
    life: number = 4000
  ): void {
    this.show('success', detailKey, summaryKey, params, life);
  }

  /**
   * Notificación de error (rojo)
   * @param detailKey Clave i18n o texto del mensaje
   * @param summaryKey Clave i18n del título (opcional, por defecto COMMON.ERROR)
   * @param params Parámetros dinámicos para la interpolación de traducción
   * @param life Duración en ms (por defecto 6000ms)
   */
  error(
    detailKey: string,
    summaryKey: string = 'COMMON.ERROR',
    params?: Record<string, unknown>,
    life: number = 6000
  ): void {
    this.show('error', detailKey, summaryKey, params, life);
  }

  /**
   * Notificación de advertencia (ámbar)
   * @param detailKey Clave i18n o texto del mensaje
   * @param summaryKey Clave i18n del título (opcional, por defecto COMMON.WARN)
   * @param params Parámetros dinámicos para la interpolación de traducción
   * @param life Duración en ms (por defecto 5000ms)
   */
  warn(
    detailKey: string,
    summaryKey: string = 'COMMON.WARN',
    params?: Record<string, unknown>,
    life: number = 5000
  ): void {
    this.show('warn', detailKey, summaryKey, params, life);
  }

  /**
   * Notificación informativa (azul)
   * @param detailKey Clave i18n o texto del mensaje
   * @param summaryKey Clave i18n del título (opcional, por defecto COMMON.INFO)
   * @param params Parámetros dinámicos para la interpolación de traducción
   * @param life Duración en ms (por defecto 4000ms)
   */
  info(
    detailKey: string,
    summaryKey: string = 'COMMON.INFO',
    params?: Record<string, unknown>,
    life: number = 4000
  ): void {
    this.show('info', detailKey, summaryKey, params, life);
  }

  /**
   * Limpia todas las notificaciones activas
   */
  clear(): void {
    this.messageService.clear();
  }

  private show(
    severity: 'success' | 'error' | 'warn' | 'info',
    detailKey: string,
    summaryKey: string,
    params?: Record<string, unknown>,
    life?: number
  ): void {
    const summary = this.translate.instant(summaryKey);
    const detail = this.translate.instant(detailKey, params);

    this.messageService.add({
      severity,
      summary,
      detail,
      life,
    });
  }
}
