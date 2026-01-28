import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
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

    /** ✅ Order driven by observable → signal */
    order = toSignal(
        this.referenceCode()
            ? this.orderStatusService.checkOrderStatus(this.referenceCode()!)
                .pipe(
                    catchError(err => {
                        console.error(err);
                        this.error.set('Error verificando el estado del pedido.');
                        return of(null);
                    }),
                    finalize(() => this.isLoading.set(false))
                )
            : of(null),
        { initialValue: null }
    );

    // 🔁 Refresh manually
    onCheckStatus(): void {
        const ref = this.referenceCode();
        if (!ref) return;

        this.isLoading.set(true);
        this.error.set(null);

        this.order = toSignal(
            this.orderStatusService.checkOrderStatus(ref),
            { initialValue: null }
        );
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
