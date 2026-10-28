import { Injectable, computed, signal } from '@angular/core';

/**
 * LoadingService — Control centralizado del estado de carga global de la aplicación.
 * Utiliza Signals reactivas con contador de peticiones/operaciones concurrentes.
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _activeCount = signal<number>(0);

  /** Indica si hay operaciones activas (navegación o peticiones HTTP) */
  readonly isLoading = computed(() => this._activeCount() > 0);

  /** Número actual de peticiones/operaciones activas */
  readonly activeCount = computed(() => this._activeCount());

  /** Incrementa el contador de operaciones activas */
  show(): void {
    this._activeCount.update((count) => count + 1);
  }

  /** Decrementa el contador de operaciones activas (mínimo 0) */
  hide(): void {
    this._activeCount.update((count) => Math.max(0, count - 1));
  }

  /** Fuerza el reinicio a cero en caso de cancelaciones o errores */
  reset(): void {
    this._activeCount.set(0);
  }
}

