import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';

export type PageHeaderBadgeSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'spt-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, TagModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  /** Título principal de la cabecera */
  @Input({ required: true }) title!: string;

  /** Subtítulo o descripción contextual */
  @Input() subtitle?: string;

  /** Icono de PrimeNG opcional antes del título (ej: 'pi pi-history') */
  @Input() icon?: string;

  /** Ruta de retorno opcional para navegación jerárquica (ej: '/admin/facilities') */
  @Input() backUrl?: string;

  /** Texto o clave traducida del enlace de retorno */
  @Input() backLabel?: string;

  /** Badge opcional de contexto o entidad (ej: '— Pista 1 Central') */
  @Input() badgeText?: string;

  /** Severidad visual del badge opcional */
  @Input() badgeSeverity: PageHeaderBadgeSeverity = 'info';
}
