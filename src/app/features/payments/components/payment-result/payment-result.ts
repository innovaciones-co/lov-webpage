import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderResponse } from '../../models/order.model';
import { OrderStatusService } from '../../services/order-status.service';

@Component({
    selector: 'app-payment-result',
    imports: [CurrencyPipe],
    templateUrl: './payment-result.html',
    styleUrl: './payment-result.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentResultComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private orderStatusService = inject(OrderStatusService);

    order = signal<OrderResponse | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);

    ngOnInit(): void {
        this.processPaymentResponse();
    }

    private processPaymentResponse(): void {
        try {
            const queryParams = this.route.snapshot.queryParams;
            const referenceCode = queryParams['referenceCode'];

            if (!referenceCode) {
                this.error.set('No se encontró el código de referencia en la respuesta del pago.');
                this.isLoading.set(false);
                return;
            }

            // Check order status immediately
            this.checkOrderStatus(referenceCode);
        } catch (error) {
            console.error('Error processing payment response:', error);
            this.error.set('Error procesando la respuesta del pago. Por favor contacta soporte.');
            this.isLoading.set(false);
        }
    }

    private checkOrderStatus(referenceCode: string): void {
        this.orderStatusService.checkOrderStatus(referenceCode).subscribe({
            next: (order: OrderResponse) => {
                this.order.set(order);
                this.isLoading.set(false);
                this.error.set(null);
            },
            error: (error) => {
                console.error('Error checking order status:', error);
                this.error.set('Error verificando el estado del pedido.');
                this.isLoading.set(false);
            }
        });
    }

    onCheckStatus(): void {
        const queryParams = this.route.snapshot.queryParams;
        const referenceCode = queryParams['referenceCode'];
        if (referenceCode) {
            this.isLoading.set(true);
            this.checkOrderStatus(referenceCode);
        }
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
