import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { OrderResponse } from '../../models/order.model';
import { OrderStatusService } from '../../services/order-status.service';

@Component({
    selector: 'app-payment-result',
    imports: [CurrencyPipe],
    templateUrl: './payment-result.html',
    styleUrl: './payment-result.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentResultComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private orderStatusService = inject(OrderStatusService);

    private referenceCode = signal<string | null>(
        this.route.snapshot.queryParams['referenceCode'] ?? null
    );

    isLoading = signal(true);
    error = signal<string | null>(null);
    order: WritableSignal<OrderResponse | null> = signal(null);

    ngOnInit(): void {
        const ref = this.referenceCode();
        if (ref) {
            this.fetchOrder(ref);
        } else {
            this.isLoading.set(false);
        }
    }

    // 🔁 Refresh manually
    onCheckStatus(): void {
        const ref = this.referenceCode();
        if (!ref) return;

        this.error.set(null);
        this.fetchOrder(ref);
    }

    private fetchOrder(referenceCode: string): void {
        this.isLoading.set(true);
        this.orderStatusService.checkOrderStatus(referenceCode).pipe(
            catchError(err => {
                console.error(err);
                this.error.set('Error verificando el estado del pedido.');
                return of(null);
            }),
            finalize(() => this.isLoading.set(false))
        ).subscribe(order => this.order.set(order));
    }

    // Helper methods for template
    getStatusDisplayText(status: string): string {
        return this.orderStatusService.getStatusDisplayText(status as any);
    }

    getStatusColorClass(status: string): string {
        return this.orderStatusService.getStatusColorClass(status as any);
    }

    isSuccessStatus(status: string): boolean {
        return this.orderStatusService.isSuccessStatus(status as any);
    }

    isFailureStatus(status: string): boolean {
        return this.orderStatusService.isFailureStatus(status as any);
    }

    isProcessingStatus(status: string): boolean {
        return this.orderStatusService.isProcessingStatus(status as any);
    }

    onGoToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    onDownloadReceipt(): void {
        const order = this.order();
        if (order?.transactionId) {
            // TODO: Implement receipt download
            console.log('Download receipt for transaction:', order.transactionId);
        }
    }

    onRetryPayment(): void {
        const order = this.order();
        if (order?.referenceCode) {
            console.log('Retry payment for reference:', order.referenceCode);
            this.router.navigate(['/pagos']);
        }
    }

    onContactSupport(): void {
        const order = this.order();
        if (order) {
            console.log('Contact support for order:', order);
            this.router.navigate(['/soporte'], {
                queryParams: {
                    transactionId: order.transactionId,
                    referenceCode: order.referenceCode
                }
            });
        }
    }

    onGoHome(): void {
        this.router.navigate(['/']);
    }
}
