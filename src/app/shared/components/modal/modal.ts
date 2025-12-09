import { Component, input, output, signal, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { flatMap } from 'rxjs';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.modal-open]': 'isOpen()'
  }
})
export class Modal {
  private document = inject(DOCUMENT);

  // Inputs
  isOpen = input<boolean>(false);
  title = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  closable = input<boolean>(true);
  showHeader = input<boolean>(false);
  showFooter = input<boolean>(false);

  // Outputs
  closed = output<void>();
  opened = output<void>();

  // Internal state
  private previousActiveElement = signal<Element | null>(null);

  constructor() {
    // Effect para manejar el estado del body cuando se abre/cierra el modal
    effect(() => {
      if (this.isOpen()) {
        this.onModalOpen();
      } else {
        this.onModalClose();
      }
    });
  }

  onBackdropClick(event: Event): void {
    if (this.closable()) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.closed.emit();
  }

  private onModalOpen(): void {
    // Guardar el elemento activo actual
    this.previousActiveElement.set(this.document.activeElement);

    // Prevenir scroll del body
    this.document.body.style.overflow = 'hidden';

    // Enfocar el modal
    setTimeout(() => {
      const modalElement = this.document.querySelector('.modal-content');
      if (modalElement instanceof HTMLElement) {
        modalElement.focus();
      }
    });

    this.opened.emit();
  }

  private onModalClose(): void {
    // Restaurar scroll del body
    this.document.body.style.overflow = '';

    // Restaurar foco al elemento anterior
    const prevElement = this.previousActiveElement();
    if (prevElement instanceof HTMLElement) {
      prevElement.focus();
    }
  }
}
