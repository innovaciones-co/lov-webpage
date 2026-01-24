import { Component, input, computed, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentStatus, PurchaseStatus } from '../../models/payment-response.model';

@Component({
  selector: 'app-purchase-status',
  imports: [NgClass],
  templateUrl: './purchase-status.html',
  styleUrl: './purchase-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseStatusComponent {
  purchaseStatus = input.required<PurchaseStatus>();
  
  // Events
  goToDashboard = output<void>();
  downloadReceipt = output<string>();
  retryPayment = output<string>();
  contactSupport = output<PurchaseStatus>();
  checkStatus = output<string>();
  goHome = output<void>();

  private router = inject(Router);

  statusConfig = computed(() => {
    const status = this.purchaseStatus().status;
    
    switch (status) {
      case PaymentStatus.APPROVED:
        return {
          icon: 'check_circle',
          title: '¡Pago exitoso!',
          description: 'Tu compra se ha procesado correctamente',
          class: 'success',
          showDetails: true
        };
      case PaymentStatus.DECLINED:
        return {
          icon: 'cancel',
          title: 'Pago rechazado',
          description: 'No se pudo procesar tu pago. Intenta con otro método de pago.',
          class: 'error',
          showDetails: true
        };
      case PaymentStatus.PENDING:
        return {
          icon: 'pending',
          title: 'Pago pendiente',
          description: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
          class: 'warning',
          showDetails: true
        };
      case PaymentStatus.ERROR:
        return {
          icon: 'error',
          title: 'Error en el pago',
          description: 'Ocurrió un error durante el proceso. Por favor intenta nuevamente.',
          class: 'error',
          showDetails: false
        };
      case PaymentStatus.EXPIRED:
        return {
          icon: 'schedule',
          title: 'Pago expirado',
          description: 'La sesión de pago ha expirado. Por favor inicia el proceso nuevamente.',
          class: 'warning',
          showDetails: false
        };
      default:
        return {
          icon: 'help',
          title: 'Estado desconocido',
          description: 'No se pudo determinar el estado del pago.',
          class: 'neutral',
          showDetails: false
        };
    }
  });

  formattedAmount = computed(() => {
    const purchase = this.purchaseStatus();
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: purchase.currency,
      minimumFractionDigits: 0
    }).format(purchase.amount);
  });

  formattedDate = computed(() => {
    const dateStr = this.purchaseStatus().processingDate;
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  });

  // Action methods
  onGoToDashboard(): void {
    this.goToDashboard.emit();
  }

  onDownloadReceipt(): void {
    this.downloadReceipt.emit(this.purchaseStatus().transactionId);
  }

  onRetryPayment(): void {
    this.retryPayment.emit(this.purchaseStatus().referenceCode);
  }

  onContactSupport(): void {
    this.contactSupport.emit(this.purchaseStatus());
  }

  onCheckStatus(): void {
    this.checkStatus.emit(this.purchaseStatus().transactionId);
  }

  onGoHome(): void {
    this.goHome.emit();
  }

  // Expose enum to template
  PaymentStatus = PaymentStatus;
}